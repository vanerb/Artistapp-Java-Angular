<?php
include('../Connection.php');
include('../Crud.php');

session_start();


$id = $_GET['id'];
if (isset($id)) {
    if (!empty($id)) {
        $database = new Crud();
        $sqlConnection = new Connection();

        $sql = $sqlConnection->getConnection();

        $result = $database->getinfo("SELECT * FROM productos WHERE id='$id'");
        $count = mysqli_num_rows($result);


        while ($row = $result->fetch_assoc()) {


            $imagen = $row['imagen'];
            $archivo = $row['archivos'];
        }



        $result = $database->getinfo("SELECT DISTINCT COUNT(*) AS total FROM productos LEFT JOIN cesta_producto ON cesta_producto.id_producto = productos.id LEFT JOIN detalles_pedido ON detalles_pedido.id_producto = productos.id WHERE cesta_producto.id_producto = '$id' OR detalles_pedido.id_producto = '$id'");
        $count = $result->fetch_assoc()["total"];

        if ($count == 0) {
            $result = $database->getinfo("SELECT COUNT(*) AS total FROM productos WHERE imagen='$imagen' AND id <> '$id'");
            $count = $result->fetch_assoc()["total"];

            if ($count > 0) {
            } else {
                if ($imagen == "media/no-item.png") {
                } else {
                    $array = explode("/", $imagen);
                    unlink("../../" . $imagen);
                    unlink('../../imglowres/low' . $array[1]);
                }
            }

            $result = $database->getinfo("SELECT COUNT(*) AS total FROM productos WHERE archivos='$archivo' AND id <> '$id'");
            $count = $result->fetch_assoc()["total"];
            if ($count > 0) {
            } else {

                unlink('../../' . $archivo);
            }

            $database->deleteProduct($id);
            //unset($_SESSION["producto"]);
            echo "1";
        } else {
            echo "error1";
        }
    }
}
