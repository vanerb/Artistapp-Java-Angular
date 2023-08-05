<?php
include('../Connection.php');
include('../Crud.php');
session_start();
if (!is_null($_SESSION['user'])) {


    $nombre = $_POST["nombre"];
    $descripcion = $_POST["descripcion"];
    $tipo_publi = $_POST["tipo"];
    $id_categoria = $_POST["id_categoria"];


    if (!empty($nombre) && !empty($descripcion)) {
        if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || strlen($descripcion) > 0 && strlen(trim($descripcion)) == 0) {
            echo "error1";
        } else {
            if(strlen($nombre) < 45 && strlen($descripcion) < 244){
                $database = new Crud();
                $sqlConnection = new Connection();
                if (0 < $_FILES['imgpubli']['error'][0]) {
                    echo 'Error: ' . $_FILES['imgpubli']['error'][0] . '<br>';
                } else {
    
                    $sql = $sqlConnection->getConnection();
                    $usuario = $_SESSION['user'];
    
                    $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");
    
                    while ($row = $result->fetch_assoc()) {
                        $id = $row['id'];
                        $tipo = $row['id_tipo'];
                    }
                    if ($tipo == 1) {
                        if ($_FILES['imgpubli']['name'][0] == "") {
                        } else {
                            $id_usuario = $_POST['id_usuario'];
                            $allowed_types = array('image/jpeg', 'image/png');
                            $file_type = mime_content_type($_FILES['imgpubli']['tmp_name'][0]);
    
                            if (!in_array($file_type, $allowed_types)) {
                                echo "error3";
                            } else {
                                $max_file_size = 2 * 1024 * 1024; // 2MB en bytes
                                if ($_FILES["imgpubli"]["size"][0] > $max_file_size) {
                                    echo "error7";
                                }
                                else{
                                    $nombre_archivo = $_FILES['imgpubli']['name'][0];
                                    $temp_archivo = $_FILES['imgpubli']['tmp_name'][0];
                                    $carpeta_destino = '../../publicaciones/';
            
                                    $partes_nombre_archivo = explode(".", $nombre_archivo);
                                    $extension = end($partes_nombre_archivo); // Obtener la extensión del archivo de imagen
            
                                    $hash = hash_file('md5', $temp_archivo); // Generar un hash único para el archivo de imagen
                                    $nuevo_nombre = $hash . "." . $extension; // Concatenar el hash y la extensión para crear un nombre de archivo único
            
                                    $destino = $carpeta_destino . $nuevo_nombre;
                                    move_uploaded_file($temp_archivo, $destino); // Mover la imagen al destino con el nuevo nombre único
            
                                    $data = array($nombre, $descripcion, $tipo_publi, $id_categoria, $id_usuario, 0, "publicaciones/" . $nuevo_nombre);
            
                                    $database->AddPubli($data);
                                    echo "added";
                                }
                                
                            }
                           
                        }
                    } else {
                        if ($_FILES['imgpubli']['name'][0] == "") {
                        } else {
                            $allowed_types = array('image/jpeg', 'image/png');
                            $file_type = mime_content_type($_FILES['imgpubli']['tmp_name'][0]);
    
                            if (!in_array($file_type, $allowed_types)) {
                                echo "error3";
                            } else {
                                $max_file_size = 2 * 1024 * 1024; // 2MB en bytes
                                if ($_FILES["imgpubli"]["size"][0] > $max_file_size) {
                                    echo "error7";
                                }
                                else{
                                    $nombre_archivo = $_FILES['imgpubli']['name'][0];
                                    $temp_archivo = $_FILES['imgpubli']['tmp_name'][0];
                                    $carpeta_destino = '../../publicaciones/';
            
                                    $partes_nombre_archivo = explode(".", $nombre_archivo);
                                    $extension = end($partes_nombre_archivo); // Obtener la extensión del archivo de imagen
            
                                    $hash = hash_file('md5', $temp_archivo); // Generar un hash único para el archivo de imagen
                                    $nuevo_nombre = $hash . "." . $extension; // Concatenar el hash y la extensión para crear un nombre de archivo único
            
                                    $destino = $carpeta_destino . $nuevo_nombre;
                                    move_uploaded_file($temp_archivo, $destino); // Mover la imagen al destino con el nuevo nombre único
            
                                    $data = array($nombre, $descripcion, $tipo_publi, $id_categoria, $id, 0, "publicaciones/" . $nuevo_nombre);
            
                                    $database->AddPubli($data);
                                    echo "added";
                                }
                               
                            }
                            
                        }
                    }
                }
            }
            else{
                echo "error4";
            }
            
        }
    }
}
