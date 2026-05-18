<?php

require_once("menuitem.php");

$items = MenuItem::getAll();

foreach ($items as $item) {
    echo $item['name'] . " - " . $item['price'] . "<br>";
}
?>