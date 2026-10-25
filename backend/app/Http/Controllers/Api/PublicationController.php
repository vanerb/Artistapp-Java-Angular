<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\InAppNotifier;

class PublicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // The feed is public, so auth:sanctum middleware is intentionally not
        // applied. Resolve the optional bearer token directly to personalise likes.
        $viewer = $request->user('sanctum');
        $userId = $viewer?->id;
        $query = DB::table('publicaciones as p')
            ->leftJoin('usuarios as u', 'u.id', '=', 'p.id_usuario')
            ->leftJoin('categoria as c', 'c.id', '=', 'p.id_categoria')
            ->select('p.*', 'u.usuario as artist_name', 'u.imagen as artist_image', 'c.nombre as category_name')
            ->selectRaw('EXISTS(SELECT 1 FROM megusta m WHERE m.id_publicacion = p.id AND m.id_usuario = ? AND m.megusta = 1) AS liked_by_me', [$userId]);
        if ((int)$viewer?->id_tipo !== 1) $query->where('p.tipo', 'public');
        if ($request->filled('q')) $query->where(fn ($q) => $q->where('p.titulo', 'like', '%'.$request->string('q')->toString().'%')->orWhere('p.descripcion', 'like', '%'.$request->string('q')->toString().'%'));
        if ($request->filled('categoria')) $query->where('p.id_categoria', $request->integer('categoria'));
        return response()->json($query->orderByDesc('p.megusta')->orderByDesc('p.id')->paginate(24));
    }

    public function store(Request $request,InAppNotifier $notifier): JsonResponse
    {
        abort_unless(in_array((int)$request->user()->id_tipo,[1,3,5],true),403,'Solo artistas y organizadores pueden publicar obras.');
        $data = $request->validate(['titulo' => ['required','string','max:255'], 'descripcion' => ['required','string','max:255'], 'id_categoria' => ['required','integer','exists:categoria,id'], 'imagen' => ['nullable','image','max:8192']]);
        $image = $request->file('imagen')?->store('uploads/publicaciones', 'public') ?? '';
        $id = DB::table('publicaciones')->insertGetId(['titulo' => $data['titulo'], 'descripcion' => $data['descripcion'], 'tipo' => 'public', 'id_categoria' => $data['id_categoria'], 'id_usuario' => $request->user()->id, 'megusta' => 0, 'imagen' => $image]);
        $notifier->followers((int)$request->user()->id,'obra','Nueva obra de '.$request->user()->usuario,$data['titulo'],'/descubrir');
        return response()->json(DB::table('publicaciones')->find($id), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = DB::table('publicaciones')->find($id);
        abort_unless($post, 404);
        abort_unless((int)$post->id_usuario === (int)$request->user()->id || (int)$request->user()->id_tipo === 1, 403);
        $data = $request->validate(['titulo' => ['sometimes','required','string','max:255'], 'descripcion' => ['sometimes','required','string','max:255'], 'id_categoria' => ['sometimes','integer','exists:categoria,id'], 'imagen' => ['nullable','image','max:8192']]);
        if ($request->hasFile('imagen')) $data['imagen'] = $request->file('imagen')->store('uploads/publicaciones', 'public');
        unset($data['file']);
        DB::table('publicaciones')->where('id', $id)->update($data);
        return response()->json(DB::table('publicaciones')->find($id));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $post = DB::table('publicaciones')->find($id);
        abort_unless($post, 404);
        abort_unless((int)$post->id_usuario === (int)$request->user()->id || (int)$request->user()->id_tipo === 1, 403);
        DB::transaction(fn () => [DB::table('megusta')->where('id_publicacion', $id)->delete(), DB::table('publicaciones')->where('id', $id)->delete()]);
        return response()->json(['message' => 'Publicación eliminada.']);
    }

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        abort_unless(DB::table('publicaciones')->where('id', $id)->exists(), 404);
        $userId = $request->user()->id;
        return DB::transaction(function () use ($id, $userId): JsonResponse {
            $userLikes = DB::table('megusta')->where('id_usuario', $userId)->where('id_publicacion', $id);
            $liked = (clone $userLikes)->where('megusta', 1)->exists();
            if ($liked) {
                $userLikes->update(['megusta' => 0]);
            } else {
                $firstId = (clone $userLikes)->orderBy('id')->value('id');
                if ($firstId) {
                    $userLikes->update(['megusta' => 0]);
                    DB::table('megusta')->where('id', $firstId)->update(['megusta' => 1]);
                } else {
                    DB::table('megusta')->insert(['id_usuario' => $userId, 'id_publicacion' => $id, 'megusta' => 1]);
                }
                $liked = true;
            }
            $count = DB::table('megusta')->where('id_publicacion', $id)->where('megusta', 1)->distinct()->count('id_usuario');
            DB::table('publicaciones')->where('id', $id)->update(['megusta' => $count]);
            return response()->json(['liked' => $liked, 'count' => $count]);
        });
    }

    public function toggleVisibility(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        $post=DB::table('publicaciones')->find($id); abort_unless($post,404);
        $type=$post->tipo==='public'?'private':'public';
        DB::table('publicaciones')->where('id',$id)->update(['tipo'=>$type]);
        return response()->json(['tipo'=>$type]);
    }
}
