<?php
require_once("user.php");
require_once("cart.php");
require_once("wishlist.php");
require_once("order.php");

class customer extends user {

    protected $loyaltypoints;
    protected $address;
    protected cart $cart;
    protected wishlist $wishlist;
    protected array $orders = [];

    public function __construct($id, $name, $loyaltypoints, $username, $password, $email, $phone, $address) {

        parent::__construct($id, $name, $username, $password, $email, $phone);

        $this->loyaltypoints = $loyaltypoints;
        $this->address = $address;

        $this->cart = new cart($this->id);
        //$this->wishlist = new wishlist($this->id);  
  }

    function addtocart($menu_item_id, $quantity) {
        $this->cart->addItem($menu_item_id, $quantity);
    }

    function placeorder() {
        $order = new Order($this, $this->cart);
        $this->orders[] = $order;
    }

    function addtowishlist($menu_item_id) {
        //$this->wishlist->additem($menu_item_id);
    }
    
    function removefromwishlist($menu_item_id) {
       // $this->wishlist->deleteitem($menu_item_id);
    }
}
?>