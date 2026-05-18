<?php
require_once("database.php");

class menuitem {
    private int $id;
    private string $name;
    private string $description;
    private float $price;

    public static function getAll() {
$db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT * FROM menu_items");
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>