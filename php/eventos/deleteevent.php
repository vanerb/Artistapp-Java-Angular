<?php
include('../Connection.php');
include('../Crud.php');

$id = $_GET['id'];
if (isset($id)) {
    if (!empty($id)) {
        $database = new Crud();
        $sqlConnection = new Connection();

        $result = $database->getinfo("SELECT * FROM eventos WHERE id='$id'");

        while ($row = $result->fetch_assoc()) {
            $imagen = $row['imagen'];
        }

        $result = $database->getinfo("SELECT COUNT(*) as total FROM eventos WHERE imagen='$imagen' AND id<>'$id'");
        $count = $result->fetch_assoc()["total"];
        //$count = mysqli_num_rows($result);
        if ($count == 0) {
            if ($imagen == "media/ni-image.jpg") {
            } else {
                unlink("./../../" . $imagen);
            }
        } else {
        }
        $database->VaciarEvento($id);
        $database->DeleteEvento($id);
    }
}
