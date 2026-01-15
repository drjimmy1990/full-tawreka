import { Request, Response } from 'express';
import axios from 'axios';

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY || '';
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID || '';
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID || '';

/**
 * Initiate a payment with Paymob
 * This creates an order in Paymob and returns the iframe URL
 */
export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const {
            amount_cents,      // Amount in piasters (EGP * 100)
            order_id,          // Our internal order ID
            customer_name,
            customer_email,
            customer_phone,
            billing_data
        } = req.body;

        // Validate required fields
        if (!amount_cents || !order_id) {
            return res.status(400).json({
                error: 'Missing required fields: amount_cents and order_id are required'
            });
        }

        // Step 1: Get Authentication Token
        console.log('Paymob: Getting auth token...');
        const authResponse = await axios.post('https://accept.paymob.com/api/auth/tokens', {
            api_key: PAYMOB_API_KEY
        });
        const authToken = authResponse.data.token;
        console.log('Paymob: Auth token received');

        // Step 2: Create Order in Paymob
        console.log('Paymob: Creating order...');
        const orderResponse = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
            auth_token: authToken,
            delivery_needed: false,
            amount_cents: amount_cents,
            currency: 'EGP',
            merchant_order_id: String(order_id),
            items: []
        });
        const paymobOrderId = orderResponse.data.id;
        console.log('Paymob: Order created with ID:', paymobOrderId);

        // Step 3: Get Payment Key
        console.log('Paymob: Getting payment key...');
        const paymentKeyResponse = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
            auth_token: authToken,
            amount_cents: amount_cents,
            expiration: 3600, // 1 hour
            order_id: paymobOrderId,
            billing_data: billing_data || {
                first_name: customer_name?.split(' ')[0] || 'Customer',
                last_name: customer_name?.split(' ').slice(1).join(' ') || 'Name',
                email: customer_email || 'customer@tawriqa.com',
                phone_number: customer_phone || '+201000000000',
                apartment: 'NA',
                floor: 'NA',
                street: 'NA',
                building: 'NA',
                shipping_method: 'NA',
                postal_code: 'NA',
                city: 'Cairo',
                country: 'EG',
                state: 'Cairo'
            },
            currency: 'EGP',
            integration_id: parseInt(PAYMOB_INTEGRATION_ID),
            lock_order_when_paid: true
        });
        const paymentToken = paymentKeyResponse.data.token;
        console.log('Paymob: Payment key received');

        // Build iframe URL
        const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`;

        res.json({
            success: true,
            iframe_url: iframeUrl,
            payment_token: paymentToken,
            paymob_order_id: paymobOrderId,
            merchant_order_id: order_id
        });

    } catch (error: any) {
        console.error('Paymob Payment Error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Payment initiation failed',
            details: error.response?.data || error.message
        });
    }
};

/**
 * Get payment configuration (iframe ID for frontend)
 */
export const getPaymentConfig = async (req: Request, res: Response) => {
    res.json({
        iframe_id: PAYMOB_IFRAME_ID,
        integration_id: PAYMOB_INTEGRATION_ID
    });
};
