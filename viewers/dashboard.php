<?php

require_once("../controllers/checkauthentication.php");
require_once("../models/database.php");

$user = $_SESSION['user'];

$db = Database::getInstance()->getConnection();


// ================= STATISTICS =================

$stmt = $db->query("
    SELECT SUM(amount) as total
    FROM payments
    WHERE status = 'paid'
");
$total = $stmt->fetch()['total'] ?? 0;

$stmt = $db->query("
    SELECT COUNT(*) as count
    FROM orders
");
$orders = $stmt->fetch()['count'];

$stmt = $db->query("
    SELECT COUNT(*) as count
    FROM payments
    WHERE status = 'paid'
");
$success = $stmt->fetch()['count'];

$stmt = $db->query("
    SELECT COUNT(*) as count
    FROM payments
    WHERE status = 'failed'
");
$failed = $stmt->fetch()['count'];

?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>

<body>

<h2>Welcome <?php echo $user['name']; ?> 👋</h2>
<p>Role: <?php echo $user['role']; ?></p>

<hr>

<h1>📊 Dashboard</h1>

<p>Total Revenue: <?php echo $total; ?> EGP</p>
<p>Total Orders: <?php echo $orders; ?></p>
<p>Successful Payments: <?php echo $success; ?></p>
<p>Failed Payments: <?php echo $failed; ?></p>

<hr>

<!-- 🛒 CART -->

<h3>Cart Test</h3>

<form method="POST" action="../controllers/cartcontroller.php?action=add">
    <input type="hidden" name="id" value="1">
    <input type="hidden" name="name" value="Pizza">
    <input type="hidden" name="price" value="100">
    <input type="number" name="quantity" value="1">
    <button type="submit">Add</button>
</form>

<br>

<form method="GET" action="../controllers/cartcontroller.php">
    <input type="hidden" name="action" value="view">
    <button type="submit">View Cart</button>
</form>

<br>

<form method="GET" action="../controllers/cartcontroller.php">
    <input type="hidden" name="action" value="remove">
    <input type="hidden" name="index" value="0">
    <button type="submit">Remove First Item</button>
</form>

<hr>

<!-- 🔐 LOGOUT -->

<a href="../controllers/authenticationcontroller.php?logout=true">
    Logout
</a>

</body>
</html>