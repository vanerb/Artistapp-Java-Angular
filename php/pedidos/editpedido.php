<?php
include('../Connection.php');
include('../Crud.php');
session_start();
$sqlConnection = new Connection();
$sqlData = new crud();
$id = $_GET['id'];


$nombre = $_GET["nombre"];
$estado = $_GET["estado"];
$usuario = $_GET["usuario"];
$direccion = $_GET['direccion'];
$telefono = $_GET['telefono'];

if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || $nombre == "" || strlen($direccion) > 0 && strlen(trim($direccion)) == 0 || $direccion == "" || strlen($telefono) > 0 && strlen(trim($telefono)) == 0 || $telefono == "") {
    echo "error3";
} else {

    if (strlen($nombre) < 80 && strlen($direccion) < 244 && strlen($telefono) < 15) {

        $numerotel = preg_replace('/[^0-9]/', '', $telefono);

        if (preg_match('/^[0-9]{9}$/', $numerotel)) {

            $data = array($usuario, $nombre, $estado, $direccion, $numerotel);

            $sqlData->EditPedido($data, $id);
            echo "added";
        }
        else{
            echo "error4";
        }
    } else {
        echo "error2";
    }
}
