<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(): JsonResponse { return response()->json(DB::table('categoria')->orderBy('nombre')->get()); }
    public function store(Request $request): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        $data=$request->validate(['nombre'=>['required','string','max:255','unique:categoria,nombre']]);
        $id=DB::table('categoria')->insertGetId($data);
        return response()->json(DB::table('categoria')->find($id),201);
    }
    public function update(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        abort_unless(DB::table('categoria')->where('id',$id)->exists(),404);
        $data=$request->validate(['nombre'=>['required','string','max:255','unique:categoria,nombre,'.$id]]);
        DB::table('categoria')->where('id',$id)->update($data);
        return response()->json(DB::table('categoria')->find($id));
    }
    public function destroy(Request $request,int $id): JsonResponse
    {
        abort_unless((int)$request->user()->id_tipo===1,403);
        abort_if(DB::table('publicaciones')->where('id_categoria',$id)->exists(),422,'Esta categoría está asignada a publicaciones.');
        abort_unless(DB::table('categoria')->where('id',$id)->delete(),404);
        return response()->json(['message'=>'Categoría eliminada.']);
    }
}
