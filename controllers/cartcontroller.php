<?php

session_start();

require_once("../models/database.php");

$action = $_GET['action'] ?? "";


/* =========================
   ADD TO CART
========================= */
if ($action == "add") {

    $item_id = $_POST['item_id'] ?? null;
    $quantity = $_POST['quantity'] ?? 1;

    if (!$item_id || $quantity <= 0) {
        die("❌ Invalid Data");
    }

    $db = Database::getInstance()->getConnection();

    $stmt = $db->prepare("
        SELECT *
        FROM menu_items
        WHERE id = :id
    ");

    $stmt->execute([
        ":id" => $item_id
    ]);

    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        die("❌ Item Not Found");
    }

    // ✅ لو الكارت مش موجود
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    // ✅ لو الايتم موجود نزود الكمية
    if (isset($_SESSION['cart'][$item_id])) {

        $_SESSION['cart'][$item_id]['quantity'] += $quantity;

    } else {

        $_SESSION['cart'][$item_id] = [

            "id" => $item['id'],
            "name" => $item['name'],
            "price" => $item['price'],
            "quantity" => (int)$quantity
        ];
    }

    echo "✅ Item Added To Cart";
}



/* =========================
   VIEW CART
========================= */
if ($action == "view") {

    echo "<pre>";

    print_r($_SESSION['cart'] ?? []);

    echo "</pre>";
}



/* =========================
   REMOVE ITEM
========================= */
if ($action == "remove") {

    $item_id = $_GET['item_id'] ?? null;

    if (isset($_SESSION['cart'][$item_id])) {

        unset($_SESSION['cart'][$item_id]);

        echo "✅ Item Removed";

    } else {

        echo "❌ Item Not Found";
    }
}



/* =========================
   CLEAR CART
========================= */
if ($action == "clear") {

    unset($_SESSION['cart']);

    echo "🗑 Cart Cleared";
}

?>