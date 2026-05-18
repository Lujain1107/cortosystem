<?php
require_once("database.php");
require_once("checkauthentication.php");
require_once("roles.php");

if (!Roles::isAdmin($_SESSION['role'])) {
    die("Access denied");
}
class Report {

    private $db;

    public function __construct() {
        $this->db = (new Database())->connect();
    }

    function getSales() {

        $stmt = $this->db->query("
            SELECT COUNT(*) as orders, SUM(total) as revenue
            FROM orders
        ");

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>