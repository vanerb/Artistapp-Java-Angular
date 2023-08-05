<?php
include('../Connection.php');
include('../Crud.php');
session_start();
if (!is_null($_SESSION['user'])) {
    $database = new Crud();
    $sqlConnection = new Connection();

    $sql = $sqlConnection->getConnection();
    $usuario = $_SESSION['user'];

    $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

    while ($row = $result->fetch_assoc()) {
        $id = $row['id'];
    }

    $result = $database->getinfo("SELECT COUNT(*) as total FROM cesta WHERE id_usuario='$id'");
    //$count = mysqli_num_rows($result);
    $count = $result->fetch_assoc()["total"];
    if($count == 0){
        $data = array($id);

        $database->addcesta($data);
    }
    $result = $database->getinfo("SELECT * FROM cesta WHERE id_usuario='$id'");

    while ($row = $result->fetch_assoc()) {
        $id_cesta = $row['id'];
    }
    $id_producto = $_GET['id_producto'];


    $result = $database->getinfo("SELECT COUNT(*) as total FROM cesta JOIN cesta_producto ON cesta.id = cesta_producto.id_cesta WHERE cesta_producto.id_producto = '$id_producto' AND cesta_producto.id_cesta = '$id_cesta'");
    $count = $result->fetch_assoc()["total"];
    if($count == 0){
        $data = array($id_cesta, $id_producto);

        $database->addcesta_producto($data);
    
        echo "added";
    }
    else{
        echo "error1";
    }


    
}
