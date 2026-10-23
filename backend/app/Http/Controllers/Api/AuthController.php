<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArtistUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Services\InAppNotifier;

class AuthController extends Controller
{
    private function response(ArtistUser $user): JsonResponse
    {
        $publicUser = $user->only(['id','nombre','apellidos','usuario','correo','id_tipo','imagen','biografia']);
        $publicUser['id'] = (int) $user->id;
        $publicUser['id_tipo'] = (int) $user->id_tipo;
        return response()->json(['user' => $publicUser, 'token' => $user->createToken('artistapp-angular')->plainTextToken]);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['user' => ['required','string','max:255'], 'password' => ['required','string','max:240']]);
        $user = ArtistUser::query()->where('usuario', $data['user'])->orWhere('correo', $data['user'])->first();
        if (!$user || !$this->verifyLegacyPassword($user, $data['password'])) {
            return response()->json(['message' => 'Usuario o contraseña incorrectos.'], 422);
        }
        return $this->response($user);
    }

    public function register(Request $request, InAppNotifier $notifier): JsonResponse
    {
        $data = $request->validate([
            'nombre' => ['required','string','max:100'], 'apellidos' => ['required','string','max:140'],
            'usuario' => ['required','string','max:100','unique:usuarios,usuario'],
            'correo' => ['required','email','max:240','unique:usuarios,correo'],
            'password' => ['required','string','min:8','max:240','confirmed','regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'],
            'id_tipo' => ['required','integer','in:3,5,7'],
        ]);
        $user = ArtistUser::query()->create([
            'nombre' => trim($data['nombre']), 'apellidos' => trim($data['apellidos']),
            'usuario' => trim($data['usuario']), 'correo' => Str::lower(trim($data['correo'])),
            'contrasena' => Hash::make($data['password']), 'id_tipo' => (int) $data['id_tipo'],
            'imagen' => 'media/no-user.png', 'biografia' => 'Aún no tiene',
        ]);
        $notifier->user((int)$user->id,'bienvenida','¡Te damos la bienvenida a ArtistApp!','Tu espacio creativo ya está listo. Descubre artistas, comparte tu obra y participa en eventos.','/descubrir');
        return $this->response($user);
    }

    private function verifyLegacyPassword(ArtistUser $user, string $password): bool
    {
        $stored = (string) $user->contrasena;
        $valid = strlen($stored) === 32 && ctype_xdigit($stored)
            ? hash_equals(strtolower($stored), md5($password))
            : Hash::check($password, $stored);
        if ($valid && strlen($stored) === 32 && ctype_xdigit($stored)) {
            $user->contrasena = Hash::make($password);
            $user->save();
        }
        return $valid;
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $publicUser = $user->only(['id','nombre','apellidos','usuario','correo','id_tipo','imagen','biografia']);
        $publicUser['id'] = (int) $user->id;
        $publicUser['id_tipo'] = (int) $user->id_tipo;
        return response()->json(['user' => $publicUser]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'Sesión cerrada.']);
    }
}
