<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$filtro_busqueda = $_GET['buscar'];
$offset = $_GET['offset'];
$limit = $_GET['limit'];

$sql = "SELECT * FROM usuarios WHERE 1=1 AND id_tipo <> 1 AND id_tipo <> 7";


if ($filtro_busqueda) {
  $sql .= " AND usuario LIKE '%$filtro_busqueda%'";
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