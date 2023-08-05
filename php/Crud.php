<?php

class Crud
{
    public function getinfo($sql)
    {
        $sqlConnection = new Connection();
        $mySQL = $sqlConnection->getConnection();

        $result = $mySQL->query($sql);
        return $result;
    }

    public function addProduct($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO productos(nombre, descripcion, precio, cantidad, imagen, id_tipo, id_usuario, archivos) VALUES ('$data[0]','$data[1]', '$data[2]', '$data[3]', '$data[4]', '$data[5]', '$data[6]', '$data[7]')";

        $mysql->query($sql);
    }

    public function deleteProduct($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM productos WHERE id='$id'";

        $mysql->query($sql);
    }

    public function editProduct($id, $data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE productos SET nombre='$data[0]', descripcion='$data[1]', precio='$data[2]', cantidad='$data[3]', imagen='$data[4]', id_tipo='$data[5]', id_usuario = '$data[6]', archivos = '$data[7]' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function addcesta($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO cesta(id_usuario) VALUES ('$data[0]')";

        $mysql->query($sql);
    }

    public function addcesta_producto($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO cesta_producto(id_cesta, id_producto) VALUES ('$data[0]','$data[1]')";

        $mysql->query($sql);
    }

    public function vaciar_cesta_producto($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM cesta_producto WHERE id_cesta='$id'";

        $mysql->query($sql);
    }

    public function vaciar_cesta($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM cesta WHERE id_usuario='$id'";

        $mysql->query($sql);
    }


    public function eliminar_cesta($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM cesta WHERE id='$id'";

        $mysql->query($sql);
    }

    public function eliminar_cestabyuser($id_usuario)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM cesta WHERE id_usuario='$id_usuario'";

        $mysql->query($sql);
    }

    public function deleteElementCesta($id_producto, $id_cesta)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM cesta_producto WHERE id_producto='$id_producto' AND id_cesta = '$id_cesta'";

