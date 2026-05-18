<?php
require_once("models/database.php");

$db = Database::getInstance()->getConnection();

if ($db) {
    echo "✅ Database Connected";
}