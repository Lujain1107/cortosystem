<?php

require_once("user.php");
require_once("database.php");
require_once("roles.php");

class staff extends user {

    private $db;
    private $role;

    public function __construct(
        $id,
        $name,
        $username,
        $password,
        $email,
        $phone,
        $role
    ) {

        parent::__construct(
            $id,
            $name,
            $username,
            $password,
            $email,
            $phone
        );

        if ($role !== Roles::STAFF) {
            throw new Exception("Invalid role");
        }

        $this->role = $role;
        $this->db = Database::getInstance()->getConnection();
    }

    // ================== ORDERS ==================

    // READ (كل الأوردرات)
    public function getAllOrders() {
        $stmt = $this->db->prepare("
            SELECT * FROM orders ORDER BY created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // READ تفاصيل الأوردر
    public function getOrderItems($order_id) {
        $stmt = $this->db->prepare("
            SELECT m.name, m.price, oi.quantity
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE oi.order_id = :oid
        ");
        $stmt->execute([":oid" => $order_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // UPDATE حالة الأوردر
    public function updateOrderStatus($order_id, $status) {
        $stmt = $this->db->prepare("
            UPDATE orders SET status = :status WHERE id = :id
        ");
        $stmt->execute([
            ":status" => $status,
            ":id" => $order_id
        ]);
        return $stmt->rowCount();
    }

    // DELETE أوردر
    public function deleteOrder($order_id) {
        $stmt = $this->db->prepare("DELETE FROM order_items WHERE order_id = :id");
        $stmt->execute([":id" => $order_id]);

        $stmt = $this->db->prepare("DELETE FROM orders WHERE id = :id");
        $stmt->execute([":id" => $order_id]);

        return true;
    }

    // ================== CUSTOMERS ==================

    // READ العملاء
    public function getAllCustomers() {
        $stmt = $this->db->prepare("
            SELECT id, username, name, email, phone
            FROM users
            WHERE role = 'customer'
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // DELETE عميل
    public function deleteCustomer($customer_id) {
        $stmt = $this->db->prepare("
            DELETE FROM users WHERE id = :id AND role = 'customer'
        ");
        $stmt->execute([
            ":id" => $customer_id
        ]);
        return $stmt->rowCount();
    }

    // ================== MENU ==================

    // UPDATE منتج
    public function updateMenuItem($id, $name, $price) {
        $stmt = $this->db->prepare("
            UPDATE menu_items
            SET name = :name, price = :price
            WHERE id = :id
        ");
        $stmt->execute([
            ":name" => $name,
            ":price" => $price,
            ":id" => $id
        ]);
        return $stmt->rowCount();
    }

    // READ كل المنيو
    public function getAllMenuItems() {
        $stmt = $this->db->prepare("
            SELECT * FROM menu_items
        ");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>