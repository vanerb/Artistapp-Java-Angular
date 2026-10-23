<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\InAppNotifier;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('eventos as e')->join('usuarios as u','u.id','=','e.id_usuario')
            ->select('e.*','u.usuario as organizer_name','u.imagen as organizer_image')
            ->selectRaw('(SELECT COUNT(*) FROM listado_evento le WHERE le.id_evento=e.id AND le.estado="aceptado") as participant_count');
        if ($request->user('sanctum')) {
            $query->selectSub(DB::table('listado_evento as mine')->select('mine.estado')
                ->whereColumn('mine.id_evento','e.id')->where('mine.id_usuario',$request->user('sanctum')->id)->limit(1), 'participation_status');
        }
        $query->whereDate('e.fecha_fin','>=',now()->toDateString());
        if ($request->filled('q')) $query->where(fn($q)=>$q->where('e.nombre','like','%'.$request->string('q').'%')->orWhere('e.ubicacion','like','%'.$request->string('q').'%'));
        $dates=$request->validate(['desde'=>['sometimes','nullable','date'],'hasta'=>['sometimes','nullable','date']]);
        if (!empty($dates['desde']) && !empty($dates['hasta']) && $dates['hasta'] < $dates['desde']) {
            return response()->json(['message'=>'La fecha final debe ser igual o posterior a la fecha inicial.','errors'=>['hasta'=>['La fecha final debe ser igual o posterior a la fecha inicial.']]],422);
        }
        // Include events that overlap the selected interval, even if they started
        // before `desde` or finish after `hasta`.
        if (!empty($dates['desde'])) $query->whereDate('e.fecha_fin','>=',$dates['desde']);
        if (!empty($dates['hasta'])) $query->whereDate('e.fecha_inicio','<=',$dates['hasta']);
        return response()->json($query->orderBy('e.fecha_inicio')->paginate(24));
    }

    public function store(Request $request,InAppNotifier $notifier): JsonResponse
    {
        abort_unless(in_array((int)$request->user()->id_tipo,[1,3],true),403);
        $data = $request->validate(['nombre'=>['required','string','max:255'],'ubicacion'=>['required','string','max:255'],'link'=>['nullable','url','max:255'],'fecha_inicio'=>['required','date'],'fecha_fin'=>['required','date','after_or_equal:fecha_inicio'],'imagen'=>['nullable','image','max:8192']]);
        $data['id_usuario']=$request->user()->id;
        $data['imagen']=$request->file('imagen')?->store('uploads/imgevento','public') ?? '';
        $id=DB::table('eventos')->insertGetId($data);
        $notifier->followers((int)$request->user()->id,'evento','Nuevo evento: '.$data['nombre'],$data['ubicacion'],'/descubrir');
        return response()->json(DB::table('eventos')->find($id),201);
    }

    public function update(Request $request,int $id): JsonResponse
    {
        $event=DB::table('eventos')->find($id); abort_unless($event,404);
        abort_unless((int)$event->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['nombre'=>['sometimes','required','string','max:255'],'ubicacion'=>['sometimes','required','string','max:255'],'link'=>['sometimes','nullable','url','max:255'],'fecha_inicio'=>['sometimes','required','date'],'fecha_fin'=>['sometimes','required','date'],'imagen'=>['nullable','image','max:8192']]);
        if($request->hasFile('imagen')) $data['imagen']=$request->file('imagen')->store('uploads/imgevento','public');
        DB::table('eventos')->where('id',$id)->update($data);
        return response()->json(DB::table('eventos')->find($id));
    }

    public function destroy(Request $request,int $id): JsonResponse
    {
        $event=DB::table('eventos')->find($id); abort_unless($event,404);
        abort_unless((int)$event->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        DB::transaction(fn()=>[DB::table('listado_evento')->where('id_evento',$id)->delete(),DB::table('eventos')->where('id',$id)->delete()]);
        return response()->json(['message'=>'Evento eliminado.']);
    }

    public function join(Request $request,int $id): JsonResponse
    {
        abort_unless(DB::table('eventos')->where('id',$id)->exists(),404);
        $userId=$request->user()->id;
        $entry=DB::table('listado_evento')->where('id_evento',$id)->where('id_usuario',$userId)->first();
        if($entry) return response()->json(['message'=>'Ya has solicitado participar.','estado'=>$entry->estado]);
        DB::table('listado_evento')->insert(['id_evento'=>$id,'id_usuario'=>$userId,'estado'=>'pendiente']);
        return response()->json(['message'=>'Solicitud enviada.','estado'=>'pendiente'],201);
    }

    public function leave(Request $request,int $id): JsonResponse
    {
        DB::table('listado_evento')->where('id_evento',$id)->where('id_usuario',$request->user()->id)->delete();
        return response()->json(['message'=>'Has salido del evento.']);
    }

    public function participants(Request $request,int $id): JsonResponse
    {
        $event=DB::table('eventos')->find($id); abort_unless($event,404);
        return response()->json(DB::table('listado_evento as le')->join('usuarios as u','u.id','=','le.id_usuario')->where('le.id_evento',$id)
            ->select('le.id','le.estado','u.id as user_id','u.usuario','u.imagen','u.biografia')->orderBy('u.usuario')->get());
    }

    public function decideParticipant(Request $request,int $id,int $participant): JsonResponse
    {
        $event=DB::table('eventos')->find($id); abort_unless($event,404);
        abort_unless((int)$event->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['estado'=>['required','in:aceptado,rechazado,pendiente']]);
        $entry=DB::table('listado_evento')->where('id',$participant)->where('id_evento',$id);
        abort_unless($entry->exists(),404);
        $entry->update(['estado'=>$data['estado']]);
        return response()->json(['estado'=>$data['estado']]);
    }
}
