<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query=DB::table('productos as p')->join('usuarios as u','u.id','=','p.id_usuario')->leftJoin('tipo_producto as t','t.id','=','p.id_tipo')
            ->select('p.id','p.nombre','p.descripcion','p.precio','p.cantidad','p.imagen','p.id_tipo','p.id_usuario','u.usuario as artist_name','u.imagen as artist_image','t.nombre as type_name');
        if($request->filled('q')) $query->where(fn($q)=>$q->where('p.nombre','like','%'.$request->string('q').'%')->orWhere('p.descripcion','like','%'.$request->string('q').'%')->orWhere('u.usuario','like','%'.$request->string('q').'%'));
        if($request->filled('tipo')) $query->where('p.id_tipo',$request->integer('tipo'));
        if($request->filled('precio')) {
            $range=explode('-', (string)$request->input('precio'), 2);
            if(count($range)===2 && is_numeric($range[0])) {
                if($range[1]==='?') $query->where('p.precio','>=',(float)$range[0]);
                elseif(is_numeric($range[1])) $query->whereBetween('p.precio',[(float)$range[0],(float)$range[1]]);
            }
        }
        if($request->boolean('disponible')) $query->where('p.cantidad','>',0);
        return response()->json($query->orderByDesc('p.id')->paginate(24));
    }

    public function show(int $id): JsonResponse
    {
        $product=DB::table('productos as p')->join('usuarios as u','u.id','=','p.id_usuario')->leftJoin('tipo_producto as t','t.id','=','p.id_tipo')->select('p.id','p.nombre','p.descripcion','p.precio','p.cantidad','p.imagen','p.id_tipo','p.id_usuario','u.usuario as artist_name','u.imagen as artist_image','t.nombre as type_name')->where('p.id',$id)->first();
        abort_unless($product,404);
        return response()->json($product);
    }

    public function store(Request $request): JsonResponse
    {
        abort_unless(in_array((int)$request->user()->id_tipo,[1,3,5],true),403,'Solo artistas y organizadores pueden vender productos.');
        $data=$request->validate(['nombre'=>['required','string','max:255'],'descripcion'=>['required','string','max:255'],'precio'=>['required','numeric','min:0.01'],'cantidad'=>['required','integer','min:0'],'id_tipo'=>['required','integer','in:1,2'],'imagen'=>['required','image','max:8192'],'archivo_digital'=>['nullable','file','max:51200']]);
        if ((int)$data['id_tipo']===2) abort_unless($request->hasFile('archivo_digital'),422,'Añade el archivo que recibirá el comprador.');
        $data['id_usuario']=$request->user()->id; $data['imagen']=$request->file('imagen')->store('uploads/productos','public');
        $data['archivos']=$request->file('archivo_digital')?->store('digital','local') ?? 'Sin archivos'; unset($data['archivo_digital']);
        $id=DB::table('productos')->insertGetId($data);
        return response()->json(DB::table('productos')->find($id),201);
    }

    public function update(Request $request,int $id): JsonResponse
    {
        $product=DB::table('productos')->find($id); abort_unless($product,404);
        abort_unless((int)$product->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['nombre'=>['sometimes','required','string','max:255'],'descripcion'=>['sometimes','required','string','max:255'],'precio'=>['sometimes','required','numeric','min:0.01'],'cantidad'=>['sometimes','required','integer','min:0'],'id_tipo'=>['sometimes','integer','in:1,2'],'imagen'=>['nullable','image','max:8192'],'archivo_digital'=>['nullable','file','max:51200']]);
        $nextType=(int)($data['id_tipo']??$product->id_tipo);
        abort_if($nextType===2 && !$request->hasFile('archivo_digital') && (!$product->archivos || $product->archivos==='Sin archivos'),422,'Añade el archivo que recibirá el comprador.');
        if($request->hasFile('imagen')) $data['imagen']=$request->file('imagen')->store('uploads/productos','public');
        if($request->hasFile('archivo_digital')) $data['archivos']=$request->file('archivo_digital')->store('digital','local');
        unset($data['archivo_digital']);
        DB::table('productos')->where('id',$id)->update($data);
        return response()->json(DB::table('productos')->find($id));
    }

    public function destroy(Request $request,int $id): JsonResponse
    {
        $product=DB::table('productos')->find($id); abort_unless($product,404);
        abort_unless((int)$product->id_usuario===(int)$request->user()->id || (int)$request->user()->id_tipo===1,403);
        abort_if(DB::table('detalles_pedido')->where('id_producto',$id)->exists(),422,'Este producto ya aparece en pedidos y no se puede borrar.');
        DB::transaction(fn()=>[DB::table('cesta_producto')->where('id_producto',$id)->delete(),DB::table('productos')->where('id',$id)->delete()]);
        return response()->json(['message'=>'Producto eliminado.']);
    }
}
