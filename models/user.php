<?php
abstract class user {

    protected int $id;
    protected string $username;
    protected string $password;
    protected string $name;
    protected string $email;
    protected string $phone;

    public function __construct(int $id, string $name, string $username, string $password, string $email, string $phone) {
        $this->id = $id;
        $this->name = $name;
        $this->username = $username;
        $this->password = $password;
        $this->email = $email;
        $this->phone = $phone;
    }

    public function getId() {
        return $this->id;
    }

    public function getUsername() {
        return $this->username;
    }

    public function getName() {
        return $this->name;
    }

    public function getEmail() {
        return $this->email;
    }

    public function getPhone() {
        return $this->phone;
    }   


}
?>