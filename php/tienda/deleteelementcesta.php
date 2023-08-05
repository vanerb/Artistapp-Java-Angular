<?php
include('../Connection.php');
include('../Crud.php');

session_start();


$id_prod = $_GET['id_producto'];
$usuario = $_SESSION['user'];
if (isset($id_prod)) {
    if (!empty($id_prod)) {
        $database = new Crud();
        $sqlConnection = new Connection();

        $sql = $sqlConnection->getConnection();
        $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

        while ($row = $result->fetch_assoc()) {
            $id = $row['id'];
        }
        $result = $database->getinfo("SELECT cesta.id AS id_cesta FROM cesta JOIN cesta_producto ON cesta_producto.id_cesta = cesta.id WHERE cesta.id_usuario='$id'");
        while ($row = $result->fetch_assoc()) {
            $id_cesta = $row['id_cesta'];
        }


        $database->deleteElementCesta($id_prod, $id_cesta);

        $result = $database->getinfo("SELECT * FROM cesta WHERE id_usuario='$id'");

        while ($row = $result->fetch_assoc()) {
            $id_cesta = $row['id'];
        }

        $result = $database->getinfo("SELECT COUNT(*) as total FROM cesta_producto WHERE id_cesta='$id_cesta'");

        // Obtener el número de usuarios con ese nombre de usuario
        $count = $result->fetch_assoc()["total"];

        if ($count == 0) {
            $database->eliminar_cesta($id_cesta);
        }
    }
}
