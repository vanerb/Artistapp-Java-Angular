<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\InAppNotifier;

class NoticeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query=DB::table('avisos as a')->join('usuarios as u','u.id','=','a.id_usuario')->select('a.*','u.usuario as artist_name','u.imagen as artist_image');
        if($request->filled('usuario')) $query->where('a.id_usuario',$request->integer('usuario'));
        $user=$request->user();
        if($user && (int)$user->id_tipo!==1 && $request->filled('usuario')) $query->where('a.id_usuario',$request->integer('usuario'));
        return response()->json($query->orderByDesc('a.id')->paginate(30));
    }

    public function store(Request $request,InAppNotifier $notifier): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo === 1, 403, 'Solo administración puede publicar avisos generales.');
        $data=$request->validate(['titulo'=>['required','string','max:255'],'aviso'=>['required','string','max:255']]);
        $id=DB::table('avisos')->insertGetId($data+['fecha_publicacion'=>now()->toDateString(),'hora'=>now()->format('H:i:s'),'id_usuario'=>$request->user()->id]);
        if((int)$request->user()->id_tipo===1) {
            $notifier->everyoneExcept((int)$request->user()->id,'aviso','Aviso importante de ArtistApp',$data['titulo'],'/artistas/'.$request->user()->id);
        } else {
            $notifier->followers((int)$request->user()->id,'aviso','Nuevo aviso de '.$request->user()->usuario,$data['titulo'],'/artistas/'.$request->user()->id);
        }
        return response()->json(DB::table('avisos')->find($id),201);
    }

    public function update(Request $request,int $id): JsonResponse
    {
        $notice=DB::table('avisos')->find($id); abort_unless($notice,404);
        abort_unless((int)$notice->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['titulo'=>['sometimes','required','string','max:255'],'aviso'=>['sometimes','required','string','max:255']]);
        DB::table('avisos')->where('id',$id)->update($data);
        return response()->json(DB::table('avisos')->find($id));
    }

    public function destroy(Request $request,int $id): JsonResponse
    {
        $notice=DB::table('avisos')->find($id); abort_unless($notice,404);
        abort_unless((int)$notice->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        DB::table('avisos')->where('id',$id)->delete();
        return response()->json(['message'=>'Aviso eliminado.']);
    }
}
