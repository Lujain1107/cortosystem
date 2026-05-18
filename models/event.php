<?php
require_once("database.php");

class Event {

    private $db;

    public function __construct() {
        $this->db = (new Database())->connect();
    }

    function create($name, $date) {

        $stmt = $this->db->prepare("
            INSERT INTO events (name, date)
            VALUES (:name, :date)
        ");

        $stmt->execute([
            ":name" => $name,
            ":date" => $date
        ]);
    }

    function getAll() {
        return $this->db->query("SELECT * FROM events")->fetchAll();
    }
}
?>