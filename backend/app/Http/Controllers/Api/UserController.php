<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArtistUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ArtistUser::query()->select(['id','nombre','apellidos','usuario','id_tipo','imagen','biografia']);
        // This endpoint is public, so resolve Sanctum explicitly to recognise
        // an optional bearer token and persist the followed state on refresh.
        $viewerId = $request->user('sanctum')?->id;
        if ($viewerId) {
            $query->selectRaw('EXISTS(SELECT 1 FROM favoritos f WHERE f.id_usuario = ? AND f.id_usuariopin = usuarios.id) AS followed_by_me', [$viewerId]);
            $query->where('usuarios.id', '!=', $viewerId);
        } else {
            $query->selectRaw('0 AS followed_by_me');
        }
        if ($request->filled('q')) $query->where(fn ($q) => $q->where('usuario','like','%'.$request->string('q').'%')->orWhere('nombre','like','%'.$request->string('q').'%'));
        if ($request->filled('tipo')) $query->where('id_tipo', $request->integer('tipo'));
        return response()->json($query->orderBy('usuario')->paginate(24));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = ArtistUser::query()->select(['id','nombre','apellidos','usuario','id_tipo','imagen','biografia'])->findOrFail($id);
        $perPage = 6;
        $worksPage = max(1, $request->integer('obras_page', 1));
        $noticesPage = max(1, $request->integer('avisos_page', 1));
        $eventsPage = max(1, $request->integer('eventos_page', 1));
        $works = DB::table('publicaciones')->where('id_usuario',$id)->where('tipo','public');
        $worksTotal = (clone $works)->count();
        $user->setAttribute('publicaciones', $works->orderByDesc('id')->offset(($worksPage-1)*$perPage)->limit($perPage)->get());
        $notices = DB::table('avisos')->where('id_usuario',$id);
        $noticesTotal = (clone $notices)->count();
        $user->setAttribute('avisos', $notices->orderByDesc('id')->offset(($noticesPage-1)*$perPage)->limit($perPage)->get());
        $events = DB::table('eventos')->where('id_usuario',$id);
        $eventsTotal = (clone $events)->count();
        $events->orderByDesc('fecha_inicio')->offset(($eventsPage-1)*$perPage)->limit($perPage);
        $viewer = $request->user('sanctum');
        if ($viewer) {
            $events->select('eventos.*')->selectSub(DB::table('listado_evento as mine')->select('mine.estado')
                ->whereColumn('mine.id_evento','eventos.id')->where('mine.id_usuario',$viewer->id)->limit(1), 'participation_status');
        }
        $user->setAttribute('eventos', $events->get());
        $user->setAttribute('pagination', [
            'obras'=>['page'=>$worksPage,'per_page'=>$perPage,'total'=>$worksTotal,'last_page'=>max(1,(int)ceil($worksTotal/$perPage))],
            'avisos'=>['page'=>$noticesPage,'per_page'=>$perPage,'total'=>$noticesTotal,'last_page'=>max(1,(int)ceil($noticesTotal/$perPage))],
            'eventos'=>['page'=>$eventsPage,'per_page'=>$perPage,'total'=>$eventsTotal,'last_page'=>max(1,(int)ceil($eventsTotal/$perPage))],
        ]);
        $user->setAttribute('fijado', $viewer ? DB::table('favoritos')->where('id_usuario',$viewer->id)->where('id_usuariopin',$id)->exists() : false);
        $user->setAttribute('seguidores_count', DB::table('favoritos')->where('id_usuariopin',$id)->distinct()->count('id_usuario'));
        $user->setAttribute('seguidos_count', DB::table('favoritos')->where('id_usuario',$id)->distinct()->count('id_usuariopin'));
        return response()->json($user);
    }

    public function community(Request $request, int $id): JsonResponse
    {
        abort_unless(ArtistUser::query()->whereKey($id)->exists(),404);
        $data=$request->validate(['tipo'=>['required','in:seguidores,seguidos'],'page'=>['sometimes','integer','min:1']]);
        $query=DB::table('favoritos as f');
        if ($data['tipo']==='seguidores') {
            $query->join('usuarios as u','u.id','=','f.id_usuario')->where('f.id_usuariopin',$id);
        } else {
            $query->join('usuarios as u','u.id','=','f.id_usuariopin')->where('f.id_usuario',$id);
        }
        $query->select('u.id','u.usuario','u.imagen','u.biografia')->distinct()->orderBy('u.usuario');
        return response()->json($query->paginate(30));
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->only(['id','nombre','apellidos','usuario','correo','id_tipo','imagen','biografia']);
        $user['id_tipo'] = (int) $request->user()->id_tipo;
        $user['publicaciones'] = DB::table('publicaciones')->where('id_usuario',$request->user()->id)->orderByDesc('id')->get();
        $user['avisos'] = DB::table('avisos')->where('id_usuario',$request->user()->id)->orderByDesc('id')->get();
        $user['eventos'] = DB::table('listado_evento as le')->join('eventos as e','e.id','=','le.id_evento')->where('le.id_usuario',$request->user()->id)->select('e.*','le.estado as participacion')->get();
        $user['eventos_propios'] = DB::table('eventos')->where('id_usuario',$request->user()->id)->orderByDesc('fecha_inicio')->get();
        $user['productos'] = DB::table('productos')->where('id_usuario',$request->user()->id)->orderByDesc('id')->get(['id','nombre','descripcion','precio','cantidad','imagen','id_tipo']);
        $user['favoritos'] = DB::table('favoritos as f')->join('usuarios as u','u.id','=','f.id_usuariopin')->where('f.id_usuario',$request->user()->id)->select('u.id','u.usuario','u.imagen','u.biografia')->distinct()->orderBy('u.usuario')->get();
        $user['seguidores'] = DB::table('favoritos as f')->join('usuarios as u','u.id','=','f.id_usuario')->where('f.id_usuariopin',$request->user()->id)->select('u.id','u.usuario','u.imagen','u.biografia')->distinct()->orderBy('u.usuario')->get();
        $likedPublicationIds = DB::table('megusta')->select('id_publicacion')->where('id_usuario',$request->user()->id)->where('megusta',1)->distinct();
        $user['obras_favoritas'] = DB::table('publicaciones as p')->joinSub($likedPublicationIds,'liked','liked.id_publicacion','=','p.id')->join('usuarios as u','u.id','=','p.id_usuario')->where('p.tipo','public')->select('p.id','p.titulo','p.descripcion','p.imagen','p.megusta','u.usuario as artist_name')->orderByDesc('p.id')->get();
        return response()->json($user);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'nombre' => ['sometimes','required','string','max:100'], 'apellidos' => ['sometimes','required','string','max:140'],
            'usuario' => ['sometimes','required','string','max:100','unique:usuarios,usuario,'.$user->id],
            'correo' => ['sometimes','required','email','max:240','unique:usuarios,correo,'.$user->id],
            'biografia' => ['sometimes','nullable','string','max:255'], 'imagen' => ['sometimes','image','max:8192'],
            'password_actual' => ['sometimes','required_with:password','string'], 'password' => ['sometimes','required','string','min:8','confirmed','regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
        ]);
        if (isset($data['password'])) {
            if (!Hash::check($data['password_actual'] ?? '', $user->contrasena)) return response()->json(['message'=>'La contraseña actual no es correcta.'],422);
            $data['contrasena'] = Hash::make($data['password']);
        }
        unset($data['password'], $data['password_confirmation'], $data['password_actual']);
        if ($request->hasFile('imagen')) $data['imagen'] = $request->file('imagen')->store('uploads/usuarios','public');
        $user->fill($data)->save();
        return response()->json(['user'=>$user->fresh()->only(['id','nombre','apellidos','usuario','correo','id_tipo','imagen','biografia'])]);
    }

    public function toggleFavorite(Request $request, int $id): JsonResponse
    {
        abort_unless(ArtistUser::query()->whereKey($id)->exists(),404);
        abort_if($id === $request->user()->id,422,'No puedes fijar tu propio perfil.');
        $favorites = DB::table('favoritos')->where('id_usuario',$request->user()->id)->where('id_usuariopin',$id);
        if ($favorites->exists()) { $favorites->delete(); return response()->json(['pinned'=>false]); }
        DB::table('favoritos')->insert(['id_usuario'=>$request->user()->id,'id_usuariopin'=>$id]);
        return response()->json(['pinned'=>true]);
    }
}
