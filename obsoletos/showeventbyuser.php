<?php

include('../Connection.php');
include('../Crud.php');
session_start();
date_default_timezone_set('Europe/Madrid');


$sqlConnection = new Connection();
$sqlData = new crud();

$sql = $sqlConnection->getConnection();

$usuario = $_SESSION['user'];

$result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
}

$result = $sqlData->getinfo("SELECT eventos.* FROM eventos JOIN listado_evento ON listado_evento.id_evento = eventos.id JOIN usuarios ON listado_evento.id_usuario = usuarios.id WHERE listado_evento.id_usuario = '$id' AND listado_evento.estado = 'aceptado' ORDER BY eventos.fecha_fin DESC");

$jsonData = array();

while ($row = $result->fetch_assoc()) {

    if($row['fecha_fin'] > date("Y-m-d")){
        $jsonData[] = $row;
    }
    
}

echo json_encode($jsonData);