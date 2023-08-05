<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$database = new Crud();
$sqlConnection = new Connection();
$sql = $sqlConnection->getConnection();

$usuario = $_SESSION['user'];
$result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
}


$result = $database->getinfo("SELECT * FROM cesta WHERE id_usuario='$id'");

while ($row = $result->fetch_assoc()) {
    $id_cesta = $row['id'];
}

$result = $database->getinfo("SELECT COUNT(*) as total FROM cesta_producto WHERE id_cesta='$id_cesta'");

// Obtener el número de usuarios con ese nombre de usuario
$count = $result->fetch_assoc()["total"];

if ($count == 0) {
    echo "isempty";
}
