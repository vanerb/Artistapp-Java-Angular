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
$result = $sqlData->getinfo("SELECT productos.* FROM cesta JOIN usuarios ON cesta.id_usuario = usuarios.id JOIN cesta_producto ON cesta_producto.id_cesta = cesta.id JOIN productos ON cesta_producto.id_producto = productos.id WHERE cesta.id_usuario = $id");

$jsonData = array();

while ($row = $result->fetch_assoc()) {


    $jsonData[] = $row;
}

echo json_encode($jsonData);