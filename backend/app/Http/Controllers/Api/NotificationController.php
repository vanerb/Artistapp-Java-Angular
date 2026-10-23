<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query=DB::table('app_notifications')->where('user_id',$request->user()->id)->orderByDesc('id');
        $unread=DB::table('app_notifications')->where('user_id',$request->user()->id)->whereNull('read_at')->count();
        return response()->json(['data'=>$query->paginate(30),'unread'=>$unread]);
    }

    public function read(Request $request,int $id): JsonResponse
    {
        DB::table('app_notifications')->where('id',$id)->where('user_id',$request->user()->id)->whereNull('read_at')->update(['read_at'=>now(),'updated_at'=>now()]);
        return response()->json(['unread'=>DB::table('app_notifications')->where('user_id',$request->user()->id)->whereNull('read_at')->count()]);
    }

    public function readAll(Request $request): JsonResponse
    {
        DB::table('app_notifications')->where('user_id',$request->user()->id)->whereNull('read_at')->update(['read_at'=>now(),'updated_at'=>now()]);
        return response()->json(['unread'=>0]);
    }
}
