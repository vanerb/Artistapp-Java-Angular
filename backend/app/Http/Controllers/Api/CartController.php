<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    private function cartId(int $userId): int
    {
        $cart=DB::table('cesta')->where('id_usuario',$userId)->first();
        return $cart?->id ?? DB::table('cesta')->insertGetId(['id_usuario'=>$userId]);
    }

    public function show(Request $request): JsonResponse
    {
        $cartId=$this->cartId($request->user()->id);
        $items=DB::table('cesta_producto as cp')->join('productos as p','p.id','=','cp.id_producto')->where('cp.id_cesta',$cartId)
            ->select('p.*','cp.id as cart_item_id')->orderByDesc('cp.id')->get();
        $subtotal=(float)$items->sum(fn($item)=>(float)$item->precio);
        $shipping=$items->contains(fn($item)=>(int)$item->id_tipo===1)?4.0:0.0;
        return response()->json(['items'=>$items,'subtotal'=>$subtotal,'envio'=>$shipping,'total'=>$subtotal+$shipping]);
    }

    public function add(Request $request,int $product): JsonResponse
    {
        $userId=$request->user()->id;
        return DB::transaction(function() use($userId,$product): JsonResponse {
            $item=DB::table('productos')->where('id',$product)->lockForUpdate()->first();
            abort_unless($item,404);
            abort_if((int)$item->cantidad<1,422,'Este producto está agotado.');
            $cartId=$this->cartId($userId);
            $exists=DB::table('cesta_producto')->where('id_cesta',$cartId)->where('id_producto',$product)->exists();
            if(!$exists) DB::table('cesta_producto')->insert(['id_cesta'=>$cartId,'id_producto'=>$product]);
            return response()->json(['message'=>$exists?'El producto ya estaba en la cesta.':'Producto añadido.'], $exists?200:201);
        });
    }

    public function remove(Request $request,int $product): JsonResponse
    {
        $cart=DB::table('cesta')->where('id_usuario',$request->user()->id)->first();
        if($cart) DB::table('cesta_producto')->where('id_cesta',$cart->id)->where('id_producto',$product)->delete();
        return $this->show($request);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart=DB::table('cesta')->where('id_usuario',$request->user()->id)->first();
        if($cart) DB::table('cesta_producto')->where('id_cesta',$cart->id)->delete();
        return response()->json(['message'=>'Cesta vaciada.']);
    }
}
