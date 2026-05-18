<?php

require_once("controllers/checkauthentication.php");

require_once("models/database.php");
require_once("models/customer.php");
require_once("models/cart.php");
require_once("models/order.php");
require_once("models/payment.php");

$user_id = $_SESSION['user_id'];

$db = Database::getInstance()->getConnection();

$stmt = $db->prepare("
    SELECT * FROM users
    WHERE id = :id
");

$stmt->execute([
    ":id" => $user_id
]);

$data = $stmt->fetch(PDO::FETCH_ASSOC);

$customer = new customer(
    $data['id'],
    $data['name'],
    0,
    $data['username'],
    $data['password'],
    $data['email'],
    $data['phone'],
    "no address"
);

$cart = new cart($user_id);

$order = new Order($customer, $cart);

$order_id = $order->getId();

echo "✅ Order Created <br>";

$payment = new Payment();

$payment->processPayment(
    $order_id,
    "1234567890123456"
);

echo "✅ Payment Processed";
?>