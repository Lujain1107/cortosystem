<?php
class Roles {

    const ADMIN = 'admin';
    const STAFF = 'staff';
    const CUSTOMER = 'customer';

    private function __construct() {}

    public static function isAdmin(string $role): bool {
        return $role === self::ADMIN;
    }

    public static function isStaff(string $role): bool {
        return $role === self::STAFF;
    }

    public static function isCustomer(string $role): bool {
        return $role === self::CUSTOMER;
    }
}
?>