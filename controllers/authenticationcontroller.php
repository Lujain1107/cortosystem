<?php

require_once("../models/database.php");

session_start();

$db = Database::getInstance()->getConnection();


// ================= LOGOUT =================
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: ../viewers/login.php");
    exit();
}


// ================= LOGIN =================

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$stmt = $db->prepare("SELECT * FROM users WHERE username = :username");
$stmt->execute([":username" => $username]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user['password'])) {

    $_SESSION['user'] = $user;

    header("Location: ../viewers/dashboard.php");

} else {
    echo "Invalid login";
}

?>