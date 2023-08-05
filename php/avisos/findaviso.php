<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$id=$_GET['id'];
if(isset($id)){
    if(!empty($id)){
        $sqlConnection = new Connection();
        $sqlData = new crud();
        $sql = $sqlConnection->getConnection();
        
        $result = $sqlData->getinfo("SELECT avisos.*, usuarios.usuario AS usuario FROM avisos JOIN usuarios ON avisos.id_usuario = usuarios.id WHERE avisos.id='$id' ");
        $jsonData = array();
        
        
        
        while ($row = $result->fetch_assoc()) {
        
            $jsonData[] = $row;
        }
        
        echo json_encode($jsonData);
    }
}
