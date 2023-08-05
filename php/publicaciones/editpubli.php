<?php
include('../Connection.php');
include('../Crud.php');
session_start();
if (!is_null($_SESSION['user'])) {
    $nombre = $_POST["nombre"];
    $descripcion = $_POST["descripcion"];
    $tipo_publi = $_POST["tipo"];
    $id_categoria = $_POST["id_categoria"];
    $megusta = $_POST['megusta'];

    $imgant = $_POST['imgant'];

    $id = $_GET['id'];

    $database = new Crud();
    $sqlConnection = new Connection();

    $usuario = $_SESSION['user'];

    $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

    while ($row = $result->fetch_assoc()) {
        $id_usuario = $row['id'];
        $tipo = $row['id_tipo'];
    }


    if ($tipo == 1) {
        if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || $nombre == "" || strlen($descripcion) > 0 && strlen(trim($descripcion)) == 0 || $descripcion == "" || strlen($megusta) > 0 && strlen(trim($megusta)) == 0 || $megusta == "") {
            echo "error1";
        } else {
            if (strlen($nombre) < 45 && strlen($descripcion) < 244) {


                $id_user = $_POST['id_usuario'];
                $result = $database->getinfo("SELECT COUNT(*) as total FROM megusta WHERE id_publicacion = '$id'");
                //$count = mysqli_num_rows($result);
                $count = $result->fetch_assoc()["total"];
                if ($megusta < $count) {
                    echo "error8";
                } else {
                    if (0 < $_FILES['imgpublied']['error'][0]) {
                        echo 'Error: ' . $_FILES['imgpublied']['error'][0] . '<br>';
                    } else {

                        $sql = $sqlConnection->getConnection();

                        if ($_FILES['imgpublied']['name'][0] == "") {
                            $result = $database->getinfo("SELECT * FROM publicaciones WHERE id='$id'");

                            while ($row = $result->fetch_assoc()) {
                                $imagen = $row['imagen'];
                            }


                            $data = array($nombre, $descripcion, $tipo_publi, $id_categoria, $id_user, $megusta, $imgant);

                            $database->EditPubli($data, $id);

                            $result = $database->getinfo("SELECT COUNT(*) as total FROM publicaciones WHERE imagen='$imagen'");

                            // Obtener el número de usuarios con ese nombre de usuario
                            $count = $result->fetch_assoc()["total"];

                            //$imagenpartes = explode("/", $imagen);
                            if ($count == 0) {
                                unlink("../../".$imagen);
                            }

                            echo "added";
                        } else {
                            $result = $database->getinfo("SELECT * FROM publicaciones WHERE id='$id'");

                            while ($row = $result->fetch_assoc()) {
                                $imagen = $row['imagen'];
                            }
                            $allowed_types = array('image/jpeg', 'image/png');
                            $file_type = mime_content_type($_FILES['imgpublied']['tmp_name'][0]);

                            if (!in_array($file_type, $allowed_types)) {
                                echo "error3";
                            } else {
                                $max_file_size = 2 * 1024 * 1024; // 2MB en bytes
                                if ($_FILES["imgpublied"]["size"][0] > $max_file_size) {
                                    echo "error7";
                                } else {
                                    $nombre_archivo = $_FILES['imgpublied']['name'][0];
                                    $temp_archivo = $_FILES['imgpublied']['tmp_name'][0];
                                    $carpeta_destino = '../../publicaciones/';

                                    $partes_nombre_archivo = explode(".", $nombre_archivo);
                                    $extension = end($partes_nombre_archivo); // Obtener la extensión del archivo de imagen

                                    $hash = hash_file('md5', $temp_archivo); // Generar un hash único para el archivo de imagen
                                    $nuevo_nombre = $hash . "." . $extension; // Concatenar el hash y la extensión para crear un nombre de archivo único

                                    $destino = $carpeta_destino . $nuevo_nombre;
                                    move_uploaded_file($temp_archivo, $destino); // Mover la imagen al destino con el nuevo nombre único

                                    $data = array($nombre, $descripcion, $tipo_publi, $id_categoria, $id_user, $megusta, "publicaciones/" . $nuevo_nombre);

                                    $database->EditPubli($data, $id);

                                    $result = $database->getinfo("SELECT COUNT(*) as total FROM publicaciones WHERE imagen='$imagen'");

                                    // Obtener el número de usuarios con ese nombre de usuario
                                    $count = $result->fetch_assoc()["total"];

                                   // $imagenpartes = explode("/", $imagen);
                                    if ($count == 0) {
                                        unlink("../../".$imagen);
                                    }


                                    echo "added";
                                }
                            }
                        }
                    }
                }
            } else {
                echo "error4";
            }
        }
    } else {

        if (strlen($nombre) > 0 && strlen(trim($nombre)) == 0 || $nombre == "" || strlen($descripcion) > 0 && strlen(trim($descripcion)) == 0 || $descripcion == "" ) {
            echo "error1";
        } else {
            if (strlen($nombre) < 45 && strlen($descripcion) < 244) {
                $data = array($nombre, $descripcion, $id_categoria, $id_usuario);

                $database->EditPubliUser($data, $id);
                echo "added";
            }
        }

       
    }
}
