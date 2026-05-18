<?php

require_once("database.php");
require_once("cart.php");

class Order {

    private int $id;
    private string $paymentStatus;
    private float $totprice;
    private customer $customer;
    private string $createdAt;
    private array $items = [];

    const PAYMENT_STATUS_PENDING = "pending";
    const PAYMENT_STATUS_PAID = "paid";
    const PAYMENT_STATUS_CANCELLED = "cancelled";

    function __construct(customer $customer, cart $cart) {

        $db = Database::getInstance()->getConnection();

        try {

            $db->beginTransaction();

            $customer_id = $customer->getId();

            $totprice = $cart->calcTot();

            if ($totprice <= 0) {

                throw new Exception("Empty cart");
            }

            // create order
            $stmt = $db->prepare("
                INSERT INTO orders
                (customer_id, total, payment_status, created_at)
                VALUES
                (:cid, :total, :payment_status, NOW())
            ");

            $stmt->execute([

                ":cid" => $customer_id,
                ":total" => $totprice,
                ":payment_status" => self::PAYMENT_STATUS_PENDING

            ]);

            $this->id = $db->lastInsertId();

            // get created_at
            $stmt = $db->prepare("
                SELECT created_at
                FROM orders
                WHERE id = :id
            ");

            $stmt->execute([

                ":id" => $this->id

            ]);

            $orderData = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->createdAt = $orderData['created_at'];

            $this->paymentStatus = self::PAYMENT_STATUS_PENDING;

            $this->totprice = $totprice;

            $this->customer = $customer;

            // get cart items
            $items = $cart->getItems();

            $this->items = $items;

            // insert order items
            foreach ($items as $item) {

                $stmt = $db->prepare("
                    INSERT INTO order_items
                    (order_id, menu_item_id, quantity, price)
                    VALUES
                    (:oid, :mid, :qty, :price)
                ");

                $stmt->execute([

                    ":oid" => $this->id,
                    ":mid" => $item['id'],
                    ":qty" => $item['quantity'],
                    ":price" => $item['price']

                ]);
            }

            // clear cart
            $cart->clearCart();

            $db->commit();

        }

        catch (Exception $e) {

            $db->rollBack();

            throw $e;
        }
    }

    function getId() {

        return $this->id;
    }

    function getPaymentStatus() {

        return $this->paymentStatus;
    }

    function getTotPrice() {

        return $this->totprice;
    }

    function getCustomer() {

        return $this->customer;
    }

    function getCreatedAt() {

        return $this->createdAt;
    }

    function getItems() {

        return $this->items;
    }
}

?>