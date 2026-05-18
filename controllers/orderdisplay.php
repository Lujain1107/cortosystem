<?php

require_once("../models/database.php");

session_start();

$db = Database::getInstance()->getConnection();

$stmt = $db->prepare("SELECT * FROM orders WHERE user_id = :uid");
$stmt->execute([
    ":uid" => $_SESSION['user']['id']
]);

$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

print_r($orders);

?>