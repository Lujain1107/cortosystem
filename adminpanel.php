<?php

require_once("controllers/checkauthentication.php");

require_once("models/database.php");
require_once("models/admin.php");

if ($_SESSION['role'] != "admin") {

    die("Access Denied");
}


$db = Database::getInstance()->getConnection();

$stmt = $db->prepare("
    SELECT *
    FROM users
    WHERE id = :id
");

$stmt->execute([

    ":id" => $_SESSION['user_id']
]);

$data = $stmt->fetch(PDO::FETCH_ASSOC);


$admin = new admin(

    $data['id'],
    $data['name'],
    $data['username'],
    $data['password'],
    $data['email'],
    $data['phone']
);


// =======================
// ADD STAFF
// =======================

if (isset($_POST['add_staff'])) {

    $admin->addstaff(

        $_POST['name'],
        $_POST['username'],
        $_POST['password'],
        $_POST['email'],
        $_POST['phone']
    );

    echo "✅ Staff Added <br><br>";
}


// =======================
// DELETE STAFF
// =======================

if (isset($_GET['delete_staff'])) {

    $admin->deletestaff($_GET['delete_staff']);

    header("Location: adminpanel.php");
    exit();
}


// =======================
// ADD MENU ITEM
// =======================

if (isset($_POST['add_item'])) {

    $admin->addmenuitem(

        $_POST['item_name'],
        $_POST['item_price']
    );

    echo "✅ Menu Item Added <br><br>";
}


// =======================
// DELETE MENU ITEM
// =======================

if (isset($_GET['delete_item'])) {

    $admin->deletemenuitem($_GET['delete_item']);

    header("Location: adminpanel.php");
    exit();
}


$staff = $admin->viewstaff();

$items = $admin->viewmenuitems();

$report = $admin->viewreport();

?>


<h1>Admin Panel</h1>

<hr>


<h2>Add Staff</h2>

<form method="POST">

    <input type="text" name="name" placeholder="Name">

    <br><br>

    <input type="text" name="username" placeholder="Username">

    <br><br>

    <input type="password" name="password" placeholder="Password">

    <br><br>

    <input type="email" name="email" placeholder="Email">

    <br><br>

    <input type="text" name="phone" placeholder="Phone">

    <br><br>

    <button type="submit" name="add_staff">

        Add Staff

    </button>

</form>


<hr>


<h2>Staff List</h2>

<?php

foreach ($staff as $s) {

    echo $s['name'] . " - " . $s['email'];

    ?>

    <a href="?delete_staff=<?php echo $s['id']; ?>">

        Delete

    </a>

    <br><br>

    <?php
}
?>


<hr>


<h2>Add Menu Item</h2>

<form method="POST">

    <input type="text"
           name="item_name"
           placeholder="Item Name">

    <br><br>

    <input type="number"
           step="0.01"
           name="item_price"
           placeholder="Price">

    <br><br>

    <button type="submit"
            name="add_item">

        Add Item

    </button>

</form>


<hr>


<h2>Menu Items</h2>

<?php

foreach ($items as $item) {

    echo $item['name'];

    echo " - ";

    echo $item['price'];

    ?>

    <a href="?delete_item=<?php echo $item['id']; ?>">

        Delete

    </a>

    <br><br>

    <?php
}
?>


<hr>


<h2>Reports</h2>

Total Orders:
<?php echo $report['total_orders']; ?>

<br><br>

Revenue:
<?php echo $report['revenue']; ?>