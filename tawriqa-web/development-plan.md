# Tawriqa Web Client - Development Plan

> **Objective**: Ensure the consumer web client is fully compatible with the new hybrid variations system and all features are polished and working correctly.

---

## 🎯 Current State Analysis

The web client (`tawriqa-web`) has been partially updated for the hybrid variations system. After thorough review, the following areas need attention:

### ✅ Already Implemented
- [x] `ProductModal.tsx` - Rewritten to use `item.options` with item-specific prices
- [x] `types/index.ts` - Types include `MenuOptionGroup`, `MenuOptionChoice`, `choices` array

### ⚠️ Needs Polish/Fixes
- [ ] Price display issues
- [ ] Translation gaps
- [ ] Cart display improvements
- [ ] UI/UX polish
- [ ] Third language support

---

## 📋 Phase 1: Critical Fixes

### 1.0 🔴 FIX: Category Images Missing
**File**: `backend-api/src/controllers/menuController.ts`

**Issue**: The controller fetches `image_url` from DB but explicitly excludes it when mapping the response object.

**Change Needed**:
```typescript
const menu: MenuCategory[] = categories.map((cat: any) => ({
    id: cat.id,
    name_ar: cat.name_ar,
    name_en: cat.name_en,
    name_other: cat.name_other, // Add this
    image_url: cat.image_url,   // Add this!
    items: []
}));
```

### 1.0b 🔴 FIX: Frontend Types
**File**: `tawriqa-web/src/types/index.ts`

**Issue**: `MenuCategory` interface is missing `image_url` property.

**Change Needed**:
```typescript
export interface MenuCategory {
    // ...
    image_url?: string;
}
```

### 1.1 ProductModal Price Display Fix
**File**: `src/components/menu/ProductModal.tsx`

**Issues**:
- Price calculation for `is_price_replacement` groups may be incorrect
- When price replacement group is selected, base price should be completely replaced, not added

**Changes Needed**:
```diff
- if (hasReplacementPrice) {
-     total = replacementPriceTotal + (total - (item.current_price || item.base_price));
- }
+ if (hasReplacementPrice) {
+     total = replacementPriceTotal;
+     // Add non-replacement options (extras) on top
+     item.options?.forEach((group: MenuOptionGroup) => {
+         if (!group.is_price_replacement) {
+             const selectedIds = selections[group.id] || [];
+             selectedIds.forEach(id => {
+                 const choice = group.choices?.find(c => c.id === id);
+                 if (choice) total += choice.price_modifier;
+             });
+         }
+     });
+ }
```

### 1.2 MenuItemCard - Show "From" Price
**File**: `src/components/menu/MenuItemCard.tsx`

**Issue**: When item has pricing groups (sizes), show "From X EGP" instead of base price

**Changes Needed**:
- Accept `hasOptions` prop to indicate item has pricing options
- Add "From" prefix when item has options
- Calculate minimum price from options if available

```tsx
// Add to props
hasOptions?: boolean;
minPrice?: number;

// In render
<span className="font-bold text-lg text-primary">
    {hasOptions && <span className="text-xs font-normal">{lang === 'ar' ? 'من ' : 'From '}</span>}
    {minPrice || price} <span className="text-xs font-normal text-gray-400">{t('common.currency')}</span>
</span>
```

### 1.3 Menu.tsx - Pass Options Info to Card
**File**: `src/pages/Menu.tsx`

**Changes Needed**:
```tsx
<MenuItemCard
    ...
    hasOptions={item.options && item.options.length > 0}
    minPrice={calculateMinPrice(item)} // New helper function
    ...
/>
```

---

## 📋 Phase 2: Cart & Checkout Improvements

### 2.1 CartDrawer - Show Selected Options Better
**File**: `src/components/menu/CartDrawer.tsx`

**Current**: Shows options as bullet points
**Enhancement**: Add option prices, group by type

```tsx
{/* Options Display - Enhanced */}
<div className="text-xs text-gray-500 space-y-0.5">
    {item.selectedOptions?.map((opt, i) => (
        <span key={i} className="flex justify-between">
            <span>• {opt.name}</span>
            {opt.price > 0 && <span className="text-gray-400">+{opt.price}</span>}
        </span>
    ))}
    {item.notes && (
        <span className="block text-gray-400 italic mt-1">📝 {item.notes}</span>
    )}
</div>
```

### 2.2 Checkout.tsx - Show Options in Summary
**File**: `src/pages/Checkout.tsx`

**Enhancement**: Display selected options under each item

```tsx
{items.map(item => (
    <div key={item.id} className="space-y-1">
        <div className="flex justify-between text-sm">
            <div>
                <span className="font-bold text-gray-700">{item.quantity}x</span> {item.name}
            </div>
            <span className="text-gray-900 font-medium">
                {(item.totalPrice * item.quantity).toFixed(0)}
            </span>
        </div>
        {/* NEW: Show options */}
        {item.selectedOptions?.length > 0 && (
            <div className="text-xs text-gray-400 ps-4">
                {item.selectedOptions.map(o => o.name).join(' • ')}
            </div>
        )}
    </div>
))}
```

---

## 📋 Phase 3: Translation & Localization

### 3.1 Add Missing Translation Keys
**File**: `src/hooks/useTranslation.ts`

**Add to all languages (ar, en, ru)**:
```typescript
// Menu
'menu.from': 'من',  // 'From' for min price
'menu.total': 'الإجمالي',
'menu.special_instructions': 'ملاحظات خاصة',
'menu.add_to_cart': 'أضف للسلة',
'menu.required': 'مطلوب',
'menu.optional': 'اختياري',

// Checkout
'checkout.subtotal': 'المجموع الفرعي',
'checkout.delivery_fee': 'رسوم التوصيل',
```

