<?php

include('../Connection.php');
include('../Crud.php');
session_start();


$id_tipo = $_GET['tipo'];
if (isset($id_tipo)) {
    if (!empty($id_tipo)) {
        $sqlConnection = new Connection();
        $sqlData = new crud();
        $sql = $sqlConnection->getConnection();
        if ($id_tipo != 2) {
            $usuario = $_SESSION['user'];

            $result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

            while ($row = $result->fetch_assoc()) {
                $id_user = $row['id'];
            }
            $result = $sqlData->getinfo("SELECT avisos.*, usuarios.usuario AS usuario FROM avisos JOIN usuarios ON avisos.id_usuario = usuarios.id WHERE id_usuario = '$id_user' ORDER BY avisos.fecha_publicacion DESC, avisos.hora DESC ");
            $jsonData = array();



            while ($row = $result->fetch_assoc()) {

                $jsonData[] = $row;
            }

            echo json_encode($jsonData);
        } else {


            $result = $sqlData->getinfo("SELECT avisos.*, usuarios.usuario AS usuario FROM avisos JOIN usuarios ON avisos.id_usuario = usuarios.id ORDER BY avisos.fecha_publicacion DESC, avisos.hora DESC");
            $jsonData = array();



            while ($row = $result->fetch_assoc()) {

                $jsonData[] = $row;
            }

            echo json_encode($jsonData);
        }
    }
}
