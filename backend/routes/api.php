<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\PublicationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('login',[AuthController::class,'login'])->middleware('throttle:8,1');
    Route::post('register',[AuthController::class,'register'])->middleware('throttle:5,1');
    Route::post('forgot-password',[PasswordResetController::class,'send'])->middleware('throttle:3,1');
    Route::post('reset-password',[PasswordResetController::class,'reset'])->middleware('throttle:5,1');
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me',[AuthController::class,'me']);
        Route::post('logout',[AuthController::class,'logout']);
    });
});

// El escaparate y el descubrimiento son públicos; solo las acciones personales requieren sesión.
Route::get('users',[UserController::class,'index']);
Route::get('users/{id}/community',[UserController::class,'community'])->whereNumber('id');
Route::get('assets/{path}',[AssetController::class,'show'])->where('path','.*');
Route::get('users/{id}',[UserController::class,'show'])->whereNumber('id');
Route::get('publications',[PublicationController::class,'index']);
Route::get('events',[EventController::class,'index']);
Route::get('products',[ProductController::class,'index']);
Route::get('products/{id}',[ProductController::class,'show'])->whereNumber('id');
Route::get('categories',[CategoryController::class,'index']);
Route::get('notices',[NoticeController::class,'index']);
Route::get('publications/{publicationId}/comments',[CommunityController::class,'comments'])->whereNumber('publicationId');
Route::get('product-types',fn()=>response()->json(\Illuminate\Support\Facades\DB::table('tipo_producto')->get()));

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('account',[UserController::class,'me']);
    Route::patch('account',[UserController::class,'update']);
    Route::post('users/{id}/favorite',[UserController::class,'toggleFavorite'])->whereNumber('id');
    Route::get('notifications',[NotificationController::class,'index']);
    Route::patch('notifications/read-all',[NotificationController::class,'readAll']);
    Route::patch('notifications/{id}/read',[NotificationController::class,'read'])->whereNumber('id');
    Route::get('conversations',[CommunityController::class,'conversations']);

    Route::post('publications/{publicationId}/comments',[CommunityController::class,'addComment'])->whereNumber('publicationId');
    Route::delete('publications/{publicationId}/comments/{commentId}',[CommunityController::class,'deleteComment'])->whereNumber(['publicationId','commentId']);
    Route::get('events/{eventId}/chat',[CommunityController::class,'eventMessages'])->whereNumber('eventId');
    Route::post('events/{eventId}/chat',[CommunityController::class,'sendEventMessage'])->whereNumber('eventId');
    Route::get('direct-messages/{otherId}',[CommunityController::class,'directMessages'])->whereNumber('otherId');
    Route::post('direct-messages/{otherId}',[CommunityController::class,'sendDirectMessage'])->whereNumber('otherId');

    Route::post('publications',[PublicationController::class,'store']);
    Route::patch('publications/{id}',[PublicationController::class,'update'])->whereNumber('id');
    Route::delete('publications/{id}',[PublicationController::class,'destroy'])->whereNumber('id');
    Route::post('publications/{id}/like',[PublicationController::class,'toggleLike'])->whereNumber('id');
    Route::patch('publications/{id}/visibility',[PublicationController::class,'toggleVisibility'])->whereNumber('id');

    Route::post('events',[EventController::class,'store']);
    Route::patch('events/{id}',[EventController::class,'update'])->whereNumber('id');
    Route::delete('events/{id}',[EventController::class,'destroy'])->whereNumber('id');
    Route::get('events/{id}/participants',[EventController::class,'participants'])->whereNumber('id');
    Route::post('events/{id}/participants',[EventController::class,'join'])->whereNumber('id');
    Route::delete('events/{id}/participants/me',[EventController::class,'leave'])->whereNumber('id');
    Route::patch('events/{id}/participants/{participant}',[EventController::class,'decideParticipant'])->whereNumber(['id','participant']);

    Route::post('products',[ProductController::class,'store']);
    Route::patch('products/{id}',[ProductController::class,'update'])->whereNumber('id');
    Route::delete('products/{id}',[ProductController::class,'destroy'])->whereNumber('id');

    Route::get('cart',[CartController::class,'show']);
    Route::post('cart/items/{product}',[CartController::class,'add'])->whereNumber('product');
    Route::delete('cart/items/{product}',[CartController::class,'remove'])->whereNumber('product');
    Route::delete('cart',[CartController::class,'clear']);
    Route::post('checkout',[OrderController::class,'checkout']);
    Route::get('orders',[OrderController::class,'index']);
    Route::get('orders/{id}/products/{product}/download',[OrderController::class,'download'])->whereNumber(['id','product']);
    Route::post('orders/{id}/cancel',[OrderController::class,'refund'])->whereNumber('id');
    Route::patch('orders/{id}/status',[OrderController::class,'updateStatus'])->whereNumber('id');
    Route::patch('orders/{id}',[OrderController::class,'update'])->whereNumber('id');
    Route::delete('orders/{id}',[OrderController::class,'destroy'])->whereNumber('id');

    Route::post('notices',[NoticeController::class,'store']);
    Route::patch('notices/{id}',[NoticeController::class,'update'])->whereNumber('id');
    Route::delete('notices/{id}',[NoticeController::class,'destroy'])->whereNumber('id');
    Route::post('categories',[CategoryController::class,'store']);
    Route::patch('categories/{id}',[CategoryController::class,'update'])->whereNumber('id');
    Route::delete('categories/{id}',[CategoryController::class,'destroy'])->whereNumber('id');
    Route::get('reports',[ReportController::class,'index']);
    Route::post('reports',[ReportController::class,'store']);
    Route::patch('reports/{id}',[ReportController::class,'update'])->whereNumber('id');
    Route::delete('reports/{id}',[ReportController::class,'destroy'])->whereNumber('id');

    Route::prefix('admin')->group(function (): void {
        Route::get('summary',[AdminController::class,'summary']);
        Route::get('users',[AdminController::class,'users']);
        Route::post('users',[AdminController::class,'storeUser']);
        Route::patch('users/{id}',[AdminController::class,'updateUser'])->whereNumber('id');
        Route::delete('users/{id}',[AdminController::class,'deleteUser'])->whereNumber('id');
    });
});
