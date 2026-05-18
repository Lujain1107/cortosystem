<?php

require_once("controllers/checkauthentication.php");
require_once("models/cart.php");

$user_id = $_SESSION['user_id'];

$cart = new cart($user_id);


// remove item
if (isset($_GET['remove'])) {

    $cart->deleteItem($_GET['remove']);

    header("Location: viewcart.php");
    exit();
}


$items = $cart->getItems();

$total = $cart->calcTot();

?>


<h1>My Cart</h1>


<?php

if (count($items) == 0) {

    echo "Cart is Empty";

} else {

    foreach ($items as $item) {

        ?>

        <hr>

        <h3>

            <?php echo $item['name']; ?>

        </h3>

        Quantity:
        <?php echo $item['quantity']; ?>

        <br>

        Price:
        <?php echo $item['price']; ?>

        <br><br>

        <a href="?remove=<?php echo $item['id']; ?>">

            Remove

        </a>

        <?php
    }

    echo "<hr>";

    echo "<h2>Total = " . $total . " EGP</h2>";

    ?>

    <br>

    <a href="checkout.php">

        <button>

            Checkout

        </button>

    </a>

    <?php
}
?>