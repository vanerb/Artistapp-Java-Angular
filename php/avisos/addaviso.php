<?php
include('../Connection.php');
include('../Crud.php');
session_start();
date_default_timezone_set('Europe/Madrid');

if (!is_null($_SESSION['user'])) {


    $titulo = $_GET["titulo"];
    $aviso = $_GET["aviso"];

    if (isset($titulo) && isset($aviso)) {
        if (!empty($titulo) && !empty($aviso)) {
            if(strlen($titulo) > 0 && strlen(trim($titulo)) == 0 || strlen($aviso) > 0 && strlen(trim($aviso)) == 0 || $titulo == "" || $aviso == ""){
               echo "error1";
            }
            else{
                if(strlen($titulo) < 50 && strlen($aviso) < 144){
                    $database = new Crud();
                    $sqlConnection = new Connection();
                    $sql = $sqlConnection->getConnection();
                    $usuario = $_SESSION['user'];
        
                    $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");
        
                    while ($row = $result->fetch_assoc()) {
                        $id = $row['id'];
                        $id_tipo = $row['id_tipo'];
                    }
                    if ($id_tipo == 1) {
                        $id_usuario = $_GET['id_usuario'];
                        $data = array($titulo, $aviso, date("Y/m/d"), $id_usuario, date("H:i:s"));
        
                        $database->AddAviso($data);
                        echo "added";
                    } else {
                        $data = array($titulo, $aviso, date("Y/m/d"), $id, date("H:i:s"));
        
                        $database->AddAviso($data);
                        echo "added";
                    }
                }
                else{
                    echo "error2";
                }
                
            }
            
        }
    }
}
