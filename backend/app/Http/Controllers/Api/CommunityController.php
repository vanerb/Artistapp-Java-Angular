<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\InAppNotifier;

class CommunityController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $userId=(int)$request->user()->id;
        $directIds=DB::table('direct_messages')->where('sender_id',$userId)->pluck('recipient_id')
            ->merge(DB::table('direct_messages')->where('recipient_id',$userId)->pluck('sender_id'))->unique()->values();
        $direct=$directIds->isEmpty()?collect():DB::table('usuarios')->whereIn('id',$directIds)->select('id','usuario as name','imagen as image')->get()->map(function($peer)use($userId){
            $last=DB::table('direct_messages')->where(fn($q)=>$q->where('sender_id',$userId)->where('recipient_id',$peer->id))->orWhere(fn($q)=>$q->where('sender_id',$peer->id)->where('recipient_id',$userId))->orderByDesc('id')->first();
            return ['id'=>(int)$peer->id,'name'=>$peer->name,'image'=>$peer->image,'last_message'=>$last?->body,'updated_at'=>$last?->created_at,'kind'=>'direct'];
        })->sortByDesc('updated_at')->values();
        $eventIds=DB::table('eventos')->where('id_usuario',$userId)->pluck('id')
            ->merge(DB::table('listado_evento')->where('id_usuario',$userId)->where('estado','aceptado')->pluck('id_evento'))->unique()->values();
        $events=$eventIds->isEmpty()?collect():DB::table('eventos')->whereIn('id',$eventIds)->select('id','nombre as name','imagen as image')->get()->map(function($event){
            $last=DB::table('event_chat_messages')->where('event_id',$event->id)->orderByDesc('id')->first();
            return ['id'=>(int)$event->id,'name'=>$event->name,'image'=>$event->image,'last_message'=>$last?->body,'updated_at'=>$last?->created_at,'kind'=>'event'];
        })->sortByDesc('updated_at')->values();
        return response()->json(['direct'=>$direct,'events'=>$events]);
    }

    private function eventAccess(Request $request,int $eventId): object
    {
        $event=DB::table('eventos')->find($eventId); abort_unless($event,404);
        $userId=(int)$request->user()->id;
        $allowed=(int)$event->id_usuario===$userId || DB::table('listado_evento')->where('id_evento',$eventId)->where('id_usuario',$userId)->where('estado','aceptado')->exists();
        abort_unless($allowed,403,'El chat está disponible para la organización y las personas aceptadas en el evento.');
        return $event;
    }

    public function comments(Request $request,int $publicationId): JsonResponse
    {
        $publication=DB::table('publicaciones')->find($publicationId);$viewerId=(int)($request->user()?->id??0);
        abort_unless($publication && ($publication->tipo==='public'||(int)$publication->id_usuario===$viewerId),404);
        $comments=DB::table('publication_comments as c')->join('usuarios as u','u.id','=','c.user_id')->where('c.publication_id',$publicationId)
            ->select('c.id','c.publication_id','c.user_id','c.body','c.created_at','u.usuario','u.imagen')->orderBy('c.id')->limit(200)->get();
        return response()->json($comments);
    }

    public function addComment(Request $request,int $publicationId): JsonResponse
    {
        $publication=DB::table('publicaciones')->find($publicationId); abort_unless($publication && $publication->tipo==='public',404);
        $data=$request->validate(['body'=>['required','string','max:1000']]);
        $id=DB::table('publication_comments')->insertGetId(['publication_id'=>$publicationId,'user_id'=>$request->user()->id,'body'=>trim($data['body']),'created_at'=>now(),'updated_at'=>now()]);
        $row=DB::table('publication_comments as c')->join('usuarios as u','u.id','=','c.user_id')->where('c.id',$id)->select('c.id','c.publication_id','c.user_id','c.body','c.created_at','u.usuario','u.imagen')->first();
        return response()->json($row,201);
    }

    public function deleteComment(Request $request,int $publicationId,int $commentId): JsonResponse
    {
        $comment=DB::table('publication_comments')->where('id',$commentId)->where('publication_id',$publicationId)->first(); abort_unless($comment,404);
        abort_unless((int)$comment->user_id===(int)$request->user()->id||(int)$request->user()->id_tipo===1,403);
        DB::table('publication_comments')->where('id',$commentId)->delete();
        return response()->json(['message'=>'Comentario eliminado.']);
    }

    public function eventMessages(Request $request,int $eventId): JsonResponse
    {
        $this->eventAccess($request,$eventId);
        $messages=DB::table('event_chat_messages as m')->join('usuarios as u','u.id','=','m.user_id')->where('m.event_id',$eventId)
            ->select('m.id','m.event_id','m.user_id','m.body','m.created_at','u.usuario','u.imagen')->orderByDesc('m.id')->limit(100)->get()->reverse()->values();
        return response()->json($messages);
    }

    public function sendEventMessage(Request $request,int $eventId): JsonResponse
    {
        $this->eventAccess($request,$eventId);$data=$request->validate(['body'=>['required','string','max:1000']]);
        $id=DB::table('event_chat_messages')->insertGetId(['event_id'=>$eventId,'user_id'=>$request->user()->id,'body'=>trim($data['body']),'created_at'=>now(),'updated_at'=>now()]);
        $row=DB::table('event_chat_messages as m')->join('usuarios as u','u.id','=','m.user_id')->where('m.id',$id)->select('m.id','m.event_id','m.user_id','m.body','m.created_at','u.usuario','u.imagen')->first();
        return response()->json($row,201);
    }

    private function directTarget(Request $request,int $otherId): object
    {
        $other=DB::table('usuarios')->select('id','usuario','imagen','id_tipo')->find($otherId);abort_unless($other,404);
        $user=$request->user();abort_if((int)$user->id===$otherId,422,'No puedes abrir un chat contigo.');
        abort_unless((int)$other->id_tipo===5||(int)$user->id_tipo===5,404,'El chat directo está reservado para conversaciones con artistas.');
        return $other;
    }

    public function directMessages(Request $request,int $otherId): JsonResponse
    {
        $other=$this->directTarget($request,$otherId);$viewer=(int)$request->user()->id;
        $rows=DB::table('direct_messages as m')->join('usuarios as u','u.id','=','m.sender_id')
            ->where(fn($q)=>$q->where(fn($a)=>$a->where('m.sender_id',$viewer)->where('m.recipient_id',$otherId))->orWhere(fn($a)=>$a->where('m.sender_id',$otherId)->where('m.recipient_id',$viewer)))
            ->select('m.id','m.sender_id','m.recipient_id','m.body','m.created_at','u.usuario as sender_name','u.imagen as sender_image')->orderByDesc('m.id')->limit(100)->get()->reverse()->values();
        return response()->json(['peer'=>$other,'messages'=>$rows]);
    }

    public function sendDirectMessage(Request $request,int $otherId,InAppNotifier $notifier): JsonResponse
    {
        $other=$this->directTarget($request,$otherId);$viewer=$request->user();$data=$request->validate(['body'=>['required','string','max:1000']]);
        $id=DB::table('direct_messages')->insertGetId(['sender_id'=>$viewer->id,'recipient_id'=>$otherId,'body'=>trim($data['body']),'created_at'=>now(),'updated_at'=>now()]);
        $notifier->user((int)$other->id,'mensaje','Mensaje de '.$viewer->usuario,mb_substr(trim($data['body']),0,180),'/mensajes/artista/'.$viewer->id);
        return response()->json(DB::table('direct_messages as m')->join('usuarios as u','u.id','=','m.sender_id')->where('m.id',$id)->select('m.id','m.sender_id','m.recipient_id','m.body','m.created_at','u.usuario as sender_name','u.imagen as sender_image')->first(),201);
    }
}
