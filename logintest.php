<?php
require_once("authentication.php");

$auth = new authentication();

$auth->login("testuser", "123456");
?>