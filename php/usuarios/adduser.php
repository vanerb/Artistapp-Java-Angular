<?php
include('../Connection.php');
include('../Crud.php');


$nombre = $_GET["nombre"];
$apellidos = $_GET["apellidos"];
$usuario = $_GET["usuario"];
$correo = $_GET["correo"];
$contrasena = $_GET["contrasena"];
$repcontrasena = $_GET["repcontrasena"];
$tipo = $_GET['id_tipo'];

if (isset($nombre) && isset($apellidos) && isset($usuario) && isset($correo) && isset($contrasena) && isset($repcontrasena)) {
    if (!empty($nombre) && !empty($apellidos) && !empty($usuario) && !empty($correo) && !empty($contrasena) && !empty($repcontrasena)) {
        if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || strlen($usuario) > 0 && strlen(trim($usuario)) == 0 || strlen($apellidos) > 0 && strlen(trim($apellidos)) == 0 || strlen($correo) > 0 && strlen(trim($correo)) == 0 || strlen($contrasena) > 0 && strlen(trim($contrasena)) == 0 || strlen($repcontrasena) > 0 && strlen(trim($repcontrasena)) == 0) {
            echo "error1";
        } else {
            if (strlen($nombre) > 100 || strlen($apellidos) > 140 || strlen($usuario) > 100 || strlen($correo) > 240 || strlen($contrasena) > 240) {
                echo "error3";
            } else {


                function validatePassword($password)
                {
                    $pattern = "/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/";
                    return preg_match($pattern, $password);
                }

                if (filter_var($correo, FILTER_VALIDATE_EMAIL)) {

                    if (validatePassword($contrasena)) {
                        $database = new Crud();
                        $sqlConnection = new Connection();
                        $sql = $sqlConnection->getConnection();

                        $result = $database->getinfo("SELECT COUNT(*) as total FROM usuarios WHERE usuario='$usuario'");

                        // Obtener el número de usuarios con ese nombre de usuario
                        $count = $result->fetch_assoc()["total"];

                        if ($count == 0) {
                            $result = $database->getinfo("SELECT COUNT(*) as total FROM usuarios WHERE correo='$correo'");

                            // Obtener el número de usuarios con ese nombre de usuario
                            $count = $result->fetch_assoc()["total"];
                            if ($count == 0) {
                                if ($contrasena == $repcontrasena) {
                                    $data = array($nombre, $apellidos, $usuario, $correo, md5($contrasena), $tipo, "media/no-user.png", "Aún no tiene");

                                    $database->AddUser($data);
                                    echo "added";
                                } else {
                                    echo "error5";
                                }
                            } else {
                                echo "error6";
                            }
                        } else {

                            echo "error2";
                        }
                    } else {
                        echo "error7";
                    }
                } else {
                    echo "error8";
                }
            }
        }
    }
}
