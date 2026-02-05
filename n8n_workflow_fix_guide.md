# n8n Workflow Manual Update Guide

**Objective**: Fix the Missing Size (Blue Badge) and Extra Options (Gray Badges) in the Kitchen Window.

To fix this, we need to teach the AI Agent to separate the **Size** (e.g., "Medium", "Roll") from the **Options/Extras** (e.g., "Spicy", "No Cut").

## 1. Locate the Nodes
Open your n8n workflow editor and find these nodes:
- **AI Agent3** (Primary Ordering Agent - CRITICAL)
- **AI Agent4** (Location Check Agent)
- **AI Agent5** (Location Check Agent)

## 2. Update "AI Agent3" (Primary Order Agent)

Double-click **AI Agent3**. Scroll to **System Message**.

### Step A: Update Intent Definitions (Section 6 in Agent3)

Find **Section 6. INTENT CLASSIFICATION & OUTPUT RULES**.
Replace the definitions for `ADD_TO_CART`, `CONFIRM_ORDER`, and `MODIFY_ORDER` with these rules. 
**Note:** `AI Agent3` uses `address_id` in `CONFIRM_ORDER`.

#### 3. ADD_TO_CART
```text
3.  **`ADD_TO_CART`**
    - Trigger: User selects items.
    - **Logic:** Match items to Menu. Keep cumulative list.
    - **Output Data:** `items` (Array of objects).
      - Each item MUST have: `name`, `qty`, `price`.
      - If applicable: `size` (String, e.g., "Medium", "Roll", "Large").
      - If applicable: `options` (Array of Strings, e.g., ["Spicy", "No Cut", "Extra Cheese"]).
```

#### 4. CONFIRM_ORDER
```text
4.  **`CONFIRM_ORDER`**
    - Trigger: User says "Yes" AFTER Revision Phase.
    - Data: 
      - `items` (Same structure as ADD_TO_CART).
      - `address_id` (Integer from context ID).
      - `kitchen_notes`: String. Extract any special cooking requests here (e.g., "Cut in squares", "Don't burn it", "Extra napkins"). If none, use empty string "".
```

#### 6. MODIFY_ORDER
```text
6.  **`MODIFY_ORDER`**
    - Trigger: User confirms changes to an active order.
    - Data: `order_id`, `new_items` (Structure same as ADD_TO_CART), `notes`.
```

### Step B: Update Examples (Section 8 in Agent3)

Find **Section 8. EXTENSIVE EXAMPLES**.
Replace **Example 7** (Confirmation) or the relevant Ordering example to show the `size` field.

#### Ex 7: Confirmation (Phase 5)
```json
{
  "intent": "CONFIRM_ORDER",
  "reply_to_user": "تم تأكيد الطلب! 🎉 ألف هنا مقدماً.",
  "data": {
    "items": [ 
      { "name": "Meshaltet Medium", "size": "Medium", "qty": 1, "price": 135, "options": [] } 
    ],
    "address_id": 101,
    "kitchen_notes": "Cut into small squares please"
  }
}
```

---

## 3. Update "AI Agent4" & "AI Agent5" (Location Agents)

Double-click **AI Agent4** or **AI Agent5**. Scroll to **System Message**.

### Step A: Update Intent Definitions (Section 5)

Find **Section 5. INTENT CLASSIFICATION**.
Replace definitions for `ADD_TO_CART` and `CONFIRM_ORDER`.
**Note:** These agents uses `lat` / `lng` / `customer_name` in `CONFIRM_ORDER`, NOT `address_id`.

#### 3. ADD_TO_CART
```text
3.  **`ADD_TO_CART`**
    - Trigger: User selects items.
    - **Logic:** Match items to Menu. Keep cumulative list.
    - **Output Data:** `items` (Array of objects).
      - Each item MUST have: `name`, `qty`, `price`.
      - If applicable: `size` (String, e.g., "Medium", "Roll", "Large").
      - If applicable: `options` (Array of Strings, e.g., ["Spicy", "No Cut", "Extra Cheese"]).
```

#### 4. CONFIRM_ORDER
```text
4.  **`CONFIRM_ORDER`**
    - Trigger: "Confirm", "Place order", "تمام".
    - **Logic:** Only trigger if items exist in cart history.
    - **Output Data:** `items` (Structure same as ADD_TO_CART: incl. name, qty, price, size, options), `customer_name` (if known), `lat` (if known), `lng` (if known).
```

### Step B: Update Examples (Section 7)

**CRITICAL:** Replace **Example 6** and add **Example 8** to show the AI exactly how to handle sizes vs sizes-as-options.

#### Replace "Ex 6: Ordering (Complex)" with this:

```json
{
  "intent": "ADD_TO_CART",
  "reply_to_user": "تمام يا فندم! 🥞 ضيفتلك 2 فطيرة سجق (وسط) و 1 نوتيلا. تحب تزود أي مشروبات؟",
  "data": {
    "items": [ 
      { 
        "name": "Sausage Feteer", 
        "size": "Medium", 
        "qty": 2, 
        "price": 0, 
        "options": ["Spicy"] 
      }, 
      { 
        "name": "Nutella Feteer", 
        "size": "Roll", 
        "qty": 1, 
        "price": 0,
        "options": []
      }
    ] 
  }
}
```

#### Add "Ex 8: Ambiguous Item" at the end:

```json
{
  "intent": "ADD_TO_CART",
  "reply_to_user": "تمام، واحد مشلتت وسط مع عسل زيادة. أي خدمة تانية؟",
  "data": {
    "items": [
      {
        "name": "Meshaltet Feteer",
        "size": "Medium",
        "qty": 1,
        "price": 0,
        "options": ["Extra Honey"]
      }
    ]
  }
}
```

## 4. Verification Checklist

After saving, test with these messages:

1.  **"One medium sausage feteer spicy"**
    -   Expect JSON: `size: "Medium"`, `options: ["Spicy"]`
    -   Result: Blue Badge says "Medium", Gray Badge says "+ Spicy".

2.  **"Two rolls chocolate no cut"**
    -   Expect JSON: `size: "Roll"`, `options: ["No Cut"]`
    -   Result: Blue Badge says "Roll", Gray Badge says "+ No Cut".

3.  **"Change order #123 to make it Large"**
    -   Expect JSON (MODIFY_ORDER): `new_items` contains `size: "Large"`.
