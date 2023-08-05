<?php
include('../Connection.php');
include('../Crud.php');
session_start();
date_default_timezone_set('Europe/Madrid');

if (!is_null($_SESSION['user'])) {

   
    $titulo = $_GET["titulo"];
    $aviso = $_GET["aviso"];
    if(isset($titulo) && isset($aviso)){
        if(!empty($titulo) && !empty($aviso)){
            if(strlen($titulo) > 0 && strlen(trim($titulo)) == 0 || strlen($aviso) > 0 && strlen(trim($aviso)) == 0 || $titulo == "" || $aviso == ""){
               echo "error1";
            }
            else{
                if(strlen($titulo) < 50 && strlen($aviso) < 144){
                    $database = new Crud();
                    $sqlConnection = new Connection();
                    
                    $sql = $sqlConnection->getConnection();
                    $id = $_GET['id'];
                    $id_usuario = $_GET['id_usuario'];
                    $data = array($titulo, $aviso, $id_usuario);
                
                    $database->EditAviso($data, $id);
                    echo "added";
                }
                else{
                    echo "error2";
                }
                
            }
           
        }
    }
    
}