        $mysql->query($sql);
    }

    public function addpedido($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO pedidos(id_usuario, nombre, estado, direccion, telefono, pago) VALUES ('$data[0]','$data[1]', '$data[2]', '$data[3]', '$data[4]', '$data[5]')";

        $mysql->query($sql);
    }

    public function adddetallespedido($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO detalles_pedido(id_pedido, id_producto) VALUES ('$data[0]','$data[1]')";

        $mysql->query($sql);
    }

    public function Stock($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE productos SET cantidad=cantidad-1 WHERE id='$id'";

        $mysql->query($sql);
    }

    public function Delvolver($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE productos SET cantidad=cantidad+1 WHERE id='$id'";

        $mysql->query($sql);
    }

    public function VaciarDetallesPedidos($id_pedido)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM detalles_pedido WHERE id_pedido='$id_pedido'";

        $mysql->query($sql);
    }

    public function DevolverProducto($id_pedido, $id_producto)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM detalles_pedido WHERE id_pedido='$id_pedido' AND id_producto='$id_producto'";

        $mysql->query($sql);
    }

    public function DeletePedidos($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM pedidos WHERE id='$id'";

        $mysql->query($sql);
    }

    public function EditPedido($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE pedidos SET id_usuario='$data[0]', nombre='$data[1]', estado='$data[2]', direccion = '$data[3]', telefono = '$data[4]' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function EntrarEvento($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO listado_evento(id_evento, id_usuario, estado) VALUES ('$data[0]', '$data[1]', '$data[2]')";

        $mysql->query($sql);
    }

    public function SalirEvento($id_user, $id_evento)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM listado_evento WHERE id_usuario='$id_user' AND id_evento='$id_evento'";

        $mysql->query($sql);
    }



    public function AnadirEvento($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO eventos(nombre, ubicacion, link, fecha_inicio, fecha_fin, id_usuario, imagen) VALUES ('$data[0]', '$data[1]', '$data[2]', '$data[3]', '$data[4]', '$data[5]', '$data[6]')";

        $mysql->query($sql);
    }
    public function DeleteEvento($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM eventos WHERE id='$id'";

        $mysql->query($sql);
    }

    public function VaciarEvento($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM listado_evento WHERE id_evento='$id'";

        $mysql->query($sql);
    }

    public function EditarEvento($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE eventos SET nombre='$data[0]', ubicacion='$data[1]', link = '$data[2]', fecha_inicio = '$data[3]', fecha_fin='$data[4]', id_usuario = '$data[5]', imagen='$data[6]' WHERE id='$id'";

        $mysql->query($sql);
    }


    public function AddPubli($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO publicaciones(titulo, descripcion, tipo, id_categoria, id_usuario, megusta, imagen) VALUES ('$data[0]', '$data[1]', '$data[2]', '$data[3]', '$data[4]', '$data[5]', '$data[6]')";

        $mysql->query($sql);
    }

    public function EditPubli($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE publicaciones SET titulo='$data[0]', descripcion='$data[1]', tipo='$data[2]', id_categoria='$data[3]', id_usuario='$data[4]', megusta='$data[5]', imagen='$data[6]' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function EditPubliUser($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE publicaciones SET titulo='$data[0]', descripcion='$data[1]', id_categoria='$data[2]', id_usuario='$data[3]' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function DeletePubli($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM publicaciones WHERE id='$id'";

        $mysql->query($sql);
    }

    public function DarMeGusta($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE publicaciones SET megusta=megusta+1 WHERE id='$id'";

        $mysql->query($sql);
    }

    public function QuitarMeGusta($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE publicaciones SET megusta=megusta-1 WHERE id='$id'";

        $mysql->query($sql);
    }

   

    public function MegustaAddList($id_usuario, $id_publicacion)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO megusta(id_usuario, id_publicacion, megusta) VALUES ('$id_usuario', '$id_publicacion', 0)";

        $mysql->query($sql);
    }

    public function QuitargustaList($id_usuario, $id_publicacion)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE megusta SET megusta = 0 WHERE id_usuario = '$id_usuario' AND id_publicacion = $id_publicacion";

        $mysql->query($sql);
    }

    public function DargustaList($id_usuario, $id_publicacion)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE megusta SET megusta = 1 WHERE id_usuario = '$id_usuario' AND id_publicacion = $id_publicacion";

        $mysql->query($sql);
    }

    public function VaciarMeGustaList($id_publi)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM megusta WHERE id_publicacion = '$id_publi'";

        $mysql->query($sql);
    }


    public function VaciarMeGustaListUsuario($id_user)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM megusta WHERE id_usuario = '$id_user'";

        $mysql->query($sql);
    }


    public function AddAviso($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO avisos(titulo, aviso, fecha_publicacion, id_usuario, hora) VALUES ('$data[0]', '$data[1]', '$data[2]', '$data[3]', '$data[4]')";

        $mysql->query($sql);
    }

    public function EliminarAviso($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM avisos WHERE id = '$id'";

        $mysql->query($sql);
    }

    public function EditAviso($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();
        $sql = "UPDATE avisos SET titulo = '$data[0]', aviso='$data[1]', id_usuario='$data[2]' WHERE id = '$id'";


        $mysql->query($sql);
    }


    public function AddUser($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO usuarios(nombre, apellidos, usuario, correo, contrasena, id_tipo, imagen, biografia) VALUES ('$data[0]', '$data[1]', '$data[2]', '$data[3]', '$data[4]', '$data[5]', '$data[6]', '$data[7]')";

        $mysql->query($sql);
    }

    public function AddCategory($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO categoria(nombre) VALUES ('$data[0]')";

        $mysql->query($sql);
    }

    public function EditCategory($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE categoria SET nombre='$data[0]' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function DeleteCategory($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM categoria WHERE id='$id'";

        $mysql->query($sql);
    }

    public function ChangePass($pass, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE usuarios SET contrasena='$pass' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function EditUser($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE usuarios SET nombre='$data[0]', apellidos = '$data[1]', usuario='$data[2]', correo = '$data[3]', imagen='$data[4]', biografia = '$data[5]' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function EditUserAdmin($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE usuarios SET nombre='$data[0]', apellidos = '$data[1]', usuario='$data[2]', correo = '$data[3]', imagen='$data[4]', biografia = '$data[5]', id_tipo = '$data[6]' WHERE id='$id'";

        $mysql->query($sql);
    }

    public function DeleteUsers($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM usuarios WHERE id='$id'";

        $mysql->query($sql);
    }

    public function EditTypePedido($data, $id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE pedidos SET estado='$data[0]', direccion = '$data[1]'  WHERE id='$id'";

        $mysql->query($sql);
    }

    public function EditaEstadoEvento($estado, $id_user, $id_evento)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE listado_evento SET estado='$estado' WHERE id_usuario='$id_user' AND id_evento = '$id_evento'";

        $mysql->query($sql);
    }


    public function ActivaDesactivaPubli($id, $tipo)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE publicaciones SET tipo='$tipo' WHERE id='$id'";

        $mysql->query($sql);
    }


    public function AddInforme($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO informes(id_usuario, informe, id_usuarioreferenciado, estado) VALUES ('$data[0]', '$data[1]', '$data[2]', '$data[3]')";

        $mysql->query($sql);
    }

    public function EliminarInforme($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM informes WHERE id='$id'";

        $mysql->query($sql);
    }

    public function CambiarEstado($id, $estado)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "UPDATE informes SET estado='$estado' WHERE id='$id'";

        $mysql->query($sql);
    }


    //PRUEBAS
    public function AddFavorito($data)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "INSERT INTO favoritos(id_usuario, id_usuariopin) VALUES ('$data[0]', '$data[1]')";

        $mysql->query($sql);
    }

    public function DeleteFavorito($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM favoritos WHERE id='$id'";

        $mysql->query($sql);
    }

    public function VaciarFavorito($id)
    {
        $sqlConnection = new Connection();
        $mysql = $sqlConnection->getConnection();

        $sql = "DELETE FROM favoritos WHERE id_usuario='$id'";

        $mysql->query($sql);
    }

}
