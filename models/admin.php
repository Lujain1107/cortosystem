<?php

require_once("user.php");
require_once("database.php");
require_once("roles.php");

class admin extends user {

    private $db;

    public function __construct(
        $id,
        $name,
        $username,
        $password,
        $email,
        $phone
    ) {

        parent::__construct(
            $id,
            $name,
            $username,
            $password,
            $email,
            $phone
        );

        $this->db = Database::getInstance()->getConnection();
    }


    // =========================
    // STAFF CRUD
    // =========================

    // CREATE
    public function addstaff(
        string $name,
        string $username,
        string $password,
        string $email,
        string $phone
    ) {

        if (empty($username) || empty($password)) {

            throw new Exception("Required fields missing");
        }

        $stmt = $this->db->prepare("
            INSERT INTO users
            (name, username, password, email, phone, role)

            VALUES
            (:name, :username, :password, :email, :phone, :role)
        ");

        $stmt->execute([

            ":name" => $name,
            ":username" => $username,
            ":password" => password_hash($password, PASSWORD_DEFAULT),
            ":email" => $email,
            ":phone" => $phone,
            ":role" => roles::STAFF
        ]);

        return $this->db->lastInsertId();
    }


    // READ
    public function viewstaff() {

        $stmt = $this->db->prepare("
            SELECT *
            FROM users
            WHERE role = 'staff'
        ");

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // UPDATE
    public function updatestaff(
        int $id,
        string $name,
        string $email,
        string $phone
    ) {

        $stmt = $this->db->prepare("
            UPDATE users

            SET
                name = :name,
                email = :email,
                phone = :phone

            WHERE id = :id
            AND role = 'staff'
        ");

        $stmt->execute([

            ":name" => $name,
            ":email" => $email,
            ":phone" => $phone,
            ":id" => $id
        ]);

        return $stmt->rowCount();
    }


    // DELETE
    public function deletestaff(int $id) {

        if ($id <= 0) {

            throw new Exception("Invalid ID");
        }

        $stmt = $this->db->prepare("
            DELETE FROM users
            WHERE id = :id
            AND role = 'staff'
        ");

        $stmt->execute([

            ":id" => $id
        ]);

        return $stmt->rowCount();
    }



    // =========================
    // MENU ITEMS CRUD
    // =========================

    // CREATE
    public function addmenuitem(
        string $name,
        float $price
    ) {

        if (empty($name) || $price < 0) {

            throw new Exception("Required fields missing");
        }

        $stmt = $this->db->prepare("
            INSERT INTO menu_items
            (name, price)

            VALUES
            (:name, :price)
        ");

        $stmt->execute([

            ":name" => $name,
            ":price" => $price
        ]);

        return $this->db->lastInsertId();
    }


    // READ
    public function viewmenuitems() {

        $stmt = $this->db->prepare("
            SELECT *
            FROM menu_items
        ");

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // UPDATE
    public function updatemenuitem(
        int $id,
        string $name,
        float $price
    ) {

        $stmt = $this->db->prepare("
            UPDATE menu_items

            SET
                name = :name,
                price = :price

            WHERE id = :id
        ");

        $stmt->execute([

            ":name" => $name,
            ":price" => $price,
            ":id" => $id
        ]);

        return $stmt->rowCount();
    }


    // DELETE
    public function deletemenuitem(int $id) {

        if ($id <= 0) {

            throw new Exception("Invalid ID");
        }

        $stmt = $this->db->prepare("
            DELETE FROM menu_items
            WHERE id = :id
        ");

        $stmt->execute([

            ":id" => $id
        ]);

        return $stmt->rowCount();
    }



    // =========================
    // REPORTS
    // =========================

    public function viewreport() {

        $stmt = $this->db->query("
            SELECT
                COUNT(*) as total_orders,
                SUM(total) as revenue
            FROM orders
        ");

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>