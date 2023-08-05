<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();


// Obtener la cantidad total de registros
$queryTotal = "SELECT COUNT(*) AS total FROM usuarios";
$resultTotal = $sqlData->getinfo($queryTotal);
$rowTotal = $resultTotal->fetch_assoc();
$totalRegistros = $rowTotal['total'];

// Calcular la cantidad total de páginas
$totalPaginas = ceil($totalRegistros / 6);

// Obtener los registros de la página actual
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 6;
$query = "SELECT DISTINCT usuarios.*, tipo_usuario.nombre AS tipo_usuario FROM usuarios JOIN tipo_usuario ON usuarios.id_tipo = tipo_usuario.id WHERE usuarios.id_tipo <> 1 LIMIT $limit OFFSET $offset";
$result = $sqlData->getinfo($query);

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    $jsonData[] = $row;
}

// Devolver los datos en formato JSON junto con la cantidad total de páginas
$response = array(
    'data' => $jsonData,
    'totalPaginas' => $totalPaginas
);

echo json_encode($response);






?>