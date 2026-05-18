<?php

require_once("../models/database.php");

session_start();

$db = Database::getInstance()->getConnection();

$total = 0;

foreach ($_SESSION['cart'] as $item) {
    $total += $item['price'] * $item['quantity'];
}

// حفظ الأوردر
$stmt = $db->prepare("
    INSERT INTO orders (user_id, total, status)
    VALUES (:uid, :total, 'pending')
");

$stmt->execute([
    ":uid" => $_SESSION['user']['id'],
    ":total" => $total
]);

$order_id = $db->lastInsertId();

// حفظ العناصر
foreach ($_SESSION['cart'] as $item) {
    $stmt = $db->prepare("
        INSERT INTO order_items (order_id, menu_item_id, quantity)
        VALUES (:oid, :mid, :q)
    ");

    $stmt->execute([
        ":oid" => $order_id,
        ":mid" => $item['id'],
        ":q" => $item['quantity']
    ]);
}

// تفريغ الكارت
unset($_SESSION['cart']);

echo "Order Placed Successfully";

?>