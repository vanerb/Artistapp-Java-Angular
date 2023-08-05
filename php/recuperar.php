<?php

include('Connection.php');
include('Crud.php');

session_start();


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'];

    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $sqlConnection = new Connection();
        $sqlData = new crud();
        $sql = $sqlConnection->getConnection();
    
        $result = $sqlData->getinfo("SELECT COUNT(*) as total FROM usuarios WHERE correo = '$email'");
        $count = $result->fetch_assoc()["total"];
    
        if ($count > 0) {
            // Generar una nueva contraseña aleatoria
            $new_password = generateRandomPassword();
            $hashed_password = md5($new_password);
    
            // Actualizar la contraseña en la base de datos
            $result = $sqlData->getinfo("SELECT * FROM usuarios WHERE correo = '$email'");
    
            while ($row = $result->fetch_assoc()) {
                $id_usuario = $row["id"];
                $nombre_usuario = $row["usuario"];
            }
    
            $sqlData->ChangePass($hashed_password, $id_usuario);
    
            // Enviar la nueva contraseña al correo electrónico del usuario
            $email_subject = "Nueva contraseña";
            $email_body = "Hola, $nombre_usuario \n\n Parece que no puedes iniciar sesión no te preocupes ahora te facilitamos una nueva contraseña.\n\nTu nueva contraseña es: $new_password ";
    
            // Configuración de correo electrónico
            $from = "contacto@example.test"; // Cambiar por tu dirección de correo electrónico
            $headers = "From: $from";
            
            // Envío de correo electrónico
            if (mail($email, $email_subject, $email_body, $headers)) {
                echo "Se ha enviado una nueva contraseña a tu correo electrónico.";
            } else {
                echo "Hubo un error al enviar el correo electrónico.";
            }
        } else {
            echo "El correo electrónico ingresado no existe en nuestra base de datos.";
        }
    }
    else{
        echo "error1";
    }
    
}

function generateRandomPassword($length = 8) {
    $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $password = '';
    for ($i = 0; $i < $length; $i++) {
        $password .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $password;
}
