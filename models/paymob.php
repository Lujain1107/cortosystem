<?php

class Paymob {

    private $api_key = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFMU9UUXlOU3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5xemo4Um56bTVUMkdldUFkdVFKVWJYMUY2N3luR0gwVTlIWWlwUlBYTkdnQWZjRFVaM0w5VUw5U1N6Qm0xRTJIT2cxMDhIRUh5amUyVnV2ZnNKRnNTZw==";

    private $integration_id = "5647860";

    private $iframe_id = "1039492";


    private function request($url, $data) {

        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        curl_setopt($ch, CURLOPT_POST, true);

        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        curl_setopt($ch, CURLOPT_HTTPHEADER, [

            "Content-Type: application/json"

        ]);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {

            throw new Exception(curl_error($ch));
        }

        curl_close($ch);

        return json_decode($response, true);
    }


    public function getAuthToken() {

        $res = $this->request(

            "https://accept.paymob.com/api/auth/tokens",

            [

                "api_key" => $this->api_key

            ]
        );

        return $res['token'] ?? null;
    }

    public function createOrder($token, $amount_cents) {

        $res = $this->request(

            "https://accept.paymob.com/api/ecommerce/orders",

            [

                "auth_token" => $token,

                "delivery_needed" => false,

                "amount_cents" => $amount_cents,

                "currency" => "EGP",

                "items" => []

            ]
        );

        return $res['id'] ?? null;
    }


    public function getPaymentKey(

        $token,
        $order_id,
        $amount_cents

    ) {

        $res = $this->request(

            "https://accept.paymob.com/api/acceptance/payment_keys",

            [

                "auth_token" => $token,

                "amount_cents" => $amount_cents,

                "expiration" => 3600,

                "order_id" => $order_id,

                "billing_data" => [

                    "first_name" => "Test",

                    "last_name" => "User",

                    "email" => "test@test.com",

                    "phone_number" => "01000000000",

                    "city" => "Cairo",

                    "country" => "EG",

                    "street" => "NA",

                    "building" => "NA",

                    "floor" => "NA",

                    "apartment" => "NA"

                ],

                "currency" => "EGP",

                "integration_id" => $this->integration_id

            ]
        );

        return $res['token'] ?? null;
    }


    public function getIframeUrl($payment_token) {

        return

        "https://accept.paymob.com/api/acceptance/iframes/" .

        $this->iframe_id .

        "?payment_token=" .

        $payment_token;
    }
}

?>