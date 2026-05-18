<?php

class Database {

    private static $instance = null;

    private $host = "localhost";
    private $dbname = "cortosystem";
    private $username = "root";
    private $password = "";

    private $conn;

    private function __construct() {

        try {

            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->dbname};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );

        } catch (PDOException $e) {

            die("Connection failed: " . $e->getMessage());
        }
    }

    private function __clone() {}

    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }

    public static function getInstance() {

        if (self::$instance === null) {

            self::$instance = new Database();
        }

        return self::$instance;
    }

    public function getConnection() {

        return $this->conn;
    }
}
?>