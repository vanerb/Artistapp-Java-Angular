<?php

include('../Connection.php');
include('../Crud.php');
session_start();


$id_evento = $_GET['id_evento'];
$id_usuario = $_GET['id_user'];


if (!empty($id_evento) && !empty($id_usuario)) {
    $database = new Crud();
    $sqlConnection = new Connection();
    $database->EditaEstadoEvento("aceptado", $id_usuario, $id_evento);
}
