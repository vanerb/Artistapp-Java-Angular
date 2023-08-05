<?php

include('../Connection.php');
include('../Crud.php');
session_start();

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
$query = "SELECT favoritos.*, u2.*, u1.usuario as usuariosigue FROM favoritos JOIN usuarios AS u1 ON favoritos.id_usuario = u1.id JOIN usuarios AS u2 ON favoritos.id_usuariopin = u2.id WHERE favoritos.id_usuario = '$id' LIMIT $limit OFFSET $offset";
$result = $sqlData->getinfo($query);

$jsonData = array();

while ($row = $result->fetch_assoc()) {
    $jsonData[] = $row;
}

// Devolver los productos en formato JSON
echo json_encode($jsonData);
