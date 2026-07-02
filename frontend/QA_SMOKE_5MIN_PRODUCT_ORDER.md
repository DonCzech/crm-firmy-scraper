# 5-Min Smoke Test: Product + Order Flow

## Preconditions
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Hard refresh page

## 1. Product Create + Image (1 min)
1. Open `http://localhost:5173/core/product-list`
2. Create product `SMOKE Product` with one image

Expected:
- Product row appears
- Thumbnail is visible (no broken image)

## 2. Product Gallery Switch (1 min)
1. Edit same product
2. Upload second image
3. Open `View Details`
4. Click thumbnail #2

Expected:
- Main image switches to second thumbnail
- First image is not lost

## 3. Order Create (1 min)
1. Open `http://localhost:5173/core/order-list`
2. Create order for `Smoke Customer` (`smoke.customer@example.com`)

Expected:
- Success toast
- New order visible in list

## 4. Real Order Detail Navigation (1 min)
1. Click new order ID or `View Details`

Expected:
- Opens `/core/order-details?orderId=...`
- No demo order detail modal appears

## 5. Customer Link + Key Data (1 min)
1. On order detail verify:
   - statuses, totals, order items
   - item image visible
2. Click `Open Customer Detail` (if enabled)

Expected:
- Navigates to `/core/customer-list-details?customerId=...`

## Smoke Pass Rule
- PASS: all 5 sections green, no broken image, no demo modal, no blocker error.
- FAIL: any missing navigation, image bug, or failed create/update action.
