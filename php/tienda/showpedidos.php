

<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();
$sql = $sqlConnection->getConnection();

$usuario = $_SESSION['user'];
$result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

while ($row = $result->fetch_assoc()) {
    $id = $row['id'];
}

// Obtener la cantidad total de registros
$queryTotal = "SELECT COUNT(*) as total FROM pedidos JOIN detalles_pedido ON detalles_pedido.id_pedido = pedidos.id JOIN productos ON detalles_pedido.id_producto = productos.id JOIN usuarios ON pedidos.id_usuario = usuarios.id WHERE usuarios.id='$id' AND productos.id_tipo = 1";
$resultTotal = $sqlData->getinfo($queryTotal);
$rowTotal = $resultTotal->fetch_assoc();
$totalRegistros = $rowTotal['total'];



// Calcular la cantidad total de páginas
$totalPaginas = ceil($totalRegistros / 6);

// Obtener los registros de la página actual
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 6;
$query = "SELECT pedidos.id, productos.nombre, usuarios.usuario, productos.precio, pedidos.estado, productos.id_tipo, productos.id as prod_id FROM pedidos JOIN detalles_pedido ON detalles_pedido.id_pedido = pedidos.id JOIN productos ON detalles_pedido.id_producto = productos.id JOIN usuarios ON pedidos.id_usuario = usuarios.id WHERE usuarios.id='$id' AND productos.id_tipo = 1 LIMIT $limit OFFSET $offset";
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





