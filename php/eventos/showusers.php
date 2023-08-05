<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();

$result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuarios.id_tipo = 3 OR usuarios.id_tipo = 1");

$jsonData = array();

while ($row = $result->fetch_assoc()) {


    $jsonData[] = $row;
}

echo json_encode($jsonData);