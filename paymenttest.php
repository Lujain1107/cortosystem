<?php

require_once("payment.php");

$payment = new Payment();

$payment->processPayment(20, "card", "4242424242424242");

$payment->processPayment(20, "card", "1111");
?>