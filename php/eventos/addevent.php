<?php
include('../Connection.php');
include('../Crud.php');
session_start();
date_default_timezone_set('Europe/Madrid');


$nombre = $_POST["nombre"];
$ubicacion = $_POST["ubicacion"];
$link = $_POST["link"];
$fechainicio = $_POST["fechainicio"];
$fechafin = $_POST["fechafin"];
//$id_usuario = $_POST["fechafin"];
$usuario_select = $_POST['id_usuario'];

if (isset($nombre) && isset($ubicacion) && isset($link) && isset($fechafin) && isset($fechainicio)) {
    if (!empty($nombre) && !empty($fechainicio) && !empty($fechafin)) {
        if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || $nombre == "") {
            echo "error1";
        } else {
            $inicio_fecha = date("Y/m/d", strtotime($fechainicio));
            $fin_fecha = date("Y/m/d", strtotime($fechafin));


            $database = new Crud();
            $sqlConnection = new Connection();
            if (0 < $_FILES['imgeventoadd']['error'][0]) {
                echo 'Error: ' . $_FILES['imgeventoadd']['error'][0] . '<br>';
            } else {

                $sql = $sqlConnection->getConnection();
                $usuario = $_SESSION['user'];

                $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

                while ($row = $result->fetch_assoc()) {
                    $id = $row['id'];
                    $id_tipo = $row['id_tipo'];
                }
                if (strlen($ubicacion) > 0 && strlen(trim($ubicacion)) == 0 || $ubicacion == "") {
                    $ubicacion = "No tiene";
                }

                if (strlen($link) > 0 && strlen(trim($link)) == 0 || $link == "") {
                    $link = "Sin Link";
                }


                if ($id_tipo == 1) {
                    if ($inicio_fecha < $fin_fecha) {
                        if ($fin_fecha >= date("Y/m/d")) {
                            if ($_FILES['imgeventoadd']['name'][0] == "") {
                                if (strlen($nombre) < 80 && strlen($ubicacion) < 80 && strlen($link) < 244) {
                                    $nombretrim = strtolower(trim($nombre));
                                    $result = $database->getinfo("SELECT COUNT(*) as total FROM eventos WHERE LOWER(TRIM(nombre)) = '$nombretrim'");
                                    $count = $result->fetch_assoc()["total"];
                                    if ($count == 0) {
                                        $data = array($nombre, $ubicacion, $link, $inicio_fecha, $fin_fecha, $usuario_select, "media/ni-image.jpg");

                                        $database->AnadirEvento($data);
                                        echo "added";
                                    } else {
                                        echo "error5";
                                    }
                                } else {
                                    echo "error4";
                                }
                            } else {
                                $allowed_types = array('image/jpeg', 'image/png');
                                $file_type = mime_content_type($_FILES['imgeventoadd']['tmp_name'][0]);

                                if (!in_array($file_type, $allowed_types)) {
                                    echo "error3";
                                } else {
                                    if (strlen($nombre) < 80 && strlen($ubicacion) < 80 && strlen($link) < 244) {
                                        $nombretrim = strtolower(trim($nombre));
                                        $result = $database->getinfo("SELECT COUNT(*) as total FROM eventos WHERE LOWER(TRIM(nombre)) = '$nombretrim'");
                                        $count = $result->fetch_assoc()["total"];
                                        if ($count == 0) {
                                            $max_file_size = 2 * 1024 * 1024; // 2MB en bytes
                                            if ($_FILES["imgeventoadd"]["size"][0] > $max_file_size) {
                                                echo "error7";
                                            }
                                            else{
                                                $nombre_archivo = $_FILES['imgeventoadd']['name'][0];
                                                $temp_archivo = $_FILES['imgeventoadd']['tmp_name'][0];
                                                $carpeta_destino = '../../imgevento/';
    
                                                $partes_nombre_archivo = explode(".", $nombre_archivo);
                                                $extension = end($partes_nombre_archivo); // Obtener la extensión del archivo de imagen
    
                                                $hash = hash_file('md5', $temp_archivo); // Generar un hash único para el archivo de imagen
                                                $nuevo_nombre = $hash . "." . $extension; // Concatenar el hash y la extensión para crear un nombre de archivo único
    
                                                $destino = $carpeta_destino . $nuevo_nombre;
                                                move_uploaded_file($temp_archivo, $destino); // Mover la imagen al destino con el nuevo nombre único
    
                                                $data = array($nombre, $ubicacion, $link, $inicio_fecha, $fin_fecha, $usuario_select, "imgevento/" . $nuevo_nombre);
    
                                                $database->AnadirEvento($data);
                                                echo "added";
                                            }
                                           
                                        } else {
                                            echo "error5";
                                        }
                                    } else {
                                        echo "error4";
                                    }
                                }
                            }
                        } else {
                            echo "error2";
                        }
                    } else {
                        echo "error2";
                    }
                } else if ($id_tipo == 3) {
                    if ($inicio_fecha < $fin_fecha) {
                        if ($fin_fecha >= date("Y/m/d")) {
                            if ($_FILES['imgeventoadd']['name'][0] == "") {
                                if (strlen($nombre) < 80 && strlen($ubicacion) < 80 && strlen($link) < 244) {
                                    $nombretrim = strtolower(trim($nombre));
                                    $result = $database->getinfo("SELECT COUNT(*) as total FROM eventos WHERE LOWER(TRIM(nombre)) = '$nombretrim'");
                                    $count = $result->fetch_assoc()["total"];
                                    if ($count == 0) {
                                        $data = array($nombre, $ubicacion, $link, $inicio_fecha, $fin_fecha, $id, "media/ni-image.jpg");

                                        $database->AnadirEvento($data);
                                        echo "added";
                                    } else {
                                        echo "error5";
                                    }
                                } else {
                                    echo "error4";
                                }
                            } else {

                                $allowed_types = array('image/jpeg', 'image/png');
                                $file_type = mime_content_type($_FILES['imgeventoadd']['tmp_name'][0]);

                                if (!in_array($file_type, $allowed_types)) {
                                    echo "error3";
                                } else {
                                    if (strlen($nombre) < 80 && strlen($ubicacion) < 80 && strlen($link) < 244) {
                                        $nombretrim = strtolower(trim($nombre));
                                        $result = $database->getinfo("SELECT COUNT(*) as total FROM eventos WHERE LOWER(TRIM(nombre)) = '$nombretrim'");
                                        $count = $result->fetch_assoc()["total"];
                                        if ($count == 0) {
                                            $max_file_size = 2 * 1024 * 1024; // 2MB en bytes
                                            if ($_FILES["imgeventoadd"]["size"][0] > $max_file_size) {
                                                echo "error7";
                                            }
                                            else{
                                                $nombre_archivo = $_FILES['imgeventoadd']['name'][0];
                                                $temp_archivo = $_FILES['imgeventoadd']['tmp_name'][0];
                                                $carpeta_destino = '../../imgevento/';
    
                                                $partes_nombre_archivo = explode(".", $nombre_archivo);
                                                $extension = end($partes_nombre_archivo); // Obtener la extensión del archivo de imagen
    
                                                $hash = hash_file('md5', $temp_archivo); // Generar un hash único para el archivo de imagen
                                                $nuevo_nombre = $hash . "." . $extension; // Concatenar el hash y la extensión para crear un nombre de archivo único
    
                                                $destino = $carpeta_destino . $nuevo_nombre;
                                                move_uploaded_file($temp_archivo, $destino); // Mover la imagen al destino con el nuevo nombre único
    
    
                                                $data = array($nombre, $ubicacion, $link, $inicio_fecha, $fin_fecha, $id, "imgevento/" . $nuevo_nombre);
    
                                                $database->AnadirEvento($data);
                                                echo "added";
                                            }
                                           
                                        } else {
                                            echo "error5";
                                        }
                                    } else {
                                        echo "error4";
                                    }
                                }
                            }
                        } else {
                            echo "error2";
                        }
                    } else {
                        echo "error2";
                    }
                }
            }
        }
    }
}
