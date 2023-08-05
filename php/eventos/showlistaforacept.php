<?php

include('../Connection.php');
include('../Crud.php');
session_start();


$id = $_GET['id'];
if (isset($id)) {
    if (!empty($id)) {
        $sqlConnection = new Connection();
        $sqlData = new crud();
        $sql = $sqlConnection->getConnection();
        $result = $sqlData->getinfo("SELECT usuarios.*, eventos.nombre as evento_nombre, listado_evento.estado FROM listado_evento JOIN usuarios ON listado_evento.id_usuario = usuarios.id JOIN eventos ON listado_evento.id_evento = eventos.id WHERE listado_evento.id_evento='$id' AND listado_evento.estado = 'pendiente'");

        $jsonData = array();



        while ($row = $result->fetch_assoc()) {

            
            $jsonData[] = $row;
            

           
        }

        echo json_encode($jsonData);
    }
}
