<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('pedidos as o')
            ->join('usuarios as u', 'u.id', '=', 'o.id_usuario')
            ->select('o.*', 'u.usuario as buyer_name');
        if ((int) $request->user()->id_tipo !== 1) {
            $query->where('o.id_usuario', $request->user()->id);
        }
        if ($request->filled('estado')) {
            $query->where('o.estado', $request->string('estado')->toString());
        }
        $orders = $query->orderByDesc('o.id')->paginate(30);
        $ids = collect($orders->items())->pluck('id');
        $details = DB::table('detalles_pedido as d')
            ->join('productos as p', 'p.id', '=', 'd.id_producto')
            ->whereIn('d.id_pedido', $ids)
            ->select('d.id as detalle_id', 'd.id_pedido', 'd.estado_envio', 'd.recibido_confirmado_at', 'p.id', 'p.nombre', 'p.imagen', 'p.precio', 'p.id_tipo', 'p.id_usuario as seller_id')
            ->get()->groupBy('id_pedido');
        foreach ($orders->items() as $order) {
            $order->productos = $details->get($order->id, collect())->values();
            $order->estado = $this->overallStatus($order->productos, $order->estado);
        }
        return response()->json($orders);
    }

    /** Pedidos que contienen productos vendidos por el usuario autenticado. */
    public function received(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        abort_unless(in_array((int) $request->user()->id_tipo, [1, 3, 5], true), 403, 'Tu cuenta no puede recibir pedidos.');

        $query = DB::table('pedidos as o')
            ->join('detalles_pedido as d', 'd.id_pedido', '=', 'o.id')
            ->join('productos as p', 'p.id', '=', 'd.id_producto')
            ->join('usuarios as u', 'u.id', '=', 'o.id_usuario')
            ->where('p.id_usuario', $userId)
            ->select('o.id', 'o.nombre', 'o.estado', 'o.direccion', 'o.telefono', 'o.pago', 'u.usuario as buyer_name')
            ->distinct()->orderByDesc('o.id');

        $orders = $query->paginate(30);
        $ids = collect($orders->items())->pluck('id');
        $details = DB::table('detalles_pedido as d')
            ->join('productos as p', 'p.id', '=', 'd.id_producto')
            ->whereIn('d.id_pedido', $ids)
            ->where('p.id_usuario', $userId)
            ->select('d.id as detalle_id', 'd.id_pedido', 'd.estado_envio', 'd.recibido_confirmado_at', 'p.id', 'p.nombre', 'p.imagen', 'p.precio', 'p.id_tipo', 'p.id_usuario as seller_id')
            ->get()->groupBy('id_pedido');

        foreach ($orders->items() as $order) {
            $order->productos = $details->get($order->id, collect())->values();
            $order->total_vendedor = (float) $order->productos->sum(fn ($product) => (float) $product->precio);
            $order->estado = $this->overallStatus($order->productos, $order->estado);
        }
        return response()->json($orders);
    }

    public function checkout(Request $request): JsonResponse
    {
        $data=$request->validate(['nombre'=>['required','string','max:255'],'direccion'=>['required','string','max:255'],'telefono'=>['required','string','max:32']]);
        $data['telefono']=preg_replace('/\D+/', '', $data['telefono']);
        abort_unless(preg_match('/^[0-9]{9}$/',$data['telefono'])===1,422,'El teléfono debe tener 9 dígitos.');
        $userId=$request->user()->id;
        $order=DB::transaction(function() use($userId,$data) {
            $cart=DB::table('cesta')->where('id_usuario',$userId)->first();
            abort_unless($cart,422,'La cesta está vacía.');
            $items=DB::table('cesta_producto as cp')->join('productos as p','p.id','=','cp.id_producto')->where('cp.id_cesta',$cart->id)->lockForUpdate()->select('p.*')->get();
            abort_if($items->isEmpty(),422,'La cesta está vacía.');
            foreach($items as $item) abort_if((int)$item->cantidad<1,422,'Uno de los productos ya no está disponible.');
            $subtotal=(float)$items->sum(fn($item)=>(float)$item->precio);
            $shipping=$items->contains(fn($item)=>(int)$item->id_tipo===1)?4.0:0.0;
            $orderId=DB::table('pedidos')->insertGetId(['id_usuario'=>$userId,'nombre'=>$data['nombre'],'estado'=>'preparando','direccion'=>$data['direccion'],'telefono'=>$data['telefono'],'pago'=>$subtotal+$shipping]);
            foreach($items as $item) {
                DB::table('detalles_pedido')->insert(['id_pedido'=>$orderId,'id_producto'=>$item->id]);
                DB::table('productos')->where('id',$item->id)->where('cantidad','>',0)->decrement('cantidad');
            }
            DB::table('cesta_producto')->where('id_cesta',$cart->id)->delete();
            return DB::table('pedidos')->find($orderId);
        });
        return response()->json(['order'=>$order,'message'=>'Pedido creado.'],201);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $isAdmin = (int) $user->id_tipo === 1;
        $isSeller = in_array((int) $user->id_tipo, [3, 5], true);
        abort_unless($isAdmin || $isSeller, 403, 'No tienes permiso para cambiar el estado.');
        $allowedStates = $isAdmin ? 'preparando,enviado,entregado,cancelado' : 'preparando,enviado,entregado';
        $data = $request->validate(['estado' => ['required', 'in:' . $allowedStates]]);

        DB::transaction(function () use ($id, $data, $user, $isAdmin): void {
            $order = DB::table('pedidos')->where('id', $id)->lockForUpdate()->first();
            abort_unless($order, 404);
            $detailsQuery = DB::table('detalles_pedido as d')->join('productos as p', 'p.id', '=', 'd.id_producto')->where('d.id_pedido', $id);
            if (!$isAdmin) {
                $detailsQuery->where('p.id_usuario', $user->id);
            }
            $detailIds = $detailsQuery->pluck('d.id');
            abort_unless($isAdmin || $detailIds->isNotEmpty(), 403, 'Este pedido no contiene productos tuyos.');
            abort_if($order->estado === 'cancelado', 422, 'El pedido está cancelado.');
            if ($data['estado'] !== 'entregado') {
                abort_if(DB::table('detalles_pedido')->whereIn('id', $detailIds)->whereNotNull('recibido_confirmado_at')->exists(), 422, 'El comprador ya confirmó la recepción; no se puede retroceder el estado.');
            }
            abort_if($order->estado === 'entregado' && $data['estado'] === 'cancelado', 422, 'No se puede cancelar un pedido entregado.');

            if ($isAdmin && $data['estado'] === 'cancelado' && $order->estado !== 'cancelado') {
                foreach (DB::table('detalles_pedido')->where('id_pedido', $id)->pluck('id_producto') as $productId) {
                    DB::table('productos')->where('id', $productId)->increment('cantidad');
                }
                DB::table('pedidos')->where('id', $id)->update(['estado' => 'cancelado']);
                return;
            }

            DB::table('detalles_pedido')->whereIn('id', $detailIds)->update([
                'estado_envio' => $data['estado'],
                // Si el vendedor cambia el estado después de entregarlo, la confirmación deja de ser válida.
                'recibido_confirmado_at' => $data['estado'] === 'entregado' ? DB::raw('recibido_confirmado_at') : null,
            ]);
            $this->syncOrderStatus($id);
        });

        return response()->json(DB::table('pedidos')->find($id));
    }

    /** El comprador confirma la recepción de un artículo concreto. */
    public function confirmReceived(Request $request, int $id, int $detail): JsonResponse
    {
        DB::transaction(function () use ($request, $id, $detail): void {
            $order = DB::table('pedidos')->where('id', $id)->lockForUpdate()->first();
            abort_unless($order, 404);
            abort_unless((int) $order->id_usuario === (int) $request->user()->id || (int) $request->user()->id_tipo === 1, 403, 'Solo el comprador puede confirmar la recepción.');
            abort_if($order->estado === 'cancelado', 422, 'El pedido está cancelado.');
            $item = DB::table('detalles_pedido')->where('id', $detail)->where('id_pedido', $id)->first();
            abort_unless($item, 404, 'El artículo no pertenece a este pedido.');
            abort_unless($item->estado_envio === 'entregado', 422, 'El vendedor todavía no ha marcado este artículo como entregado.');
            abort_if($item->recibido_confirmado_at !== null, 422, 'La recepción de este artículo ya está confirmada.');
            DB::table('detalles_pedido')->where('id', $detail)->update(['recibido_confirmado_at' => now()]);
            $this->syncOrderStatus($id);
        });
        return response()->json(DB::table('pedidos')->find($id));
    }

    private function overallStatus($products, string $fallback = 'preparando'): string
    {
        if ($fallback === 'cancelado') return 'cancelado';
        if ($products->isEmpty()) return $fallback;
        if ($products->every(fn ($p) => ($p->estado_envio ?? 'preparando') === 'entregado' && !empty($p->recibido_confirmado_at))) return 'entregado';
        $allSellerDelivered = $products->every(fn ($p) => ($p->estado_envio ?? 'preparando') === 'entregado');
        if ($allSellerDelivered) return 'pendiente_confirmacion';
        if ($products->contains(fn ($p) => ($p->estado_envio ?? 'preparando') === 'entregado')) return 'entrega_parcial';
        if ($products->contains(fn ($p) => ($p->estado_envio ?? 'preparando') === 'enviado')) return 'enviado';
        return 'preparando';
    }

    private function syncOrderStatus(int $id): void
    {
        $order = DB::table('pedidos')->where('id', $id)->first();
        if (!$order || $order->estado === 'cancelado') return;
        $products = DB::table('detalles_pedido as d')->where('d.id_pedido', $id)->select('d.estado_envio', 'd.recibido_confirmado_at')->get();
        DB::table('pedidos')->where('id', $id)->update(['estado' => $this->overallStatus($products, $order->estado)]);
    }

    public function update(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['nombre'=>['sometimes','required','string','max:255'],'direccion'=>['sometimes','required','string','max:255'],'telefono'=>['sometimes','required','string','max:32']]);
        abort_unless(DB::table('pedidos')->where('id',$id)->exists(),404);
        DB::table('pedidos')->where('id',$id)->update($data);
        return response()->json(DB::table('pedidos')->find($id));
    }

    public function destroy(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        DB::transaction(function() use($id):void {
            $order=DB::table('pedidos')->where('id',$id)->lockForUpdate()->first();abort_unless($order,404);
            if($order->estado!=='cancelado') foreach(DB::table('detalles_pedido')->where('id_pedido',$id)->pluck('id_producto') as $productId) DB::table('productos')->where('id',$productId)->increment('cantidad');
            DB::table('detalles_pedido')->where('id_pedido',$id)->delete();
            DB::table('pedidos')->where('id',$id)->delete();
        });
        return response()->json(['message'=>'Pedido eliminado.']);
    }

    public function download(Request $request,int $id,int $product)
    {
        $order=DB::table('pedidos')->find($id); abort_unless($order,404);
        abort_unless((int)$order->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        abort_if($order->estado==='cancelado',403,'El pedido está cancelado.');
        abort_unless(DB::table('detalles_pedido as d')->join('productos as p','p.id','=','d.id_producto')->where('d.id_pedido',$id)->where('p.id',$product)->where('p.id_tipo',2)->exists(),404);
        $path=DB::table('productos')->where('id',$product)->value('archivos');
        abort_unless($path && $path!=='Sin archivos' && !str_contains($path,'..') && Storage::disk('local')->exists($path),404,'El archivo digital no está disponible.');
        return Storage::disk('local')->download($path);
    }

    public function refund(Request $request,int $id): JsonResponse
    {
        $order=DB::table('pedidos')->find($id); abort_unless($order,404);
        abort_unless((int)$order->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        DB::transaction(function() use($id) {
            $locked=DB::table('pedidos')->where('id',$id)->lockForUpdate()->first(); abort_unless($locked,404);
            abort_if($locked->estado==='entregado',422,'No se puede cancelar un pedido entregado.');
            abort_if($locked->estado==='cancelado',422,'Este pedido ya está cancelado.');
            $productIds=DB::table('detalles_pedido')->where('id_pedido',$id)->pluck('id_producto');
            foreach($productIds as $productId) DB::table('productos')->where('id',$productId)->increment('cantidad');
            DB::table('pedidos')->where('id',$id)->update(['estado'=>'cancelado']);
        });
        return response()->json(['message'=>'Pedido cancelado y artículos devueltos al inventario.']);
    }
}
