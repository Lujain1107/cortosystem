<?php

session_start();

require_once("models/database.php");
require_once("models/payment.php");

if (!isset($_SESSION['cart']) || empty($_SESSION['cart'])) {
    die("❌ Cart is empty");
}

$db = Database::getInstance()->getConnection();

$total = 0;

// ✅ حساب التوتال
foreach ($_SESSION['cart'] as $item) {

    $total += $item['price'] * $item['quantity'];
}


// ✅ إنشاء order
$stmt = $db->prepare("
    INSERT INTO orders
    (customer_id, total, payment_status, created_at)
    VALUES
    (:cid, :total, :status, NOW())
");

$stmt->execute([

    ":cid" => $_SESSION['user_id'],
    ":total" => $total,
    ":status" => "pending"
]);

$order_id = $db->lastInsertId();


// ✅ إضافة المنتجات
foreach ($_SESSION['cart'] as $item) {

    $stmt = $db->prepare("
        INSERT INTO order_items
        (order_id, menu_item_id, quantity, price)
        VALUES
        (:oid, :mid, :qty, :price)
    ");

    $stmt->execute([

        ":oid" => $order_id,
        ":mid" => $item['id'],
        ":qty" => $item['quantity'],
        ":price" => $item['price']
    ]);
}


// ✅ fake payment
$payment = new Payment();

$payment->processPayment(
    $order_id,
    "123456789"
);


// ✅ فضي الكارت
unset($_SESSION['cart']);

echo "✅ Checkout Success";
echo "<br>";
echo "Order ID: " . $order_id;

?>