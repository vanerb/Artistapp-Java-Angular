<?php
include('../Connection.php');
include('../Crud.php');

$id = $_GET['id'];
if (isset($id)) {
    if (!empty($id)) {
        $database = new Crud();
        $sqlConnection = new Connection();

        $database->EliminarInforme($id);
        
        
    }
}

?>