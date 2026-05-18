<?php

require_once("controllers/checkauthentication.php");
require_once("models/database.php");
require_once("models/ordermanager.php");

if ($_SESSION['role'] != "admin") {
    die("Access denied");
}

$db = Database::getInstance()->getConnection();


// update status
if ($_SERVER['REQUEST_METHOD'] == 'POST') {

    $stmt = $db->prepare("
        UPDATE orders
        SET payment_status = :status
        WHERE id = :id
    ");

    $stmt->execute([

        ":status" => $_POST['payment_status'],
        ":id" => $_POST['order_id']

    ]);

    header("Location: adminorders.php");
    exit();
}


// get all orders
$stmt = $db->prepare("
    SELECT
        orders.id,
        orders.total,
        orders.payment_status,
        orders.created_at,
        users.username
    FROM orders
    JOIN users
    ON orders.customer_id = users.id
    ORDER BY orders.created_at DESC
");

$stmt->execute();

$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

?>

<h1>Admin Orders Dashboard</h1>

<?php

if (count($orders) == 0) {

    echo "No orders found";

} else {

    foreach ($orders as $order) {

        echo "<hr>";

        echo "<h3>Order #" . $order['id'] . "</h3>";

        echo "Customer: " . $order['username'] . "<br>";

        echo "Payment Status: " . $order['payment_status'] . "<br>";

        echo "Total: " . $order['total'] . "<br>";

        echo "Date: " . $order['created_at'] . "<br>";

        ?>

        <form method="POST">

            <input
                type="hidden"
                name="order_id"
                value="<?php echo $order['id']; ?>">

           <select name="payment_status">

                <option value="pending"
                    <?php if ($order['payment_status'] == 'pending') echo "selected"; ?>>
                    pending
                </option>

                <option value="paid"
                    <?php if ($order['payment_status'] == 'paid') echo "selected"; ?>>
                    paid
                </option>

                <option value="cancelled"
                    <?php if ($order['payment_status'] == 'cancelled') echo "selected"; ?>>
                    cancelled
                </option>

            </select>

            <button type="submit">
                Update Status
            </button>

        </form>

        <?php
    }
}
?>