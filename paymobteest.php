<?php

require_once("models/paymob.php");

$paymob = new paymob();

$token = $paymob->getAuthToken();

echo $token;

?>