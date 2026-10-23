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
        $query=DB::table('pedidos as o')->join('usuarios as u','u.id','=','o.id_usuario')->select('o.*','u.usuario as buyer_name');
        if((int)$request->user()->id_tipo!==1) $query->where('o.id_usuario',$request->user()->id);
        if($request->filled('estado')) $query->where('o.estado',$request->string('estado')->toString());
        $orders=$query->orderByDesc('o.id')->paginate(30);
        $ids=collect($orders->items())->pluck('id');
        $details=DB::table('detalles_pedido as d')->join('productos as p','p.id','=','d.id_producto')->whereIn('d.id_pedido',$ids)->select('d.id_pedido','p.id','p.nombre','p.imagen','p.precio','p.id_tipo')->get()->groupBy('id_pedido');
        foreach($orders->items() as $order) $order->productos=$details->get($order->id,collect())->values();
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

    public function updateStatus(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['estado'=>['required','in:preparando,enviado,entregado,cancelado']]);
        DB::transaction(function () use ($id,$data): void {
            $order=DB::table('pedidos')->where('id',$id)->lockForUpdate()->first(); abort_unless($order,404);
            abort_if($order->estado==='entregado' && $data['estado']==='cancelado',422,'No se puede cancelar un pedido entregado.');
            if ($data['estado']==='cancelado' && $order->estado!=='cancelado') {
                foreach(DB::table('detalles_pedido')->where('id_pedido',$id)->pluck('id_producto') as $productId) DB::table('productos')->where('id',$productId)->increment('cantidad');
            }
            DB::table('pedidos')->where('id',$id)->update(['estado'=>$data['estado']]);
        });
        return response()->json(DB::table('pedidos')->find($id));
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
