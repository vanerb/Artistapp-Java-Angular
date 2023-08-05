<?php
include('../Connection.php');
include('../Crud.php');
session_start();

if (!is_null($_SESSION['user'])) {


    $id_usuarioref = $_GET["usuariotarget"];
    $informe = $_GET["informe"];

    if (isset($informe)) {
        if (!empty($informe)) {
            if (strlen($informe) > 0 && strlen(trim($informe)) == 0 || $informe == "") {
                echo "error1";
            } else {
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
                    $id_usuario = $_GET['id_usuarioselect'];
                    if ($id_usuario === $id_usuarioref) {
                        echo "error2";
                    } else {
                        $data = array($id_usuario, $informe, $id_usuarioref, "pendiente");

                        $database->AddInforme($data);
                        echo "added";
                    }
                } else {
                    if ($id === $id_usuarioref) {
                        echo "error2";
                    } else {
                        $data = array($id, $informe, $id_usuarioref, "pendiente");

                        $database->AddInforme($data);
                        echo "added";
                    }
                }
            }
        }
    }
}
