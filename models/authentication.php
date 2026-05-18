<?php
require_once 'database.php';
require_once 'roles.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class authentication {

    public function register($username, $password, $name, $email, $phone) {

        $db = Database::getInstance()->getConnection();

        if (empty($username) || empty($password)) {
            return false;
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $db->prepare("
            INSERT INTO users 
            (username, password, name, email, phone, role)
            VALUES 
            (:username, :password, :name, :email, :phone, :role)
        ");

        return $stmt->execute([
            ":username" => $username,
            ":password" => $hashedPassword,
            ":name" => $name,
            ":email" => $email,
            ":phone" => $phone,
            ":role" => Roles::CUSTOMER
        ]);
    }

    public function login($username, $password) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT id, username, password, role 
            FROM users 
            WHERE username = :username 
            LIMIT 1
        ");

        $stmt->execute([
            ":username" => $username
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {

            session_regenerate_id(true);

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];

            return true;

        } else {
            return false;
        }
    }

   public function logout() {

    $_SESSION = [];

    session_unset();

    session_destroy();
}
}
?>