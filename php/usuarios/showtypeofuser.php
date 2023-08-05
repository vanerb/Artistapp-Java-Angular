<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();

$sql = $sqlConnection->getConnection();

$result = $sqlData->getinfo("SELECT * FROM tipo_usuario");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    if($row['id'] != 1){
        $jsonData[] = $row;
    }
    
}

echo json_encode($jsonData);