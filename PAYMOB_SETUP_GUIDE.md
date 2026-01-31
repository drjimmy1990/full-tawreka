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

**You must configure TWO different links.** They do completely different things.

| Link Name in Paymob | What it is | Where it goes | Example Value (Production) |
|---------------------|------------|---------------|----------------------------|
| **Transaction Response Callback** | **Frontend Redirect** | Takes customer back to your website after payment. | `https://tawriqa.com/checkout/success` |
| **Transaction Processed Callback**| **Backend Webhook** | Tells your system payment is Done (Secure). | `https://n8n.tawriqa.com/webhook/paymob-callback` |

### 1. Go to Paymob Dashboard:
1. Go to **Developers → Payment Integrations**
2. Click **Edit** on your integration (gear icon)
3. Go to **Callbacks** tab

### 2. Set the URLs:

#### A) Transaction Response Callback (The Redirect)
*   **Purpose:** Redirects the customer's browser back to your site.
*   **Development:** `http://localhost:5173/checkout/success`
*   **Production:** `https://[YOUR_WEBSITE_DOMAIN]/checkout/success`

#### B) Transaction Processed Callback (The Webhook)
*   **Purpose:** Sends data to your N8N automation to mark order as "PAID" in Supabase.
*   **Development:** (Usually empty or local tunnel)
*   **Production:** `https://[YOUR_N8N_DOMAIN]/webhook/paymob-callback`
    *   *Important: Use the N8N **Production** URL, not the Test URL.*

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
