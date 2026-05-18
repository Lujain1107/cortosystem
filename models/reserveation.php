<?php
require_once("database.php");

class Reservation {

    private $db;

    public function __construct() {
        $this->db = (new Database())->connect();
    }

    function create($customer_id, $date) {

        $stmt = $this->db->prepare("
            INSERT INTO reservations (customer_id, date)
            VALUES (:cid, :date)
        ");

        $stmt->execute([
            ":cid" => $customer_id,
            ":date" => $date
        ]);
    }

    function getAll() {
        return $this->db->query("SELECT * FROM reservations")->fetchAll();
    }
}
?>