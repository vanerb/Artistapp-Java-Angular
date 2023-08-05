<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$filtro_busqueda = $_GET['buscar'];
$filtro_precio = $_GET['precio'];
$filtro_tipo = $_GET['tipo'];
$offset = $_GET['offset'];
$limit = $_GET['limit'];

$sql = "SELECT * FROM productos WHERE 1=1 AND cantidad > 0";

if ($filtro_precio) {
  // Descomponer el filtro de precio en mínimo y máximo
  list($precio_min, $precio_max) = explode('-', $filtro_precio);
  if($precio_max == "?"){
    $sql .= " AND precio >= $precio_min";
  }
  else{
    $sql .= " AND precio BETWEEN $precio_min AND $precio_max";
  }
}

if ($filtro_busqueda) {
  $sql .= " AND nombre LIKE '%$filtro_busqueda%'";
}

if ($filtro_tipo) {
  $sql .= " AND id_tipo = '$filtro_tipo'";
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
