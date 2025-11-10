# Email Integration for Purchase Orders

## Overview

The email integration feature provides automated email template generation and one-click sending for purchase orders. This feature streamlines the ordering process by pre-filling email content with purchase order details and supplier information.

## Requirements Implemented

- **Requirement 5.3**: Create pre-written email template generation with supplier contact information
- **Requirement 5.5**: Implement one-click mailto link generation with PO attachments
- **Requirement 5.6**: Implement supplier information prompting when details are missing

## Features

### 1. Email Template Generation

The system automatically generates professional email templates for purchase orders that include:

- Supplier greeting with company name
- Purchase order number and date
- Formatted table of ordered items with SKU, name, quantity, unit cost, and totals
- Total order amount
- Expected lead time information
- Professional closing

**Example Email:**
```
Dear Test Supplier Inc Team,

Please find our purchase order PO-20240101-001 attached. We would like to place an order for the following items:

SKU            Item Name                          Quantity    Unit Cost   Total
----------------------------------------------------------------------------------
SKU-001        Widget A                           10          $25.50      $255.00
SKU-002        Widget B                           5           $50.00      $250.00

Total Order Amount: $505.00

Expected Lead Time: 7 days
Please confirm receipt of this order and provide an estimated delivery date.

Thank you for your continued partnership.

Best regards,
Inventory Management Team
```

### 2. Email Preview

Before sending, users can preview the complete email including:
- Recipient email address
- Subject line
- Full email body
- Warnings about attaching the PDF

### 3. One-Click Email Sending

The system generates `mailto:` links that:
- Open the user's default email client
- Pre-fill the recipient, subject, and body
- Include a reminder to attach the PDF purchase order
- Automatically track when emails are sent

### 4. Supplier Contact Validation

The system validates that suppliers have required contact information:
- Email address (required)
- Name (required)
- Phone number (optional)
- Address (optional)

If required information is missing, users are prompted to complete it before generating purchase orders.

### 5. Purchase Order Tracking

The system tracks:
- When purchase orders are generated
- When emails are sent (`sent_at` timestamp)
- Purchase order status (draft, sent, confirmed, received)

## Components

### EmailTemplateService

**Location**: `src/lib/services/email-template-service.ts`

Main service for email template generation and validation.

**Key Methods:**
- `generatePurchaseOrderEmail()` - Creates email template from PO data
- `generateMailtoLink()` - Creates mailto: URL for one-click sending
- `validateSupplierForEmail()` - Checks supplier has required contact info
- `generateEmailPreviewHTML()` - Creates HTML preview for UI display

### EmailPreviewDialog

**Location**: `src/components/purchase-orders/EmailPreviewDialog.tsx`

React component that displays email preview and handles sending.

**Features:**
- Loads email template via API
- Shows formatted preview
- Opens email client on send
- Tracks sent status
- Provides copy-to-clipboard functionality

### SupplierContactForm

**Location**: `src/components/suppliers/SupplierContactForm.tsx`

Form component for updating supplier contact information.

**Features:**
- Validates required fields
- Shows missing field warnings
- Updates supplier information via API
- Provides success feedback

## API Endpoints

### GET /api/purchase-orders/[id]/email

Retrieves email template and mailto link for a purchase order.

**Response:**
```json
{
  "success": true,
  "data": {
    "email": {
      "subject": "Purchase Order PO-20240101-001",
      "body": "...",
      "to": "supplier@example.com"
    },
    "mailto_link": "mailto:supplier@example.com?subject=...",
    "preview_html": "<div>...</div>",
    "supplier": {
      "id": "supplier-1",
      "name": "Test Supplier",
      "email": "supplier@example.com"
    }
  }
}
```

### POST /api/purchase-orders/[id]/email

Marks a purchase order as sent and updates the `sent_at` timestamp.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "po-1",
    "status": "sent",
    "sent_at": "2024-01-01T10:00:00Z"
  },
  "message": "Purchase order marked as sent"
}
```

### PATCH /api/suppliers/[id]

Updates supplier contact information.

**Request Body:**
```json
{
  "contact_email": "supplier@example.com",
  "contact_phone": "+1 (555) 123-4567",
  "address": "123 Main St, City, State 12345"
}
```

## User Flow

1. **Generate Purchase Order**
   - User selects items from reorder list
   - Clicks "Generate PO & Email"
   - System validates supplier has contact information
   - If missing, prompts user to add it

2. **Review Email**
   - Email preview dialog opens automatically
   - User reviews recipient, subject, and body
   - User can copy text or modify if needed

3. **Send Email**
   - User clicks "Send Email"
   - Default email client opens with pre-filled content
   - User attaches PDF and sends
   - System marks PO as sent

4. **Track Status**
   - Purchase order status updates to "sent"
   - `sent_at` timestamp recorded
   - User can view sent orders in dashboard

## Database Schema

### purchase_orders table

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  supplier_id UUID REFERENCES suppliers(id),
  po_number TEXT NOT NULL,
  total_amount DECIMAL(10,2),
  status TEXT DEFAULT 'draft',
  email_draft TEXT,              -- Stores generated email body
  generated_at TIMESTAMP,
  sent_at TIMESTAMP,              -- Tracks when email was sent
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Testing

Comprehensive test suite in `src/test/email-integration.test.ts` covers:

- Email template generation with various options
- Mailto link generation and encoding
- Supplier validation logic
- HTML preview generation
- Email formatting and currency display
- Edge cases (long names, missing data)

**Run tests:**
```bash
npm test -- email-integration.test.ts --run
```

## Configuration

No additional configuration required. The feature uses:
- User's default email client (via mailto: protocol)
- Existing Supabase database
- Standard Next.js API routes

## Limitations

1. **Email Client Required**: Users must have a default email client configured
2. **Manual PDF Attachment**: Users must manually attach the PDF (cannot be automated via mailto:)
3. **Send Tracking**: System tracks when email client is opened, not actual delivery
4. **No Email History**: System doesn't store sent email content (only draft template)

## Future Enhancements

Potential improvements for future versions:

1. **Direct Email Sending**: Integrate with email service (SendGrid, AWS SES) for automated sending
2. **Email Templates**: Allow customization of email templates per supplier
3. **Attachment Automation**: Automatically attach PDF when using email service
4. **Delivery Tracking**: Track email delivery and open rates
5. **Email History**: Store complete sent email history
6. **Bulk Emailing**: Send multiple POs to different suppliers at once
7. **Email Scheduling**: Schedule emails to be sent at specific times

## Support

For issues or questions about email integration:
1. Check supplier has valid email address
2. Verify default email client is configured
3. Review browser console for errors
4. Check API endpoint responses in Network tab
