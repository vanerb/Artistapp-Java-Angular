<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        return response()->json([
            'usuarios'=>DB::table('usuarios')->count(), 'publicaciones'=>DB::table('publicaciones')->count(),
            'productos'=>DB::table('productos')->count(), 'eventos'=>DB::table('eventos')->count(),
            'pedidos_pendientes'=>DB::table('pedidos')->whereNotIn('estado',['entregado','cancelado'])->count(),
            'informes_pendientes'=>DB::table('informes')->whereNotIn('estado',['resuelta','descartada'])->count(),
            'ventas'=>DB::table('pedidos')->whereNotIn('estado',['cancelado'])->sum('pago'),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        return response()->json(DB::table('usuarios')->select(['id','nombre','apellidos','usuario','correo','id_tipo','imagen','biografia'])->orderByDesc('id')->paginate(40));
    }

    public function storeUser(Request $request): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['nombre'=>['required','string','max:100'],'apellidos'=>['required','string','max:140'],'usuario'=>['required','string','max:100','unique:usuarios,usuario'],'correo'=>['required','email','max:240','unique:usuarios,correo'],'id_tipo'=>['required','integer','exists:tipo_usuario,id'],'password'=>['required','string','min:8','confirmed','regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],'imagen'=>['nullable','image','max:8192'],'biografia'=>['nullable','string','max:255']]);
        $data['contrasena']=Hash::make($data['password']);unset($data['password'],$data['password_confirmation']);
        if($request->hasFile('imagen'))$data['imagen']=$request->file('imagen')->store('uploads/usuarios','public');
        $data['imagen']=$data['imagen']??'media/no-user.png';$data['biografia']=$data['biografia']??'';
        $id=DB::table('usuarios')->insertGetId($data);
        return response()->json(DB::table('usuarios')->select(['id','nombre','apellidos','usuario','correo','id_tipo','imagen','biografia'])->find($id),201);
    }

    public function updateUser(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        abort_unless(DB::table('usuarios')->where('id',$id)->exists(),404);
        $data=$request->validate(['nombre'=>['sometimes','required','string','max:255'],'apellidos'=>['sometimes','required','string','max:255'],'usuario'=>['sometimes','required','string','max:255','unique:usuarios,usuario,'.$id],'correo'=>['sometimes','required','email','max:255','unique:usuarios,correo,'.$id],'id_tipo'=>['sometimes','integer','exists:tipo_usuario,id'],'biografia'=>['sometimes','nullable','string','max:255'],'imagen'=>['sometimes','nullable','image','max:8192'],'password'=>['sometimes','nullable','string','min:8','confirmed','regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/']]);
        if(!empty($data['password']))$data['contrasena']=Hash::make($data['password']);
        unset($data['password'],$data['password_confirmation']);
        if($request->hasFile('imagen'))$data['imagen']=$request->file('imagen')->store('uploads/usuarios','public');
        abort_unless(DB::table('usuarios')->where('id',$id)->update($data),404);
        return response()->json(DB::table('usuarios')->select(['id','nombre','apellidos','usuario','correo','id_tipo','imagen','biografia'])->find($id));
    }

    public function deleteUser(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403); abort_if($id===(int)$request->user()->id,422,'No puedes eliminar tu propia cuenta de administración.');
        abort_unless(DB::table('usuarios')->where('id',$id)->exists(),404);
        DB::transaction(function() use($id): void {
            DB::table('personal_access_tokens')->where('tokenable_type','App\\Models\\ArtistUser')->where('tokenable_id',$id)->delete();
            $eventIds=DB::table('eventos')->where('id_usuario',$id)->pluck('id');
            $productIds=DB::table('productos')->where('id_usuario',$id)->pluck('id');
            $orderIds=DB::table('pedidos')->where('id_usuario',$id)->pluck('id');
            DB::table('favoritos')->where('id_usuario',$id)->orWhere('id_usuariopin',$id)->delete();
            DB::table('megusta')->where('id_usuario',$id)->orWhereIn('id_publicacion',DB::table('publicaciones')->where('id_usuario',$id)->select('id'))->delete();
            DB::table('listado_evento')->where('id_usuario',$id)->orWhereIn('id_evento',$eventIds)->delete();
            DB::table('informes')->where('id_usuario',$id)->orWhere('id_usuarioreferenciado',$id)->delete();
            DB::table('cesta_producto')->whereIn('id_producto',$productIds)->orWhereIn('id_cesta',DB::table('cesta')->where('id_usuario',$id)->select('id'))->delete();
            DB::table('cesta')->where('id_usuario',$id)->delete();
            DB::table('detalles_pedido')->whereIn('id_pedido',$orderIds)->orWhereIn('id_producto',$productIds)->delete();
            DB::table('pedidos')->where('id_usuario',$id)->delete();
            DB::table('avisos')->where('id_usuario',$id)->delete(); DB::table('publicaciones')->where('id_usuario',$id)->delete();
            DB::table('eventos')->where('id_usuario',$id)->delete(); DB::table('productos')->where('id_usuario',$id)->delete();
            DB::table('usuarios')->where('id',$id)->delete();
        });
        return response()->json(['message'=>'Cuenta eliminada.']);
    }
}
