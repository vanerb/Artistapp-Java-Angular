<?php

include('../Connection.php');
include('../Crud.php');
session_start();

$sqlConnection = new Connection();
$sqlData = new crud();

$sql = $sqlConnection->getConnection();
$usuario = $_SESSION['user'];

$result = $sqlData->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");
$count = mysqli_num_rows($result);

while ($row = $result->fetch_assoc()) {
    $id_user = $row['id'];
}



$id_publi = $_GET['id'];


$result = $sqlData->getinfo("SELECT DISTINCT COUNT(*) as total FROM megusta WHERE id_usuario='$id_user' AND id_publicacion = '$id_publi'");
//$count = mysqli_num_rows($result);
$count = $result->fetch_assoc()["total"];
if($count == 0){
    $sqlData->MegustaAddList($id_user, $id_publi);
    $result = $sqlData->getinfo("SELECT DISTINCT COUNT(*) as total FROM megusta WHERE id_usuario='$id_user' AND id_publicacion = '$id_publi' AND megusta='0'");
    //$count = mysqli_num_rows($result);
    $count = $result->fetch_assoc()["total"];
    if($count == 1){
        $sqlData->DargustaList($id_user, $id_publi);

        $sqlData->DarMeGusta($id_publi);
        

    }

}
else{
    $result = $sqlData->getinfo("SELECT COUNT(*) as total FROM megusta WHERE id_usuario='$id_user' AND id_publicacion = '$id_publi' AND megusta='0'");
    //$count = mysqli_num_rows($result);
    $count = $result->fetch_assoc()["total"];
    if($count == 1){
        $sqlData->DargustaList($id_user, $id_publi);

        $sqlData->DarMeGusta($id_publi);


    }

}
