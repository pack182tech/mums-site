# Admin Dashboard Guide

## Accessing the Admin Dashboard

1. Navigate to: `admin-orders.html`
2. Login with password: `pack182admin`

## Features

### View Orders
- See all orders with customer information
- Filter by payment status (Pending/Paid)
- Filter by order status (New/Processing/Completed)
- Search by customer name or order ID

### Export Orders
- Click "Export CSV" to download orders
- File includes all order details for easy processing
- Use for record keeping or importing to other systems

### Order Details
- Click any order row to see full details
- View complete customer information
- See all products ordered with quantities

### Statistics
- Total Orders count
- Total Revenue calculation
- Pending Payments tracking
- New Orders count

## Security Note
For production use, implement proper server-side authentication. The current password-based system is for demonstration only.

## Updating Order Status
Currently, order status updates must be done directly in the Google Sheet. Future versions will include in-dashboard editing.