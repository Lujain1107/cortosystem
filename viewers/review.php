<?php
require_once("database.php");

class Review {

    private $db;

    public function __construct() {
        $this->db = (new Database())->connect();
    }

    function addReview($customer_id, $menu_item_id, $rating, $comment) {

        $stmt = $this->db->prepare("
            INSERT INTO reviews (customer_id, menu_item_id, rating, comment)
            VALUES (:cid, :mid, :rating, :comment)
        ");

        $stmt->execute([
            ":cid" => $customer_id,
            ":mid" => $menu_item_id,
            ":rating" => $rating,
            ":comment" => $comment
        ]);
    }

    function getReviews($menu_item_id) {

        $stmt = $this->db->prepare("
            SELECT u.username, r.rating, r.comment
            FROM reviews r
            JOIN users u ON r.customer_id = u.id
            WHERE r.menu_item_id = :id
        ");

        $stmt->execute([":id" => $menu_item_id]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>