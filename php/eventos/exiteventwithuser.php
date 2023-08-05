<?php

include('../Connection.php');
include('../Crud.php');
session_start();
if (!is_null($_SESSION['user'])) {

    $id_evento = $_GET['id_evento'];
    $id_user = $_GET['id_user'];

    if (isset($id_evento)) {
        if (!empty($id_evento)) {
            $database = new Crud();
            $sqlConnection = new Connection();
          

            $result = $database->getinfo("SELECT COUNT(*) as total FROM listado_evento WHERE id_usuario='$id_user' AND id_evento='$id_evento'");
            //$count = mysqli_num_rows($result);
            $count = $result->fetch_assoc()["total"];
            if ($count != 0) {
                $database->SalirEvento($id_user, $id_evento);
                echo "1";
            }
        }
    }
}