<?php
include('../Connection.php');
include('../Crud.php');

session_start();


$id = $_GET['id'];
if (isset($id)) {
    if (!empty($id)) {
        $database = new Crud();
        $sqlConnection = new Connection();

        $sql = $sqlConnection->getConnection();

        $result = $database->getinfo("SELECT * FROM publicaciones WHERE id='$id'");
        $count = mysqli_num_rows($result);


        while ($row = $result->fetch_assoc()) {


            $imagen = $row['imagen'];
        }

        $result = $database->getinfo("SELECT COUNT(*) as total FROM publicaciones WHERE imagen='$imagen' AND id<>'$id'");
        //$count = mysqli_num_rows($result);
        $count = $result->fetch_assoc()["total"];
        if ($count == 0) {
            unlink("../../" . $imagen);
        } else {
            
        }
        $database->VaciarMeGustaList($id);
        $database->DeletePubli($id);
        //unset($_SESSION["producto"]);
        
        echo "1";
        

        
    }
}