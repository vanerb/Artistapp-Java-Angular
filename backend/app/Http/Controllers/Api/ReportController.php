<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\InAppNotifier;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query=DB::table('informes as r')->join('usuarios as reporter','reporter.id','=','r.id_usuario')->join('usuarios as target','target.id','=','r.id_usuarioreferenciado')->select('r.*','reporter.usuario as reportante','target.usuario as usuario_referenciado')->orderByDesc('r.id');
        if((int)$request->user()->id_tipo!==1) $query->where('r.id_usuario',$request->user()->id);
        return response()->json($query->paginate(30));
    }
    public function store(Request $request,InAppNotifier $notifier): JsonResponse
    {
        $data=$request->validate(['informe'=>['required','string','max:255'],'id_usuarioreferenciado'=>['required','integer','exists:usuarios,id']]);
        abort_if((int)$data['id_usuarioreferenciado']===$request->user()->id,422,'No puedes reportarte a ti misma/o.');
        $id=DB::table('informes')->insertGetId($data+['id_usuario'=>$request->user()->id,'estado'=>'pendiente']);
        $notifier->admins('informe','Nuevo informe recibido','@'.$request->user()->usuario.': '.$data['informe'],'/admin/informes');
        return response()->json(DB::table('informes')->find($id),201);
    }
    public function update(Request $request,int $id,InAppNotifier $notifier): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['estado'=>['required','in:pendiente,en revisión,resuelta,descartada']]);
        $report=DB::table('informes')->find($id);abort_unless($report,404);
        DB::table('informes')->where('id',$id)->update($data);
        $notifier->user((int)$report->id_usuario,'informe','Actualización de tu informe','El estado de tu informe ahora es: '.$data['estado'].'.','/informes');
        return response()->json(DB::table('informes')->find($id));
    }
    public function destroy(Request $request,int $id,InAppNotifier $notifier): JsonResponse
    {
        $query=DB::table('informes')->where('id',$id);
        if((int)$request->user()->id_tipo!==1) $query->where('id_usuario',$request->user()->id)->where('estado','pendiente');
        abort_unless($query->exists(),404);
        $report=$query->first();$query->delete();
        if((int)$request->user()->id_tipo===1)$notifier->user((int)$report->id_usuario,'informe','Informe eliminado','El equipo de ArtistApp ha eliminado un informe.','/informes');
        return response()->json(['message'=>'Informe eliminado.']);
    }
}
