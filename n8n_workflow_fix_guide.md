# n8n Workflow Manual Update Guide

**Objective**: Fix the Missing Size (Blue Badge) and Extra Options (Gray Badges) in the Kitchen Window by teaching the AI Agent to add sizes & options directly into the final `CONFIRM_ORDER` JSON structure.

(You don't need any intermediate "Add to Cart" intents. The AI should simply accumulate the customer's request and output everything in one go when confirming).

## 1. Locate the Nodes
Open your n8n workflow editor and find these nodes:
- **AI Agent3** (Primary Ordering Agent - CRITICAL)
- **AI Agent4** (Location Check Agent)
- **AI Agent5** (Location Check Agent)

---

## 2. Update "AI Agent3" (Primary Order Agent)

Double-click **AI Agent3**. Scroll to **System Message**.

### Step A: Update Intent Definitions (Section 6)

Find **Section 6. INTENT CLASSIFICATION & OUTPUT RULES**.
Ensure your `CONFIRM_ORDER` and `MODIFY_ORDER` rules look exactly like this (Remove any older variants):

#### 3. CONFIRM_ORDER
```text
3.  **`CONFIRM_ORDER`**
    - Trigger: User lists the items they want to order and says "Yes" to confirm the final order.
    - **Logic:** Match items to Menu. 
    - Data: 
      - `items` (Array of objects).
        - Each item MUST have: `name`, `qty`, `price`.
        - If applicable: `size` (String, e.g., "Medium", "Roll", "Large").
        - If applicable: `options` (Array of Strings, e.g., ["Spicy", "No Cut", "Extra Cheese"]).
      - `address_id` (Integer from context ID).
      - `kitchen_notes`: String. Extract any special cooking requests here (e.g., "Cut in squares", "Don't burn it", "Extra napkins"). If none, use empty string "".
```

#### 4. MODIFY_ORDER
```text
4.  **`MODIFY_ORDER`**
    - Trigger: User confirms changes to an active order.
    - Data: `order_id`, `new_items` (Structure same as CONFIRM_ORDER), `notes`.
```

### Step B: Update Examples (Section 8)

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
Update the `CONFIRM_ORDER` definition to match the new item structure. Remove any `ADD_TO_CART` rules.
**Note:** These agents use `lat` / `lng` / `customer_name` in `CONFIRM_ORDER`, NOT `address_id`.

#### 3. CONFIRM_ORDER
```text
3.  **`CONFIRM_ORDER`**
    - Trigger: "Confirm", "Place order", "تمام" accompanied by the list of items.
    - **Output Data:** 
      - `items` (Array of objects).
        - Each item MUST have: `name`, `qty`, `price`.
        - If applicable: `size` (String, e.g., "Medium", "Roll", "Large").
        - If applicable: `options` (Array of Strings, e.g., ["Spicy", "No Cut", "Extra Cheese"]).
      - `customer_name` (if known), `lat` (if known), `lng` (if known).
```

### Step B: Update Examples (Section 7)

**CRITICAL:** Replace the complex ordering examples to show the AI exactly how to handle sizes vs sizes-as-options.

#### Replace "Ex 6: Ordering (Complex)" with this:

```json
{
  "intent": "CONFIRM_ORDER",
  "reply_to_user": "تمام يا فندم! 🥞 ضيفتلك 2 فطيرة سجق (وسط) و 1 نوتيلا. الطلب هيوصل في أقرب وقت!",
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
    ],
    "lat": 31.0,
    "lng": 31.0
  }
}
```

#### Add "Ex 8: Ambiguous Item" at the end:

```json
{
  "intent": "CONFIRM_ORDER",
  "reply_to_user": "تمام، واحد مشلتت وسط مع عسل زيادة. جاري تجهيز الطلب.",
  "data": {
    "items": [
      {
        "name": "Meshaltet Feteer",
        "size": "Medium",
        "qty": 1,
        "price": 0,
        "options": ["Extra Honey"]
      }
    ],
    "lat": 31.0,
    "lng": 31.0
  }
}
```

## 4. Verification Checklist

After saving the node prompts, test the bot.

1.  **"One medium sausage feteer spicy" -> "Yes confirm"**
    -   Expect JSON: `size: "Medium"`, `options: ["Spicy"]` inside `CONFIRM_ORDER`.
    -   Result: Kitchen Window Blue Badge says "Medium", Gray Badge says "+ Spicy".
