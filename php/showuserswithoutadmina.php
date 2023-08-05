<?php

include('Connection.php');
include('Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();

$result = $sqlData->getinfo("SELECT usuarios.*, tipo_usuario.nombre AS tipo_usuario FROM usuarios JOIN tipo_usuario ON usuarios.id_tipo = tipo_usuario.id WHERE usuarios.id_tipo <> 1");

$jsonData = array();

while ($row = $result->fetch_assoc()) {


    $jsonData[] = $row;
}

echo json_encode($jsonData);

?>