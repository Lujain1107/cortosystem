<?php

require_once("controllers/checkauthentication.php");
require_once("models/database.php");
require_once("models/cart.php");

$db = Database::getInstance()->getConnection();

$stmt = $db->prepare("
    SELECT *
    FROM menu_items
");

$stmt->execute();

$items = $stmt->fetchAll(PDO::FETCH_ASSOC);


// add to cart
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $user_id = $_SESSION['user_id'];

    $cart = new cart($user_id);

    $cart->addItem(
        $_POST['item_id'],
        1
    );

    echo "✅ Added To Cart <br><br>";
}

?>


<h1>Menu</h1>


<?php

foreach ($items as $item) {

    ?>

    <hr>

    <h3>
        <?php echo $item['name']; ?>
    </h3>

    Price:
    <?php echo $item['price']; ?>
    EGP

    <br><br>

    <form method="POST">

        <input
            type="hidden"
            name="item_id"
            value="<?php echo $item['id']; ?>">

        <button type="submit">

            Add To Cart

        </button>

    </form>

    <?php
}
?>