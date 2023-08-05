<?php

include('../Connection.php');
include('../Crud.php');
session_start();
if (!is_null($_SESSION['user'])) {

    $usuario = $_SESSION['user'];
    $id_evento = $_GET['id'];
    if (isset($id_evento)) {
        if (!empty($id_evento)) {
            $database = new Crud();
            $sqlConnection = new Connection();
            $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

            while ($row = $result->fetch_assoc()) {
                $id_usuario = $row['id'];
            }
            $data = array($id_evento, $id_usuario, "pendiente");
            $result = $database->getinfo("SELECT COUNT(*) as total FROM listado_evento WHERE id_usuario='$id_usuario' AND id_evento='$id_evento'");
            $count = $result->fetch_assoc()["total"];
            //$count = mysqli_num_rows($result);

            if ($count == 0) {
                $database->EntrarEvento($data);
                echo "added";
            }
            else{
                echo "error1";
            }
        }
    }
}
