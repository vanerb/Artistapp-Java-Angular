<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$id_ref = $_GET['id'];
$database = new Crud();
$sqlConnection = new Connection();
$usuario = $_SESSION['user'];

$result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
}

$result = $database->getinfo("SELECT * FROM favoritos WHERE id_usuario = '$id' AND id_usuariopin = $id_ref");

while ($row = $result->fetch_assoc()) {
    $id_fav = $row['id'];
}

$database->DeleteFavorito($id_fav);
