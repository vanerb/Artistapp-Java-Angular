<?php
include('../Connection.php');
include('../Crud.php');
session_start();
date_default_timezone_set('Europe/Madrid');
$filtro_busqueda = $_GET['buscar'];
$filtro_fechainicio = $_GET['fechainicio'];
$filtro_fechafin = $_GET['fechafin'];
$offset = $_GET['offset'];
$limit = $_GET['limit'];

$fechaactual = date('Y-m-d');

$sql = "SELECT * FROM eventos WHERE 1=1 AND fecha_fin > '$fechaactual'";


if ($filtro_busqueda) {
    $sql .= " AND nombre LIKE '%$filtro_busqueda%' OR ubicacion LIKE '%$filtro_busqueda%'";
}

if($filtro_fechainicio && $filtro_fechafin){
    $sql .= " AND fecha_inicio >= '$filtro_fechainicio' AND fecha_fin <= '$filtro_fechafin'";

}
if($filtro_fechainicio){
    $sql .= " AND fecha_inicio >= '$filtro_fechainicio'";

}
if($filtro_fechafin){
    $sql .= " AND fecha_fin <= '$filtro_fechafin'";

}


$sql .= " LIMIT $limit OFFSET $offset";

$sqlConnection = new Connection();
$sqlData = new crud();
$result = $sqlData->getinfo("$sql");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
  $jsonData[] = $row;
}

echo json_encode($jsonData);

