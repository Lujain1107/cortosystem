<?php

require_once("../controllers/checkauthentication.php");
require_once("../models/database.php");

$db = Database::getInstance()->getConnection();

$user_id = $_SESSION['user_id'];

$stmt = $db->prepare("
    SELECT p.*
    FROM payments p
    JOIN orders o ON p.order_id = o.id
    WHERE o.customer_id = :id
    ORDER BY p.id DESC
");

$stmt->execute([
    ":id" => $user_id
]);

$payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($payments)) {

    echo "No payments found";
    exit;
}

foreach ($payments as $p) {

    echo "<h3>Payment #" . $p['id'] . "</h3>";
    echo "Order ID: " . $p['order_id'] . "<br>";
    echo "Amount: " . $p['amount'] . "<br>";
    echo "Method: " . $p['method'] . "<br>";
    echo "Status: " . $p['status'] . "<br>";
    echo "Date: " . ($p['created_at'] ?? 'N/A') . "<br>";
    echo "<hr>";
}
?>