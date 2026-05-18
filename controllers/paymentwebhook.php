<?php

require_once("../models/database.php");

$db = Database::getInstance()->getConnection();

// بيانات من Paymob (مثال)
$order_id = $_POST['order_id'];
$status = $_POST['status'];

if ($status == "success") {
    $stmt = $db->prepare("
        UPDATE orders SET status = 'paid'
        WHERE id = :id
    ");

    $stmt->execute([
        ":id" => $order_id
    ]);

    echo "Payment Confirmed";
} else {
    echo "Payment Failed";
}

?>