<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();

$sql = $sqlConnection->getConnection();

$usuario = $_SESSION['user'];

$result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
}

$result = $sqlData->getinfo("SELECT avisos.*, usuarios.usuario FROM avisos JOIN usuarios ON avisos.id_usuario = usuarios.id WHERE id_usuario = '$id' ORDER BY fecha_publicacion, hora DESC");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    $jsonData[] = $row;
}

echo json_encode($jsonData);