<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();
$id = $_GET['id'];
$result = $sqlData->getinfo("SELECT pedidos.*, productos.nombre as productonombre, productos.precio FROM detalles_pedido JOIN pedidos ON detalles_pedido.id_pedido = pedidos.id JOIN productos ON detalles_pedido.id_producto = productos.id WHERE pedidos.id='$id'");

$jsonData = array();

while ($row = $result->fetch_assoc()) {


    $jsonData[] = $row;
}

echo json_encode($jsonData);