<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$id = $_GET['id'];

$contrasena = $_GET["nuevacontrasena"];
$repcontrasena = $_GET["repcontrasena"];

if(isset($contrasena) && isset($repcontrasena)){
    if(!empty($contrasena) && !empty($repcontrasena)){
        if(strlen($contrasena) > 0 && strlen(trim($contrasena)) == 0 || strlen($repcontrasena) > 0 && strlen(trim($repcontrasena)) == 0){
            echo "error1";
        }
        else{
            function validatePassword($password)
            {
                $pattern = "/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/";
                return preg_match($pattern, $password);
            }

            if (validatePassword($contrasena)) {
                $database = new Crud();
                $sqlConnection = new Connection();
                $sql = $sqlConnection->getConnection();
                
                if($contrasena == $repcontrasena){
                    $database->ChangePass(md5($contrasena), $id);
                    echo "added";
                }
                else{
                    echo "error2";
                }
            }
            else{
                echo "error7";
            }


            
        }
    }
}



