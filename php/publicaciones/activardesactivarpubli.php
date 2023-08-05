<?php
include('../Connection.php');
include('../Crud.php');

session_start();


$id = $_GET['id'];
if (isset($id)) {

    $database = new Crud();
    $sqlConnection = new Connection();

    $sql = $sqlConnection->getConnection();

    $result = $database->getinfo("SELECT * FROM publicaciones WHERE id='$id'");

    while ($row = $result->fetch_assoc()) {


        $tipo = $row['tipo'];
    }

    if ($tipo == "public") {
        $database->ActivaDesactivaPubli($id, "private");
    } else {
        $database->ActivaDesactivaPubli($id, "public");
    }
}
