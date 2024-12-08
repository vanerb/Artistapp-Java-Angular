<?php

session_start();
include('Connection.php');
include('Crud.php');

//session_start();

if (!is_null($_SESSION['user'])) {
    $sqlConnection = new Connection();
    $sqlData = new crud();
    $sql = $sqlConnection->getConnection();
    $usuario = $_SESSION['user'];

    $result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

    while ($row = $result->fetch_assoc()) {
        $id_tipo = $row['id_tipo'];
        //$jsonData[] = $row;
    }
    if ($id_tipo == "5"){
        echo "1";
    } else if ($id_tipo == "1") {
        echo "2";
    } else if($id_tipo == "7"){
        echo "3";
    }else if($id_tipo == "3"){
        echo "4";

    } else {
        echo "200";
    }

   
}



