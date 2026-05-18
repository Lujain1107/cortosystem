<?php
require_once("database.php");

class wishlist {

    private int $id;

    public function __construct($customer_id) {

$db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT id FROM wishlists WHERE customer_id = :cid LIMIT 1
        ");

        $stmt->execute([":cid" => $customer_id]);
        $wishlist = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($wishlist) {
            $this->id = $wishlist['id'];
        } else {
            $stmt = $db->prepare("
                INSERT INTO wishlists (customer_id) VALUES (:cid)
            ");
            $stmt->execute([":cid" => $customer_id]);

            $this->id = $db->lastInsertId();
        }
    }

    public function addItem($menu_item_id) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT id FROM wishlist_items
            WHERE wishlist_id = :wid AND menu_item_id = :mid
        ");

        $stmt->execute([
            ":wid" => $this->id,
            ":mid" => $menu_item_id
        ]);

        if (!$stmt->fetch()) {

            $stmt = $db->prepare("
                INSERT INTO wishlist_items (wishlist_id, menu_item_id)
                VALUES (:wid, :mid)
            ");

            $stmt->execute([
                ":wid" => $this->id,
                ":mid" => $menu_item_id
            ]);
        }
    }

    public function deleteItem($menu_item_id) {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            DELETE FROM wishlist_items
            WHERE wishlist_id = :wid AND menu_item_id = :mid
        ");

        $stmt->execute([
            ":wid" => $this->id,
            ":mid" => $menu_item_id
        ]);
    }

    public function getItems() {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            SELECT m.id, m.name, m.price
            FROM wishlist_items w
            JOIN menu_items m ON w.menu_item_id = m.id
            WHERE w.wishlist_id = :wid
        ");

        $stmt->execute([
            ":wid" => $this->id
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function clear() {

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("
            DELETE FROM wishlist_items WHERE wishlist_id = :wid
        ");

        $stmt->execute([
            ":wid" => $this->id
        ]);
    }

    public function getId() {
        return $this->id;
    }
}
?>