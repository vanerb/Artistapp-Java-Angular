<?php
include('../Connection.php');
include('../Crud.php');

$id = $_GET['id'];
$id_prod = $_GET['id_prod'];
if (isset($id)) {
    if (!empty($id)) {
        $database = new Crud();
        $sqlConnection = new Connection();
        $result = $database->getinfo("SELECT productos.id FROM detalles_pedido JOIN pedidos ON detalles_pedido.id_pedido = pedidos.id JOIN usuarios ON pedidos.id_usuario = usuarios.id JOIN productos ON detalles_pedido.id_producto = productos.id WHERE pedidos.id='$id'");
        $count = mysqli_num_rows($result);
        $database->Delvolver($id_prod);
        $database->DevolverProducto($id, $id_prod);
        $database->DeletePedidos($id);
        
        
       
        
        
    }
}

?>