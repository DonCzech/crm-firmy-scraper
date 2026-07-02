# E2E QA Scenario: Product -> Order -> Customer

## Preconditions
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3001`
- Open app in a clean browser tab (hard refresh recommended)

## 1. Create Product With Multiple Images
1. Go to `http://localhost:5173/core/product-list`
2. Click `New Product` (or open create flow from your UI button)
3. Fill:
   - `Product Name`: `QA E2E Product`
   - `Price`: `1999`
   - `Category`: `QA`
   - `Description`: `E2E validation product`
4. Upload image #1
5. Upload image #2
6. Click `Create`

Expected:
- Product appears in list
- Thumbnail is visible in list row
- First image is not overwritten by second one

## 2. Verify Product Detail Gallery
1. In `product-list`, open row action menu for `QA E2E Product`
2. Click `View Details`
3. In detail panel:
   - Main image should be visible
   - Thumbnails should be real uploaded images (no demo-only set)
4. Click thumbnail #2

Expected:
- Main image switches to thumbnail #2
- No broken image icon

## 3. Verify Product Edit Image Persistence
1. In `product-list`, open row action menu for `QA E2E Product`
2. Click `Edit Product`
3. Verify uploaded images are present in image area
4. Save without changes

Expected:
- Images remain persisted
- No fallback to demo shoes

## 4. Create Order
1. Go to `http://localhost:5173/core/order-list`
2. Click `New Order`
3. Fill:
   - `Customer Name`: `QA Customer`
   - `Customer Email`: `qa.customer@example.com`
   - `Category`: `QA`
   - `Amount`: `1999`
4. Click `Create Order`

Expected:
- Success toast appears
- New order appears in order list

## 5. Open Real Order Detail (No Demo Sheet)
1. In `order-list`, click order ID (or row action `View Details`)

Expected:
- Navigates to `http://localhost:5173/core/order-details?orderId=<id>`
- No demo `OrderDetailsSheet` modal opens
- Detail page shows real order data

## 6. Validate Order Detail Content
1. On `order-details` page verify:
   - Order number shown
   - Payment and delivery status badges shown
   - Customer name/email shown
   - Order item list shown
   - Item image shown (or valid fallback image)
   - Totals in summary are consistent

Expected:
- All values are loaded from backend data
- No static demo placeholders

## 7. Customer Link From Order Detail
1. On `order-details`, click `Open Customer Detail` (if enabled)

Expected:
- Navigates to `http://localhost:5173/core/customer-list-details?customerId=<id>`
- Customer detail opens for matched customer

## 8. Regression Checks In Related Tables
1. Open:
   - `details-orders` view
   - `details-invoice` view
2. Use `View Details` / click on order/invoice ID

Expected:
- Always navigates to real `/core/order-details?orderId=...`
- No demo order detail modal appears anywhere

## Pass/Fail Criteria
- PASS if all expected results are met with no console errors and no broken images.
- FAIL if any screen still opens demo detail, image switching fails, or saved images disappear.
