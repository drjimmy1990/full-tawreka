# Tawreka System API Documentation

**Version:** 1.0  
**Base URL:** `https://tarwekaapi.ai4eg.com/api`  
**Authentication:**
- **Public Routes:** No authentication required.
- **Protected Routes:** Require header `x-api-key: <your_secret_key>`.

---

## 📚 Table of Contents
1. [Authentication & Security](#authentication--security)
2. [Public Endpoints (Website & Guests)](#public-endpoints)
    - [Get Site Settings](#get-site-settings)
    - [Check Delivery Coverage](#check-delivery-coverage)
    - [Get Active Branches](#get-active-branches)
    - [Get Branch Menu](#get-branch-menu)
    - [Guest Checkout (Create Order)](#guest-checkout-create-order)
    - [Track Order](#track-order)
3. [Protected Endpoints (Bots, Admin, Integration)](#protected-endpoints)
    - [Create Order (Bot)](#create-order-bot)
    - [Update Order Status](#update-order-status)
    - [Request Modification](#request-modification)

---

## Authentication & Security

For **Protected Routes**, you must include the API Key in the request headers.

| Header Name | Value | Description |
| :--- | :--- | :--- |
| `x-api-key` | `YOUR_SECRET_KEY` | Secured server-to-server key. |
| `Content-Type` | `application/json` | Standard JSON body format. |

---

## Public Endpoints

These endpoints are used by the web frontend and do not require the `x-api-key`.

### Get Site Settings
Retrieves global site configuration (branding, colors, maintenance mode).

- **URL:** `/settings`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "settings": {
      "site_name": "Tawreka",
      "logo_url": "...",
      "maintenance_mode": false
    }
  }
  ```

### Check Delivery Coverage
Determines if a user's location falls within any active branch's delivery polygon.

- **URL:** `/geo/check-coverage`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "lat": 30.0444,
    "lng": 31.2357
  }
  ```
- **Success Response (200):**
  ```json
  {
    "covered": true,
    "branch_id": 2,
    "delivery_fee": 15
  }
  ```
- **Failure Response (200):**
  ```json
  {
    "covered": false
  }
  ```

### Get Active Branches
Lists all branches that are currently active and accepting orders.

- **URL:** `/branches`
- **Method:** `GET`
- **Response:** Array of Branch objects.

### Get Branch Menu
Retrieves the full menu (categories and items) for a specific branch.

- **URL:** `/branches/:id/menu`
- **Method:** `GET`
- **Path Params:** `id` (Branch ID)

### Guest Checkout (Create Order)
**CRITICAL:** The primary endpoint for creating orders from the website or unauthenticated sources.

- **URL:** `/checkout/order`
- **Method:** `POST`
- **Body Schema:**
  ```json
  {
    "branch_id": 2,               // (Required) ID of the branch
    "service_type": "delivery",   // "delivery" or "pickup"
    "customer_name": "Mostafa",   // (Required)
    "customer_phone": "010...",   // (Required)
    "customer_address": "Street 9...", // Text address
    "delivery_lat": 30.0,         // (Required if delivery)
    "delivery_lng": 31.0,         // (Required if delivery)
    "payment_method": "cash",     // "cash" or "card"
    "notes": "Doorbell broken",   // General order notes
    "items": [                    // (Required) Array of items
      {
        "name": "Pizza",          // (Optional if item_id provided)
        "item_id": 55,            // (Optional) Database ID of item
        "qty": 1,
        "unit_price": 100,        // Price sent from frontend
        "size": "Large",          // (Optional) Explicit size
        "options": [              // (Optional) List of selected options
             { "name": "Spicy", "price": 5 }
        ]
      }
    ]
  }
  ```

### Track Order
Get the public status of an order.

- **URL:** `/orders/:id`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "success": true,
    "status_arabic": "👨‍🍳 بيجهز في المطبخ",
    "order": { ... } // Full order object
  }
  ```

---

## Protected Endpoints

**⚠️ specific for Bots (n8n), Admin Panel, and System Automations.**  
**REQUIRES:** `x-api-key` header.

### Create Order (Bot)
Used by the AI Bot when it has already identified an existing customer and their saved address ID.

- **URL:** `/orders`
- **Method:** `POST`
- **Body Schema:**
  ```json
  {
    "customer_id": 123,           // Existing User ID in Supabase
    "address_id": 45,             // Existing Address ID in Supabase
    "kitchen_notes": "Bot Order", // Notes
    "items": [
      {
        "name": "Feteer Meshaltet",
        "qty": 2,
        "price": 150,            // Unit or Total Price (Backend calculates total independently for validation)
        "size": "Medium",        // <--- CRITICAL for Kitchen Display
        "options": ["Honey", "Cheese"] // <--- Options/Sides
      }
    ]
  }
  ```
- **Success Response (201):**
  ```json
  {
    "success": true,
    "order_id": 5050,
    "daily_seq": 12,
    "branch_name": "Mansoura",
    "total_price": 350,
    "message": "Order created successfully"
  }
  ```

### Update Order Status
Change the lifecycle state of an order (e.g., Kitchen -> Delivery).

- **URL:** `/orders/:id/status` (or `PATCH /orders/:id`)
- **Method:** `PATCH`
- **Body:**
  ```json
  {
    "status": "out_for_delivery" 
    // Allowed: "pending", "accepted", "in_kitchen", "out_for_delivery", "done", "cancelled"
  }
  ```
- **If Cancelling:**
  ```json
  {
    "status": "cancelled",
    "reason": "Customer unreachable"
  }
  ```

### Request Modification
Used by the AI Bot when a customer wants to change an order that is already "In Kitchen". This does NOT change the order immediately but flags it for Manager Approval.

- **URL:** `/orders/:id/modify`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "items": [ ... ], // New full list of items
    "notes": "Customer wanted to add Pepsi"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Modification request sent to kitchen manager."
  }
  ```
