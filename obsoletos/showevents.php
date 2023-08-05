<?php

include('../Connection.php');
include('../Crud.php');
session_start();
date_default_timezone_set('Europe/Madrid');

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();

$result = $sqlData->getinfo("SELECT eventos.*, usuarios.usuario FROM eventos JOIN usuarios ON eventos.id_usuario = usuarios.id ORDER BY eventos.fecha_fin DESC");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    if($row['fecha_fin'] > date("Y-m-d")){
        $jsonData[] = $row;
    }

    
}

echo json_encode($jsonData);


