<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArtistUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $data=$request->validate(['correo'=>['required','email','max:240']]);
        $email=Str::lower($data['correo']);
        $user=ArtistUser::query()->where('correo',$email)->first();
        if($user){
            $token=Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(['email'=>$email],['token'=>Hash::make($token),'created_at'=>now()]);
            $link=rtrim((string)env('FRONTEND_URL','http://localhost:4200'),'/').'/restablecer?email='.urlencode($email).'&token='.urlencode($token);
            Mail::raw("Hola {$user->usuario},\n\nPara elegir una nueva contraseña, abre este enlace (válido durante 60 minutos):\n{$link}\n\nSi no solicitaste este cambio, ignora este mensaje.",fn($message)=>$message->to($email)->subject('Recupera tu acceso a ArtistApp'));
        }
        return response()->json(['message'=>'Si existe una cuenta con ese correo, recibirás un enlace para recuperar el acceso.']);
    }

    public function reset(Request $request): JsonResponse
    {
        $data=$request->validate(['correo'=>['required','email'],'token'=>['required','string'],'password'=>['required','string','min:8','max:240','confirmed','regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/']]);
        $row=DB::table('password_reset_tokens')->where('email',Str::lower($data['correo']))->first();
        abort_unless($row && $row->created_at && now()->diffInMinutes($row->created_at)<=60 && Hash::check($data['token'],$row->token),422,'El enlace no es válido o ha caducado.');
        $user=ArtistUser::query()->where('correo',Str::lower($data['correo']))->firstOrFail();
        $user->contrasena=Hash::make($data['password']); $user->save();
        DB::table('password_reset_tokens')->where('email',$row->email)->delete();
        $user->tokens()->delete();
        return response()->json(['message'=>'Contraseña actualizada. Ya puedes iniciar sesión.']);
    }
}
