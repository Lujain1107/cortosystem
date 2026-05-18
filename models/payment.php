<?php

require_once("database.php");

class Payment {

    public function processPayment($order_id, $cardNumber) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("

            UPDATE orders
            SET payment_status = 'paid'
            WHERE id = :id

        ");

        $stmt->execute([

            ":id" => $order_id

        ]);

        return true;
    }
}
?>