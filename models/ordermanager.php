<?php

require_once("database.php");

class OrderManager {

    function getOrdersByCustomer($customer_id) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT *
            FROM orders
            WHERE customer_id = :cid
            ORDER BY created_at DESC
        ");

        $stmt->execute([
            ":cid" => $customer_id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    function getOrderItems($order_id) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT
                m.name,
                oi.quantity,
                oi.price
            FROM order_items oi
            JOIN menu_items m
            ON oi.menu_item_id = m.id
            WHERE oi.order_id = :oid
        ");

        $stmt->execute([
            ":oid" => $order_id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>