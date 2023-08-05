<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();

// Obtener el ID del usuario de la sesión
$usuario = $_SESSION['user'];
$result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

$id_usuario = $_GET['id'];

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
}

$query = "SELECT COUNT(*) as total FROM favoritos WHERE id_usuario = '$id' AND id_usuariopin = $id_usuario";
$result = $sqlData->getinfo($query);
$count = $result->fetch_assoc()["total"];

if($count > 0){
    echo "isfixed";
}
else{
    echo "notfixed";
}
