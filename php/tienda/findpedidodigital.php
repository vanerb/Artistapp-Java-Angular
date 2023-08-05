<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();

$sql = $sqlConnection->getConnection();
$id = $_GET['id'];
$usuario = $_SESSION['user'];
$result = $sqlData->getinfo("SELECT productos.* FROM pedidos JOIN detalles_pedido ON detalles_pedido.id_pedido = pedidos.id JOIN productos ON detalles_pedido.id_producto = productos.id JOIN usuarios ON pedidos.id_usuario = usuarios.id WHERE usuarios.usuario='$usuario' AND productos.id='$id'");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    $jsonData[] = $row;
    

    
}

echo json_encode($jsonData);