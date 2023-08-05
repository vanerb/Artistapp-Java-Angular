<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$filtro_busqueda = $_GET['buscar'];
$filtro_tipo = $_GET['categoria'];
$offset = $_GET['offset'];
$limit = $_GET['limit'];

$sql = "SELECT * FROM publicaciones WHERE 1=1 AND tipo='public'";


if ($filtro_busqueda) {
  $sql .= " AND titulo LIKE '%$filtro_busqueda%'";
}

if ($filtro_tipo) {
  $sql .= " AND id_categoria = '$filtro_tipo'";
}

$sql .= "ORDER BY megusta DESC LIMIT $limit OFFSET $offset";

$sqlConnection = new Connection();
$sqlData = new crud();
$result = $sqlData->getinfo("$sql");

$jsonData = array();

while ($row = $result->fetch_assoc()) {
  $jsonData[] = $row;
}

echo json_encode($jsonData);