### 3.2 Third Language Support (Other)
**File**: `src/components/menu/ProductModal.tsx`

**Current**: Only shows AR/EN
**Enhancement**: Support third language when available

```tsx
// Helper function
const getLocalizedName = (ar: string, en?: string, other?: string) => {
    if (lang === 'other' && other) return other;
    if (lang === 'en' && en) return en;
    return ar;
};

// Usage
{getLocalizedName(item.name_ar, item.name_en, item.name_other)}
```

---

## 📋 Phase 4: UI/UX Polish

### 4.1 ProductModal - Visual Improvements
**File**: `src/components/menu/ProductModal.tsx`

**Enhancements**:
1. Different styling for single-select (radio) vs multi-select (checkbox) groups
2. Show selection count indicator for multi-select groups
3. Animate price changes smoothly
4. Add loading state for image

```tsx
// Radio-style for single select (max_selection === 1)
<div className={clsx(
    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
    isSelected ? "border-primary bg-primary" : "border-gray-300"
)}>
    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
</div>

// Checkbox-style for multi select (max_selection > 1)
<div className={clsx(
    "w-5 h-5 rounded border-2 flex items-center justify-center",
    isSelected ? "border-primary bg-primary" : "border-gray-300"
)}>
    {isSelected && <Check className="w-3 h-3 text-white" />}
</div>
```

### 4.2 Empty State Handling
**File**: `src/components/menu/ProductModal.tsx`

**Enhancement**: Handle items with no options gracefully

```tsx
{(!item.options || item.options.length === 0) ? (
    <div className="py-4 text-center text-gray-400">
        {lang === 'ar' ? 'لا توجد خيارات إضافية' : 'No additional options'}
    </div>
) : (
    // Render options...
)}
```

### 4.3 Price Animation
**Enhancement**: Animate total price when it changes

```css
/* Add to index.css */
.price-transition {
    transition: all 0.3s ease;
}
```

---

## 📋 Phase 5: Backend Data Verification

### 5.1 Verify API Response Structure
**What to verify**:
- `options` array contains `choices` (not `option_choices`)
- `choices` have `price_modifier` from `choice_prices`
- Groups with only price=0 choices are filtered out
- `is_price_replacement` flag is present on groups

### 5.2 Test API Endpoint
```bash
curl http://localhost:4001/api/branches/1/menu | jq '.[] | .items[] | {name: .name_ar, options}'
```

### 5.3 Backend Response Expected Structure
```json
{
  "id": 1,
  "name_ar": "شاورما دجاج",
  "name_en": "Chicken Shawarma",
  "base_price": 0,
  "current_price": 0,
  "options": [
    {
      "id": 1,
      "name_ar": "الحجم",
      "name_en": "Size",
      "min_selection": 1,
      "max_selection": 1,
      "is_price_replacement": true,
      "choices": [
        { "id": 1, "name_ar": "صغير", "name_en": "Small", "price_modifier": 35 },
        { "id": 2, "name_ar": "وسط", "name_en": "Medium", "price_modifier": 50 },
        { "id": 3, "name_ar": "كبير", "name_en": "Large", "price_modifier": 70 }
      ]
    }
  ]
}
```

---

## 📋 Phase 6: Testing Checklist

### 6.1 Functional Tests
- [ ] Load menu with items that have options
- [ ] Open ProductModal and see options displayed
- [ ] Select a size (single-select) - price updates
- [ ] Select extras (multi-select) - prices add up
- [ ] Add to cart with selected options
- [ ] View cart - options displayed correctly
- [ ] Complete checkout - options in order summary
- [ ] Items with no options still work

### 6.2 Edge Cases
- [ ] Item with only price replacement group (sizes only)
- [ ] Item with only add-on group (extras only)
- [ ] Item with both sizes and extras
- [ ] Item with zero options (should show base price)
- [ ] Required group validation (can't add without selection)
- [ ] Max selection limit enforced

### 6.3 Language Tests
- [ ] Arabic display
- [ ] English display  
- [ ] Third language display (if enabled)
- [ ] RTL layout correct

---

## 📋 Implementation Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 HIGH | Fix price calculation in ProductModal | Low | Critical |
| 🔴 HIGH | Show "From" price on MenuItemCard | Medium | User clarity |
| 🟡 MEDIUM | Cart options display | Low | UX |
| 🟡 MEDIUM | Add missing translations | Low | Polish |
| 🟢 LOW | Radio vs Checkbox styling | Low | Visual |
| 🟢 LOW | Price animation | Low | Delight |

---

## 🚀 Next Steps

1. **Start with Phase 1.1** - Fix the price calculation logic
2. **Then Phase 1.2/1.3** - Update MenuItemCard to show "From X"
3. **Test thoroughly** with real data from the backend
4. **Polish UI** as needed based on testing

---

## 📁 Files to Modify

| File | Changes |
|------|---------|
| `src/components/menu/ProductModal.tsx` | Price calc, radio/checkbox, third lang |
| `src/components/menu/MenuItemCard.tsx` | "From" price, hasOptions prop |
| `src/components/menu/CartDrawer.tsx` | Better options display |
| `src/pages/Menu.tsx` | Pass options info to cards |
| `src/pages/Checkout.tsx` | Show options in summary |
| `src/hooks/useTranslation.ts` | Add missing keys |
| `src/index.css` | Price animation CSS |
