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

$id_publi = $_GET['id'];

$result = $sqlData->getinfo("SELECT * FROM megusta WHERE id_usuario = '$id' AND id_publicacion = '$id_publi'");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    $jsonData[] = $row;
}

echo json_encode($jsonData);