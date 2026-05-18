<?php

require_once("models/database.php");

$db = Database::getInstance()->getConnection();

$success = $_GET['success'] ?? "false";

$paymob_order_id =
$_GET['order'] ??
$_GET['id'] ??
null;

if (!$paymob_order_id) {

    die("No order id");
}


$status = ($success == "true")
    ? "paid"
    : "failed";


$stmt = $db->prepare("

    UPDATE orders
    SET payment_status = :status
    WHERE paymob_order_id = :pid

");

$stmt->execute([

    ":status" => $status,
    ":pid" => $paymob_order_id

]);


echo "Payment Updated Successfully";

?>