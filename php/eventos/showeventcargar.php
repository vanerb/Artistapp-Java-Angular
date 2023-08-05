<?php

include('../Connection.php');
include('../Crud.php');
session_start();
date_default_timezone_set('Europe/Madrid');

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();

// Obtener el ID del usuario de la sesión
$usuario = $_SESSION['user'];
$result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
}

// Obtener los productos del usuario
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 6;
$fechaactual = date('Y-m-d');
$query = "SELECT * FROM eventos WHERE fecha_fin > '$fechaactual' LIMIT $limit OFFSET $offset";
$result = $sqlData->getinfo($query);

$jsonData = array();

while ($row = $result->fetch_assoc()) {
        $jsonData[] = $row;
    
}

// Devolver los productos en formato JSON
echo json_encode($jsonData);
