<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$antpassword = $_GET['antcontrasena'];
$contrasena = $_GET["nuevacontrasena"];
$repcontrasena = $_GET["repcontrasena"];

if(isset($antpassword) && isset($contrasena) && isset($repcontrasena)){
    if(!empty($antpassword) && !empty($contrasena) && !empty($repcontrasena)){
        if(strlen($antpassword) > 0 && strlen(trim($antpassword)) == 0 || strlen($contrasena) > 0 && strlen(trim($contrasena)) == 0 || strlen($repcontrasena) > 0 && strlen(trim($repcontrasena)) == 0){
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
                
                $usuario = $_SESSION['user'];
                
                $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");
                
                while ($row = $result->fetch_assoc()) {
                    $id = $row['id'];
                    $password = $row['contrasena'];
                }
                
                if(md5($antpassword) == $password ){
                    if($contrasena == $repcontrasena){
                        $database->ChangePass(md5($contrasena), $id);
                        echo "added";
                    }
                    else{
                        echo "error2";
                    }
                  
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



