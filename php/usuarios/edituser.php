<?php
include('../Connection.php');
include('../Crud.php');
session_start();

$nombre = $_POST["nombre"];
$apellidos = $_POST["apellidos"];
$usuarionuevo = $_POST["usuario"];
$correo = $_POST["correo"];
$imagenant = $_POST['imagenant'];
$biografia = $_POST['biografia'];

if (!is_null($nombre) && !is_null($apellidos) && !is_null($usuarionuevo) && !is_null($correo) && !is_null($imagenant) && !is_null($biografia)) {
    if (!empty($nombre) &&  !empty($apellidos) && !empty($usuarionuevo) && !empty($correo) && !empty($imagenant) && !empty($biografia)) {
        if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || $nombre == "" || strlen($apellidos) > 0 && strlen(trim($apellidos)) == 0 || $apellidos == "" || strlen($usuarionuevo) > 0 && strlen(trim($usuarionuevo)) == 0 || $usuarionuevo == "" || strlen($correo) > 0 && strlen(trim($correo)) == 0 || $correo == "" || strlen($biografia) > 0 && strlen(trim($biografia)) == 0 || $biografia == "") {
            echo "error1";
        } else {
            $database = new Crud();
            $sqlConnection = new Connection();
            $sql = $sqlConnection->getConnection();


            $usuario = $_SESSION['user'];

            $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

            while ($row = $result->fetch_assoc()) {
                $id = $row['id'];
                $password = $row['contrasena'];
                $imagen = $row['imagen'];
            }

            $result = $database->getinfo("SELECT COUNT(*) as total FROM usuarios WHERE usuario='$usuarionuevo' AND id <> '$id' OR correo = '$correo' AND id<>'$id'");
            
            // Obtener el número de usuarios con ese nombre de usuario
            $count = $result->fetch_assoc()["total"];
            if($count == 0){
                if ($_FILES['imagen']['name'][0] == "") {
                    if(strlen($nombre) > 100 || strlen($apellidos) > 140 || strlen($usuario) > 100 || strlen($correo) > 240 || strlen($biografia) > 240){
                        echo "error4";
                    }
                    else{

                        if (filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                            $data = array($nombre, $apellidos, $usuarionuevo, $correo, $imagenant, $biografia);
    
    
                            $database->EditUser($data, $id);
                            $_SESSION['user'] = $usuarionuevo;
                            echo "added";
                        }
                        else{
                            echo "error8";
                        }


                        
                    }
                   
                } else {
                    if(strlen($nombre) > 100 || strlen($apellidos) > 140 || strlen($usuario) > 100 || strlen($correo) > 240 || strlen($biografia) > 240){
                        echo "error4";
                    }
                    else{
                        $allowed_types = array('image/jpeg', 'image/png');
                        $file_type = mime_content_type($_FILES['imagen']['tmp_name'][0]);
        
                        if (!in_array($file_type, $allowed_types)) {
                            echo "error3";
                        } else {
                            $max_file_size = 2 * 1024 * 1024; // 2MB en bytes
                            if ($_FILES["imagen"]["size"][0] > $max_file_size) {
                                echo "error7";
                            }
                            else{
                                if (filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                                    $nombre_archivo = $_FILES['imagen']['name'][0];
                                    $temp_archivo = $_FILES['imagen']['tmp_name'][0];
                                    $carpeta_destino = '../../usuarios/';
                
                                    $partes_nombre_archivo = explode(".", $nombre_archivo);
                                    $extension = end($partes_nombre_archivo); // Obtener la extensión del archivo de imagen
                
                                    $hash = hash_file('md5', $temp_archivo); // Generar un hash único para el archivo de imagen
                                    $nuevo_nombre = $hash . "." . $extension; // Concatenar el hash y la extensión para crear un nombre de archivo único
                
                                    $destino = $carpeta_destino . $nuevo_nombre;
                                    move_uploaded_file($temp_archivo, $destino); // Mover la imagen al destino con el nuevo nombre único
                
                                    $data = array($nombre, $apellidos, $usuarionuevo, $correo, "usuarios/" . $nuevo_nombre, $biografia);
                
                                    $database->EditUser($data, $id);
                                    $_SESSION['user'] = $usuarionuevo;
                                    
                                    if ($imagen != "media/no-user.png") {
                                        if ($_FILES['imagen']['name'][0] != "") {
                                            $result = $database->getinfo("SELECT COUNT(*) as total FROM usuarios WHERE imagen='$imagen' AND id<>'$id'");
                
                                            // Obtener el número de usuarios con ese nombre de usuario
                                            $count = $result->fetch_assoc()["total"];
                                            //$imagenpartes = explode("/", $imagen);
                
                                            if ($count == 0) {
                                                unlink("../../".$imagen);
                                            } 
                                        }
                                    }
                                    echo "added";
                                }
                                else{
                                    echo "error8";
                                }
                                
                            }
                           
                        } 
                    }
                    
                }

            }
            else{
                echo "error2";
            }
            
        }
    }
}
