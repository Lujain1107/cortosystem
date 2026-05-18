<?php

require_once("database.php");

$db = (new Database())->connect();

$paymob_order_id = $_GET['order'] 
                ?? $_GET['id'] 
                ?? $_GET['merchant_order_id'] 
                ?? null;

if (!$paymob_order_id) {
    echo "No order id received";
    exit;
}

$stmt = $db->prepare("
    UPDATE orders 
    SET payment_status = 'paid',
        status = 'completed'
    WHERE paymob_order_id = :pid
");

$stmt->execute([":pid" => $paymob_order_id]);

echo "Payment successful";