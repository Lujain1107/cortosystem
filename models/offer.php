<?php
require_once("database.php");

class Offer {

    private $db;

    public function __construct() {
        $this->db = (new Database())->connect();
    }

    function create($title, $discount) {

        $stmt = $this->db->prepare("
            INSERT INTO offers (title, discount)
            VALUES (:title, :discount)
        ");

        $stmt->execute([
            ":title" => $title,
            ":discount" => $discount
        ]);
    }

    function getAll() {
        return $this->db->query("SELECT * FROM offers")->fetchAll();
    }
}
?>