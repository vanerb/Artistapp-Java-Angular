<?php
include('../Connection.php');
include('../Crud.php');
session_start();
if (!is_null($_SESSION['user'])) {
    $database = new Crud();
    $sqlConnection = new Connection();

    $sql = $sqlConnection->getConnection();
    $usuario = $_SESSION['user'];

    $result = $database->getinfo("SELECT * FROM usuarios WHERE usuario='$usuario'");

    while ($row = $result->fetch_assoc()) {
        $id = $row['id'];
    }

    $nombre = $_GET['nombre'];
    $direccion = $_GET['direccion'];
    $telefono = $_GET['telefono'];

    $pago = $_GET['totalpagar'];

    $tarjeta = $_GET['numerotarjeta'];
    $vencimiento = $_GET['vencimiento'];
    $cvv = $_GET['cvv'];

    $numerotel = preg_replace('/[^0-9]/', '', $telefono);

    if(preg_match('/^[0-9]{9}$/', $numerotel)){
        if(preg_match("/^(?:4[0-9]{12}(?:[0-9]{3})?)|(?:5[1-5][0-9]{14})$/", $tarjeta)){
            if(preg_match("/^\d{3,4}$/", $cvv)){
                $timestamp = strtotime($vencimiento);
                if($timestamp === false || $timestamp < time()){
                    echo "error4";
                }
                else{
                    $result = $database->getinfo("SELECT COUNT(*) as total FROM cesta JOIN cesta_producto ON cesta_producto.id_cesta = cesta.id JOIN productos ON cesta_producto.id_producto = productos.id WHERE cesta.id_usuario='$id' AND productos.cantidad <= 0");
                    $count = $result->fetch_assoc()["total"];

                    if($count == 0){
                        $data = array($id, $nombre, "preparando", $direccion, $numerotel, $pago);

                        $database->addpedido($data);
                        echo "added";
    
                        
    
                        
    
    
                    
                        $result = $database->getinfo("SELECT * FROM pedidos WHERE id_usuario='$id'");
                        while ($row = $result->fetch_assoc()) {
                            $id_pedido = $row['id'];
                        }
                    
                        $result = $database->getinfo("SELECT * FROM cesta JOIN cesta_producto ON cesta_producto.id_cesta = cesta.id WHERE cesta.id_usuario='$id'");
                    
                        while ($row = $result->fetch_assoc()) {
                            $id_productos = $row['id_producto'];
                            $id_cesta = $row['id_cesta'];
                            $data = array($id_pedido, $id_productos);
    
    
    
                            $database->adddetallespedido($data);
                            $database->Stock($id_productos);
                            $database->vaciar_cesta_producto($id_cesta);
                    
                        }
                        $database->vaciar_cesta($id);
                    }
                    else{
                        $result = $database->getinfo("SELECT cesta_producto.id_producto, cesta_producto.id_cesta FROM cesta JOIN cesta_producto ON cesta_producto.id_cesta = cesta.id JOIN productos ON cesta_producto.id_producto = productos.id WHERE cesta.id_usuario='$id' AND productos.cantidad <= 0");
                        while ($row = $result->fetch_assoc()) {
                            $id_productos_cantidad = $row['id_producto'];
                            $id_cesta_producto = $row['id_cesta'];
                            $database->deleteElementCesta($id_productos_cantidad,$id_cesta_producto);
                        }
                        
                        echo "error5";
                    }

                    
                }
               
            }
            else{
                echo "error3";
            }
            
        }
        else{
            echo "error2";
        }
        
    }
    else{
        echo "error1";
    }
   
    

}
