<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class InAppNotifier
{
    public function user(int $userId, string $type, string $title, string $message, ?string $link = null): void
    {
        DB::table('app_notifications')->insert(['user_id'=>$userId,'type'=>$type,'title'=>$title,'message'=>$message,'link'=>$link,'created_at'=>now(),'updated_at'=>now()]);
    }

    public function admins(string $type, string $title, string $message, ?string $link = null): void
    {
        $now=now(); $rows=DB::table('usuarios')->where('id_tipo',1)->pluck('id')->map(fn($id)=>['user_id'=>$id,'type'=>$type,'title'=>$title,'message'=>$message,'link'=>$link,'created_at'=>$now,'updated_at'=>$now])->all();
        if($rows) DB::table('app_notifications')->insert($rows);
    }

    public function followers(int $artistId, string $type, string $title, string $message, ?string $link = null): void
    {
        $now=now(); $rows=DB::table('favoritos')->where('id_usuariopin',$artistId)->distinct()->pluck('id_usuario')->map(fn($id)=>['user_id'=>$id,'type'=>$type,'title'=>$title,'message'=>$message,'link'=>$link,'created_at'=>$now,'updated_at'=>$now])->all();
        if($rows) DB::table('app_notifications')->insert($rows);
    }

    public function everyoneExcept(int $excludedUserId, string $type, string $title, string $message, ?string $link = null): void
    {
        $now=now();
        $rows=DB::table('usuarios')->where('id','!=',$excludedUserId)->pluck('id')->map(fn($id)=>[
            'user_id'=>$id,'type'=>$type,'title'=>$title,'message'=>$message,'link'=>$link,'created_at'=>$now,'updated_at'=>$now,
        ])->all();
        foreach(array_chunk($rows,500) as $chunk) DB::table('app_notifications')->insert($chunk);
    }
}
