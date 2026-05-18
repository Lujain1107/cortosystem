<?php

require_once("../models/admin.php");
require_once("../models/database.php");
require_once("../models/roles.php");

session_start();

// CHECK AUTH
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    die("Access denied");
}

$user = $_SESSION['user'];

// CREATE ADMIN OBJECT
$admin = new admin(
    $user['id'],
    $user['name'],
    $user['username'],
    $user['password'],
    $user['email'],
    $user['phone']
);

$action = $_GET['action'] ?? "";

/* ===========================
   ADD STAFF
=========================== */
if ($action == "add_staff") {

    if ($_SERVER['REQUEST_METHOD'] == "POST") {

        $name = $_POST['name'] ?? null;
        $username = $_POST['username'] ?? null;
        $password = $_POST['password'] ?? null;
        $email = $_POST['email'] ?? null;
        $phone = $_POST['phone'] ?? null;

        if ($name && $username && $password && $email && $phone) {

            $admin->addstaff($name, $username, $password, $email, $phone);
            echo "✅ Staff Added Successfully";

        } else {
            echo "❌ Missing Data";
        }

    } else {
        echo "❌ Use POST Method";
    }
}


/* ===========================
   DELETE STAFF
=========================== */
if ($action == "delete_staff") {

    if (isset($_GET['id'])) {
        $admin->deletestaff($_GET['id']);
        echo "✅ Staff Deleted";
    } else {
        echo "❌ Missing ID";
    }
}


/* ===========================
   ADD MENU
=========================== */
if ($action == "add_menu") {

    if ($_SERVER['REQUEST_METHOD'] == "POST") {

        $name = $_POST['name'] ?? null;
        $price = $_POST['price'] ?? null;

        if ($name && $price) {
            $admin->addmenuitem($name, $price);
            echo "✅ Menu Item Added";
        } else {
            echo "❌ Missing Data";
        }

    } else {
        echo "❌ Use POST";
    }
}


/* ===========================
   DELETE MENU
=========================== */
if ($action == "delete_menu") {

    if (isset($_GET['id'])) {
        $admin->deletemenuitem($_GET['id']);
        echo "✅ Menu Item Deleted";
    } else {
        echo "❌ Missing ID";
    }
}


/* ===========================
   REPORT
=========================== */
if ($action == "report") {
    $report = $admin->viewreport();
    echo "<pre>";
    print_r($report);
    echo "</pre>";
}

?>