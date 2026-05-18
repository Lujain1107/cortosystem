<?php

require_once("database.php");

class cart {

    private int $id;

    function __construct($customer_id) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT id FROM carts
            WHERE customer_id = :cid
            LIMIT 1
        ");

        $stmt->execute([
            ":cid" => $customer_id
        ]);

        $cart = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cart) {

            $this->id = $cart['id'];

        } else {

            $stmt = $db->prepare("
                INSERT INTO carts (customer_id)
                VALUES (:cid)
            ");

            $stmt->execute([
                ":cid" => $customer_id
            ]);

            $this->id = $db->lastInsertId();
        }
    }

    function addItem($menu_item_id, $quantity) {

        $db = Database::getInstance()->getConnection();

        if ($quantity <= 0) {
            throw new Exception("Invalid quantity");
        }

        $stmtMenu = $db->prepare("
            SELECT name, price
            FROM menu_items
            WHERE id = :id
        ");

        $stmtMenu->execute([
            ":id" => $menu_item_id
        ]);

        $menuItem = $stmtMenu->fetch(PDO::FETCH_ASSOC);

        if (!$menuItem) {
            throw new Exception("Menu item not found");
        }

        $itemName = $menuItem['name'];

        $stmt = $db->prepare("
            SELECT quantity
            FROM cart_items
            WHERE cart_id = :cart_id
            AND menu_item_id = :item_id
        ");

        $stmt->execute([
            ":cart_id" => $this->id,
            ":item_id" => $menu_item_id
        ]);

        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {

            $newQty = $existing['quantity'] + $quantity;

            $stmt = $db->prepare("
                UPDATE cart_items
                SET quantity = :qty
                WHERE cart_id = :cart_id
                AND menu_item_id = :item_id
            ");

            $stmt->execute([
                ":qty" => $newQty,
                ":cart_id" => $this->id,
                ":item_id" => $menu_item_id
            ]);

        } else {

            $stmt = $db->prepare("
                INSERT INTO cart_items
                (cart_id, menu_item_id, name, quantity)
                VALUES
                (:cart_id, :item_id, :name, :qty)
            ");

            $stmt->execute([
                ":cart_id" => $this->id,
                ":item_id" => $menu_item_id,
                ":name" => $itemName,
                ":qty" => $quantity
            ]);
        }
    }

    // get all items
    function getItems() {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT
                m.id,
                c.name,
                m.price,
                c.quantity
            FROM cart_items c
            JOIN menu_items m
            ON c.menu_item_id = m.id
            WHERE c.cart_id = :cart_id
        ");

        $stmt->execute([
            ":cart_id" => $this->id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // total
    function calcTot() {

        $items = $this->getItems();

        $total = 0;

        foreach ($items as $item) {

            $total += $item['price'] * $item['quantity'];
        }

        return $total;
    }

    // clear cart
    function clearCart() {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            DELETE FROM cart_items
            WHERE cart_id = :id
        ");

        $stmt->execute([
            ":id" => $this->id
        ]);
    }

    // delete one item
    function deleteItem($menu_item_id) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            DELETE FROM cart_items
            WHERE cart_id = :cart_id
            AND menu_item_id = :item_id
        ");

        $stmt->execute([
            ":cart_id" => $this->id,
            ":item_id" => $menu_item_id
        ]);
    }

    function getId() {

        return $this->id;
    }
}
?>