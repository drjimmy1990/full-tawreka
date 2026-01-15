# 🏦 Paymob Integration Setup Guide

## 📋 Complete Checklist

- [ ] Step 1: Get API Key
- [ ] Step 2: Create Integration
- [ ] Step 3: Create Iframe
- [ ] Step 4: Configure Callbacks
- [ ] Step 5: Add HMAC Secret
- [ ] Step 6: Update Backend .env
- [ ] Step 7: Test Payment

---

## Step 1: Get API Key

1. Login to [Paymob Dashboard](https://accept.paymob.com/portal2/en/login)
2. Go to **Settings → Account Info → API Key**
3. Copy the API Key

```
Your API Key: ___________________________________
```

---

## Step 2: Create/Verify Integration

1. Go to **Developers → Payment Integrations**
2. Click **Add** or find your existing "Online Card" integration
3. Configure:

| Setting | Value |
|---------|-------|
| **Integration Name** | `Online Card` or `Tawriqa Cards` |
| **Integration Type** | `Online Card` |
| **Currency** | `EGP` |

4. Copy the **Integration ID**

```
Your Integration ID: 5462573 (or your ID)
```

---

## Step 3: Create/Verify Iframe

1. Go to **Developers → iframes**
2. Click **Add** or find existing iframe
3. Configure:

| Setting | Value |
|---------|-------|
| **Iframe Name** | `Tawriqa Payment` |
| **Active** | ✅ Yes |

4. Copy the **Iframe ID**

```
Your Iframe ID: 994937 (or your ID)
```

---

## Step 4: Configure Callback URLs ⚠️ CRITICAL

1. Go to **Developers → Payment Integrations**
2. Click **Edit** on your integration (gear icon)
3. Go to **Callbacks** tab
4. Set these URLs:

### For Local Testing (VS Code Port Forward):
```
Transaction processed callback: (leave empty for now)
Transaction response callback: http://127.0.0.1:5173/checkout/success
```

### For Production:
```
Transaction processed callback: https://your-n8n-webhook-url
Transaction response callback: https://yourdomain.com/checkout/success
```

### 📡 Understanding the Two Callbacks:

| Callback | Type | Purpose |
|----------|------|---------|
| **Transaction response** | Browser Redirect | Redirects customer's browser after payment |
| **Transaction processed** | Server Webhook | Sends POST to your backend for order updates |

#### Transaction Response Callback (Browser Redirect)
- **What it does**: After payment, redirects customer's browser to this URL
- **Purpose**: Show customer a success or failed page
- **Contains**: URL parameters like `?success=true&id=123&amount_cents=5000`
- **Example**: `http://127.0.0.1:5173/checkout/success?success=true`

#### Transaction Processed Callback (Server Webhook)
- **What it does**: Paymob sends a POST request to your server
- **Purpose**: Update order status in database, send notifications
- **More reliable**: Works even if customer closes browser
- **Contains**: Full JSON payload with payment details
- **Use for**: n8n workflow to update order `payment_status` to `paid`

> 💡 **For testing**: You only need the **Transaction response callback**.
> The **Transaction processed callback** is for production (n8n webhook).

---

## Step 5: Get HMAC Secret

1. Go to **Developers → Payment Integrations**
2. Click **Edit** on your integration
3. Go to **HMAC Secret** tab
4. Copy the secret

```
Your HMAC Secret: ___________________________________
```

---

## Step 6: Update Backend .env

Update `backend-api/.env`:

```env
# Paymob Configuration
PAYMOB_API_KEY=your_api_key_here
PAYMOB_INTEGRATION_ID=5462573
PAYMOB_IFRAME_ID=994937
PAYMOB_HMAC_SECRET=your_hmac_secret_here
```

---

## Step 7: Test Payment

### Test Cards (Paymob Egypt):

| Card Type | Number | Expiry | CVV | Result |
|-----------|--------|--------|-----|--------|
| **Mastercard (Success)** | `5123456789012346` | `12/25` | `123` | ✅ Approved |
| **Visa (Success)** | `4987654321098769` | `12/25` | `123` | ✅ Approved |
| **Mastercard 2** | `2223000048410010` | `12/25` | `123` | ✅ Approved |
| **Declined Card** | `4000000000000002` | `12/25` | `123` | ❌ Declined |

### Test Flow:
1. Add items to cart
2. Select "بطاقة ائتمان" 
3. Enter test card details
4. On 3DS page, select "(Y) Authentication Successful"
5. Should redirect to success page

---

## 🔍 Troubleshooting

### Payment Declined?

1. **Check Paymob Dashboard → Transactions**
   - Find your transaction by ID
   - Check the decline reason

2. **Common Issues:**
   | Issue | Solution |
   |-------|----------|
   | "Authentication Failed" | Make sure integration is in test mode |
   | "Invalid Card" | Try a different test card |
   | "Amount too low" | Minimum is usually 1 EGP (100 cents) |
   | "Integration not active" | Enable integration in dashboard |

3. **Enable Test Mode:**
   - Contact Paymob support to ensure test mode is enabled
   - Some accounts need manual activation

### No Redirect After Payment?

1. Check **Callbacks** are configured correctly
2. Make sure callback URL is reachable
3. Check browser console for errors

---

## 📞 Paymob Support

- Email: support@paymob.com
- Phone: (Check their website for Egypt number)
- Dashboard: Help → Contact Support

---

## ✅ Your Current Configuration

| Setting | Value |
|---------|-------|
| API Key | (in .env) |
| Integration ID | `5462573` |
| Iframe ID | `994937` |
| HMAC Secret | (in .env) |
| Callback URL | `/checkout/success` |

---

*Last Updated: January 2026*
