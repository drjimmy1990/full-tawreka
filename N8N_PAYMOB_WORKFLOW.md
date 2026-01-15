# n8n Workflow: Paymob Payment Webhook

## Purpose
Receive Paymob payment callbacks and update order `payment_status` in Supabase.

---

## Step 1: Create Webhook Trigger

1. In n8n, add **Webhook** node
2. Settings:
   - **HTTP Method**: `POST`
   - **Path**: `paymob-callback`
3. Copy the **Production URL** (e.g., `https://your-n8n.com/webhook/paymob-callback`)

---

## Step 2: Parse Paymob Data

Add **Code** node:

```javascript
// Extract important Paymob data
const paymobData = $input.first().json;

// HMAC verification (optional but recommended)
// const hmac = paymobData.hmac;

// Transaction details
const isSuccess = paymobData.obj?.success === true;
const orderId = paymobData.obj?.order?.merchant_order_id; // Your order ID
const transactionId = paymobData.obj?.id;
const amountCents = paymobData.obj?.amount_cents;
const paymentMethod = paymobData.obj?.source_data?.type; // 'card', etc.

return {
  json: {
    order_id: orderId,
    is_success: isSuccess,
    paymob_transaction_id: transactionId,
    amount_cents: amountCents,
    payment_method: paymentMethod,
    raw: paymobData
  }
};
```

---

## Step 3: Update Supabase Order

Add **Supabase** node:
- **Operation**: Update
- **Table**: `orders`
- **Filters**: 
  - `id` equals `{{ $json.order_id }}`
- **Fields to Update**:
  - `payment_status`: `{{ $json.is_success ? 'paid' : 'failed' }}`

---

## Step 4: Configure in Paymob Dashboard

1. Go to **Developers → Payment Integrations**
2. Edit your integration → **Callbacks** tab
3. Set **Transaction processed callback**: 
   ```
   https://your-n8n.com/webhook/paymob-callback
   ```

---

## Complete Flow Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Customer   │────▶│   Paymob     │────▶│    n8n      │
│  Pays       │     │   Payment    │     │  Webhook    │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 │
                                                 ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Kitchen    │◀────│  Supabase   │
                    │   Panel      │     │  (orders)   │
                    │  (Realtime)  │     │             │
                    └──────────────┘     └─────────────┘
```

---

## Paymob Webhook Payload Example

```json
{
  "type": "TRANSACTION",
  "obj": {
    "id": 398456278,
    "success": true,
    "amount_cents": 12500,
    "order": {
      "id": 452188010,
      "merchant_order_id": "45"  // ← Your order ID
    },
    "source_data": {
      "type": "card",
      "sub_type": "MasterCard"
    }
  }
}
```

---

## Testing

1. Create a test order on website
2. Complete payment with test card
3. Check n8n execution logs
4. Verify `payment_status` changed in Supabase
5. Check kitchen panel shows "Paid" status
