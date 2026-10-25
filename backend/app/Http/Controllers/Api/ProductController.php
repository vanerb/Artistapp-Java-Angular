<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WatermarkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('productos as p')
            ->join('usuarios as u', 'u.id', '=', 'p.id_usuario')
            ->leftJoin('tipo_producto as t', 't.id', '=', 'p.id_tipo')
            ->select(
                'p.id',
                'p.nombre',
                'p.descripcion',
                'p.precio',
                'p.cantidad',
                'p.imagen',
                'p.id_tipo',
                'p.id_usuario',
                'u.usuario as artist_name',
                'u.imagen as artist_image',
                't.nombre as type_name'
            );

        if ($request->filled('q')) {
            $search = (string) $request->input('q');

            $query->where(function ($q) use ($search) {
                $q->where('p.nombre', 'like', '%' . $search . '%')
                    ->orWhere('p.descripcion', 'like', '%' . $search . '%')
                    ->orWhere('u.usuario', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('tipo')) {
            $query->where('p.id_tipo', $request->integer('tipo'));
        }

        if ($request->filled('precio')) {
            $range = explode('-', (string) $request->input('precio'), 2);

            if (count($range) === 2 && is_numeric($range[0])) {
                if ($range[1] === '?') {
                    $query->where('p.precio', '>=', (float) $range[0]);
                } elseif (is_numeric($range[1])) {
                    $query->whereBetween('p.precio', [
                        (float) $range[0],
                        (float) $range[1],
                    ]);
                }
            }
        }

        if ($request->boolean('disponible')) {
            $query->where('p.cantidad', '>', 0);
        }

        return response()->json(
            $query->orderByDesc('p.id')->paginate(24)
        );
    }

    public function show(int $id): JsonResponse
    {
        $product = DB::table('productos as p')
            ->join('usuarios as u', 'u.id', '=', 'p.id_usuario')
            ->leftJoin('tipo_producto as t', 't.id', '=', 'p.id_tipo')
            ->select(
                'p.id',
                'p.nombre',
                'p.descripcion',
                'p.precio',
                'p.cantidad',
                'p.imagen',
                'p.id_tipo',
                'p.id_usuario',
                'u.usuario as artist_name',
                'u.imagen as artist_image',
                't.nombre as type_name'
            )
            ->where('p.id', $id)
            ->first();

        abort_unless($product, 404);

        return response()->json($product);
    }

    public function store(
        Request $request,
        WatermarkService $watermarkService
    ): JsonResponse {
        abort_unless(
            in_array((int) $request->user()->id_tipo, [1, 3, 5], true),
            403,
            'Solo artistas y organizadores pueden vender productos.'
        );

        $data = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
            'precio' => ['required', 'numeric', 'min:0.01'],
            'cantidad' => ['required', 'integer', 'min:0'],
            'id_tipo' => ['required', 'integer', 'in:1,2'],
            'imagen' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:8192',
            ],
            'archivo_digital' => ['nullable', 'file', 'max:51200'],
        ]);

        if ((int) $data['id_tipo'] === 2) {
            abort_unless(
                $request->hasFile('archivo_digital'),
                422,
                'Añade el archivo que recibirá el comprador.'
            );
        }

        $originalPath = null;
        $coverPath = null;
        $digitalPath = null;

        try {
            // Guarda el original sin modificar en el disco privado.
            $originalPath = $request->file('imagen')->store(
                'originales/productos',
                'local'
            );

            if ($originalPath === false) {
                throw new \RuntimeException(
                    'No se pudo guardar la imagen original.'
                );
            }

            // Genera una portada pública reducida y protegida.
            $coverPath = 'uploads/productos/' . Str::uuid() . '.jpg';

            $watermarkService->createCover(
                Storage::disk('local')->path($originalPath),
                $coverPath
            );

            if ($request->hasFile('archivo_digital')) {
                $digitalPath = $request->file('archivo_digital')->store(
                    'digital',
                    'local'
                );

                if ($digitalPath === false) {
                    throw new \RuntimeException(
                        'No se pudo guardar el archivo digital.'
                    );
                }
            }

            $data['id_usuario'] = $request->user()->id;
            $data['imagen'] = $coverPath;
            $data['imagen_original'] = $originalPath;
            $data['archivos'] = $digitalPath ?? 'Sin archivos';

            unset($data['archivo_digital']);

            $id = DB::table('productos')->insertGetId($data);
        } catch (\Throwable $exception) {
            if ($coverPath !== null) {
                Storage::disk('public')->delete($coverPath);
            }

            if ($originalPath !== null) {
                Storage::disk('local')->delete($originalPath);
            }

            if ($digitalPath !== null) {
                Storage::disk('local')->delete($digitalPath);
            }

            throw $exception;
        }

        // No se devuelve imagen_original ni la ruta del archivo digital.
        return response()->json(
            $this->findPublicProduct($id),
            201
        );
    }

    public function update(
        Request $request,
        int $id,
        WatermarkService $watermarkService
    ): JsonResponse {
        $product = DB::table('productos')->find($id);

        abort_unless($product, 404);

        abort_unless(
            (int) $product->id_usuario === (int) $request->user()->id
                || (int) $request->user()->id_tipo === 1,
            403
        );

        $data = $request->validate([
            'nombre' => ['sometimes', 'required', 'string', 'max:255'],
            'descripcion' => ['sometimes', 'required', 'string', 'max:255'],
            'precio' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'cantidad' => ['sometimes', 'required', 'integer', 'min:0'],
            'id_tipo' => ['sometimes', 'integer', 'in:1,2'],
            'imagen' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:8192',
            ],
            'archivo_digital' => [
                'sometimes',
                'nullable',
                'file',
                'max:51200',
            ],
        ]);

        $nextType = (int) ($data['id_tipo'] ?? $product->id_tipo);

        abort_if(
            $nextType === 2
                && !$request->hasFile('archivo_digital')
                && (
                    !$product->archivos
                    || $product->archivos === 'Sin archivos'
                ),
            422,
            'Añade el archivo que recibirá el comprador.'
        );

        $newOriginalPath = null;
        $newCoverPath = null;
        $newDigitalPath = null;

        try {
            if ($request->hasFile('imagen')) {
                $newOriginalPath = $request->file('imagen')->store(
                    'originales/productos',
                    'local'
                );

                if ($newOriginalPath === false) {
                    throw new \RuntimeException(
                        'No se pudo guardar la imagen original.'
                    );
                }

                $newCoverPath = 'uploads/productos/' . Str::uuid() . '.jpg';

                $watermarkService->createCover(
                    Storage::disk('local')->path($newOriginalPath),
                    $newCoverPath
                );

                $data['imagen'] = $newCoverPath;
                $data['imagen_original'] = $newOriginalPath;
            }

            if ($request->hasFile('archivo_digital')) {
                $newDigitalPath = $request->file('archivo_digital')->store(
                    'digital',
                    'local'
                );

                if ($newDigitalPath === false) {
                    throw new \RuntimeException(
                        'No se pudo guardar el archivo digital.'
                    );
                }

                $data['archivos'] = $newDigitalPath;
            }

            unset($data['archivo_digital']);

            if (!empty($data)) {
                DB::table('productos')
                    ->where('id', $id)
                    ->update($data);
            }
        } catch (\Throwable $exception) {
            if ($newCoverPath !== null) {
                Storage::disk('public')->delete($newCoverPath);
            }

            if ($newOriginalPath !== null) {
                Storage::disk('local')->delete($newOriginalPath);
            }

            if ($newDigitalPath !== null) {
                Storage::disk('local')->delete($newDigitalPath);
            }

            throw $exception;
        }

        // Elimina los archivos anteriores solo después de actualizar la BD.
        if ($newCoverPath !== null) {
            if (!empty($product->imagen)) {
                Storage::disk('public')->delete($product->imagen);
            }

            if (!empty($product->imagen_original)) {
                Storage::disk('local')->delete(
                    $product->imagen_original
                );
            }
        }

        if ($newDigitalPath !== null) {
            if (
                !empty($product->archivos)
                && $product->archivos !== 'Sin archivos'
            ) {
                Storage::disk('local')->delete($product->archivos);
            }
        }

        return response()->json(
            $this->findPublicProduct($id)
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = DB::table('productos')->find($id);

        abort_unless($product, 404);

        abort_unless(
            (int) $product->id_usuario === (int) $request->user()->id
                || (int) $request->user()->id_tipo === 1,
            403
        );

        abort_if(
            DB::table('detalles_pedido')
                ->where('id_producto', $id)
                ->exists(),
            422,
            'Este producto ya aparece en pedidos y no se puede borrar.'
        );

        DB::transaction(function () use ($id) {
            DB::table('cesta_producto')
                ->where('id_producto', $id)
                ->delete();

            DB::table('productos')
                ->where('id', $id)
                ->delete();
        });

        // Elimina los ficheros después de borrar el registro.
        if (!empty($product->imagen)) {
            Storage::disk('public')->delete($product->imagen);
        }

        if (!empty($product->imagen_original)) {
            Storage::disk('local')->delete($product->imagen_original);
        }

        if (
            !empty($product->archivos)
            && $product->archivos !== 'Sin archivos'
        ) {
            Storage::disk('local')->delete($product->archivos);
        }

        return response()->json([
            'message' => 'Producto eliminado.',
        ]);
    }

    /**
     * Devuelve únicamente los datos que pueden exponerse por la API.
     */
    private function findPublicProduct(int $id): object
    {
        $product = DB::table('productos as p')
            ->join('usuarios as u', 'u.id', '=', 'p.id_usuario')
            ->leftJoin('tipo_producto as t', 't.id', '=', 'p.id_tipo')
            ->select(
                'p.id',
                'p.nombre',
                'p.descripcion',
                'p.precio',
                'p.cantidad',
                'p.imagen',
                'p.id_tipo',
                'p.id_usuario',
                'u.usuario as artist_name',
                'u.imagen as artist_image',
                't.nombre as type_name'
            )
            ->where('p.id', $id)
            ->first();

        abort_unless($product, 404);

        return $product;
    }
}
