<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();

$sql = $sqlConnection->getConnection();

$id = $_GET['id'];


$result = $sqlData->getinfo("SELECT publicaciones.*, usuarios.usuario, categoria.nombre AS catnom FROM publicaciones JOIN usuarios ON publicaciones.id_usuario = usuarios.id JOIN categoria ON publicaciones.id_categoria = categoria.id WHERE publicaciones.id='$id'");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    $jsonData[] = $row;
}

echo json_encode($jsonData);