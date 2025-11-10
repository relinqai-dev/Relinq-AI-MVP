# User Guide: Connecting Your POS System

## Overview

This guide will help you connect your Point of Sale (POS) system to Smart Inventory Forecasting to automatically sync your sales and inventory data. We support Square, Clover, and manual CSV uploads.

## Getting Started

After signing up and logging in, you'll be guided through an onboarding wizard that helps you connect your POS system. You can also access this setup later from Settings > POS Connection.

## Supported POS Systems

### Square POS
- **Best for**: Retail stores, restaurants, service businesses
- **Data synced**: Inventory items, sales history, product categories
- **Sync frequency**: Real-time or scheduled (hourly/daily)

### Clover POS
- **Best for**: Restaurants, retail stores, quick-service businesses
- **Data synced**: Inventory items, order history, modifiers
- **Sync frequency**: Real-time or scheduled (hourly/daily)

### Manual CSV Upload
- **Best for**: Any POS system not directly supported
- **Data synced**: Sales data, inventory levels (based on your CSV format)
- **Sync frequency**: Manual upload as needed

---

## Connecting Square POS

### Prerequisites
- Active Square account with admin access
- Square location ID (found in Square Dashboard > Settings > Business > Locations)
- At least 14 days of sales history for accurate forecasting

### Step-by-Step Instructions

#### 1. Start the Connection Wizard
1. Log in to Smart Inventory Forecasting
2. Click **"Connect POS System"** on the onboarding screen
3. Select **"Square"** from the list of POS systems

#### 2. Authorize Square Access
1. Click **"Connect to Square"**
2. You'll be redirected to Square's authorization page
3. Log in to your Square account if prompted
4. Review the permissions requested:
   - Read inventory items
   - Read sales and order history
   - Read product catalog
5. Click **"Allow"** to grant access

#### 3. Select Location
1. If you have multiple Square locations, select which one to sync
2. Click **"Continue"**

#### 4. Configure Sync Settings
1. Choose sync frequency:
   - **Real-time**: Updates immediately when sales occur (recommended)
   - **Hourly**: Syncs every hour
   - **Daily**: Syncs once per day at midnight
2. Select historical data range:
   - **Last 30 days** (recommended for new users)
   - **Last 90 days**
   - **Last 6 months**
   - **All available data**
3. Click **"Start Sync"**

#### 5. Initial Sync
1. The system will begin importing your data
2. This may take 5-15 minutes depending on data volume
3. You'll see a progress indicator showing:
   - Inventory items imported
   - Sales records imported
   - Data quality checks completed
4. Once complete, click **"Continue to Dashboard"**

### What Gets Synced from Square

**Inventory Items:**
- Item name and SKU
- Current stock quantity
- Item category
- Unit cost and price
- Variations (size, color, etc.)

**Sales Data:**
- Date and time of sale
- Items sold and quantities
- Sale price
- Payment method
- Location

**Not Synced:**
- Customer personal information
- Employee data
- Payment card details

### Troubleshooting Square Connection

**"Authorization Failed" Error**
- Ensure you're logged in as a Square admin
- Check that your Square account is active
- Try clearing browser cookies and reconnecting

**"No Data Found" Error**
- Verify your Square location has inventory items
- Ensure you have sales history in the selected date range
- Check that items have SKUs assigned in Square

**Sync Taking Too Long**
- Large catalogs (1000+ items) may take 15-30 minutes
- Check your internet connection
- If sync fails, it will automatically retry

---

## Connecting Clover POS

### Prerequisites
- Active Clover account with admin access
- Clover Merchant ID (found in Clover Dashboard > Setup > Business Information)
- At least 14 days of sales history for accurate forecasting

### Step-by-Step Instructions

#### 1. Start the Connection Wizard
1. Log in to Smart Inventory Forecasting
2. Click **"Connect POS System"** on the onboarding screen
3. Select **"Clover"** from the list of POS systems

#### 2. Authorize Clover Access
1. Click **"Connect to Clover"**
2. You'll be redirected to Clover's authorization page
3. Log in to your Clover account if prompted
4. Review the permissions requested:
   - Read inventory
   - Read orders
   - Read items
5. Click **"Allow"** to grant access

#### 3. Select Merchant
1. If you have multiple Clover merchants, select which one to sync
2. Click **"Continue"**

#### 4. Configure Sync Settings
1. Choose sync frequency:
   - **Real-time**: Updates immediately (recommended)
   - **Hourly**: Syncs every hour
   - **Daily**: Syncs once per day
2. Select historical data range:
   - **Last 30 days** (recommended)
   - **Last 90 days**
   - **Last 6 months**
3. Click **"Start Sync"**

#### 5. Initial Sync
1. The system will import your data
2. Progress will be displayed on screen
3. Once complete, click **"Continue to Dashboard"**

### What Gets Synced from Clover

**Inventory Items:**
- Item name and SKU
- Current stock quantity
- Item category
- Unit cost and price
- Modifiers and variations

**Sales Data:**
- Order date and time
- Items ordered and quantities
- Order total
- Order type (dine-in, takeout, etc.)

### Troubleshooting Clover Connection

**"Invalid Merchant ID" Error**
- Verify your Merchant ID in Clover Dashboard
- Ensure you have admin permissions
- Contact Clover support if issue persists

**"API Rate Limit Exceeded" Error**
- Clover limits API requests per hour
- Wait 15 minutes and try again
- Consider using daily sync instead of real-time

---

## Manual CSV Upload

If your POS system isn't directly supported, you can manually upload sales and inventory data via CSV files.

### CSV File Requirements

#### Sales Data CSV Format

Your CSV file should include these columns (in any order):

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| `date` or `sale_date` | Yes | Date of sale | 2024-01-15 |
| `sku` | Yes | Product SKU/ID | SKU-001 |
| `item_name` or `product_name` | Yes | Product name | Widget A |
| `quantity` or `quantity_sold` | Yes | Quantity sold | 5 |
| `unit_price` or `price` | No | Sale price per unit | 25.50 |
| `total` or `sale_total` | No | Total sale amount | 127.50 |

**Example CSV:**
```csv
date,sku,item_name,quantity_sold,unit_price
2024-01-15,SKU-001,Widget A,5,25.50
2024-01-15,SKU-002,Widget B,3,50.00
2024-01-16,SKU-001,Widget A,8,25.50
```

#### Inventory Data CSV Format

| Column Name | Required | Description | Example |
|------------|----------|-------------|---------|
| `sku` | Yes | Product SKU/ID | SKU-001 |
| `name` or `item_name` | Yes | Product name | Widget A |
| `current_stock` or `quantity` | Yes | Current stock level | 45 |
| `unit_cost` or `cost` | No | Cost per unit | 15.00 |
| `supplier` or `supplier_name` | No | Supplier name | Acme Corp |
| `lead_time_days` | No | Supplier lead time | 7 |

**Example CSV:**
```csv
sku,name,current_stock,unit_cost,supplier,lead_time_days
SKU-001,Widget A,45,15.00,Acme Corp,7
SKU-002,Widget B,23,30.00,Beta Supplies,14
```

### Step-by-Step CSV Upload

#### 1. Prepare Your CSV File
1. Export sales data from your POS system
2. Ensure the file includes required columns
3. Save as `.csv` format (not Excel `.xlsx`)
4. Verify dates are in YYYY-MM-DD format

#### 2. Upload Sales Data
1. Go to **Dashboard > Import Data**
2. Click **"Upload CSV"**
3. Select **"Sales Data"** as the file type
4. Drag and drop your CSV file or click to browse
5. Click **"Upload"**

#### 3. Map CSV Columns
1. The system will display your CSV columns
2. Map each column to the corresponding field:
   - Match "date" column to "Sale Date"
   - Match "sku" column to "SKU"
   - Match "item_name" to "Product Name"
   - Match "quantity_sold" to "Quantity"
3. Preview shows first 5 rows to verify mapping
4. Click **"Confirm Mapping"**

#### 4. Validate and Import
1. System validates your data:
   - Checks for missing required fields
   - Verifies date formats
   - Identifies duplicate entries
2. Review any warnings or errors
3. Click **"Import Data"** to proceed
4. Wait for import to complete (usually 1-2 minutes)

#### 5. Upload Inventory Data (Optional)
1. Repeat steps 2-4 for inventory CSV
2. Select **"Inventory Data"** as file type
3. Map inventory columns
4. Import data

### Download CSV Template

To make CSV uploads easier, download our pre-formatted templates:

1. Go to **Dashboard > Import Data**
2. Click **"Download Template"**
3. Choose:
   - **Sales Data Template**
   - **Inventory Data Template**
4. Fill in your data using the template format
5. Upload the completed file

### CSV Upload Best Practices

✅ **Do:**
- Use consistent date formats (YYYY-MM-DD)
- Include at least 14 days of sales history
- Remove any header rows except column names
- Use UTF-8 encoding for special characters
- Keep SKUs consistent across uploads

❌ **Don't:**
- Include formulas or formatting
- Use merged cells
- Include summary rows or totals
- Mix different date formats
- Leave required fields empty

### Troubleshooting CSV Upload

**"Invalid CSV Format" Error**
- Ensure file is saved as `.csv` not `.xlsx`
- Check that file has column headers
- Verify no special characters in column names

**"Missing Required Columns" Error**
- Verify your CSV includes: date, sku, item_name, quantity
- Check column names match expected format
- Use the CSV mapping interface to manually map columns

**"Date Format Error"**
- Use YYYY-MM-DD format (e.g., 2024-01-15)
- Avoid formats like MM/DD/YYYY or DD-MM-YYYY
- Remove any time components if present

**"Duplicate SKU" Warning**
- Review items with same SKU but different names
- Standardize SKUs in your POS system
- Use data cleanup tools to merge duplicates

---

## Managing Your POS Connection

### View Connection Status

1. Go to **Settings > POS Connection**
2. View current status:
   - ✅ **Connected**: Actively syncing
   - ⚠️ **Warning**: Sync issues detected
   - ❌ **Disconnected**: Connection lost
3. See last sync time and next scheduled sync

### Pause Syncing

1. Go to **Settings > POS Connection**
2. Click **"Pause Sync"**
3. Syncing will stop until you resume
4. Useful during inventory counts or system maintenance

### Reconnect POS System

If your connection is lost:

1. Go to **Settings > POS Connection**
2. Click **"Reconnect"**
3. Re-authorize access if prompted
4. Sync will resume automatically

### Disconnect POS System

To remove POS connection:

1. Go to **Settings > POS Connection**
2. Click **"Disconnect"**
3. Confirm disconnection
4. Your existing data will be preserved
5. You can reconnect or switch to CSV upload

### Change Sync Frequency

1. Go to **Settings > POS Connection**
2. Click **"Sync Settings"**
3. Select new frequency:
   - Real-time
   - Hourly
   - Daily
4. Click **"Save Changes"**

---

## Data Privacy and Security

### What We Access
- Inventory item names, SKUs, and quantities
- Sales transaction data (dates, quantities, amounts)
- Product categories and pricing

### What We Don't Access
- Customer personal information
- Payment card details
- Employee personal data
- Financial account information

### Security Measures
- All data encrypted in transit (TLS 1.3)
- Data encrypted at rest (AES-256)
- OAuth 2.0 authentication
- Regular security audits
- GDPR and CCPA compliant

### Revoking Access

You can revoke access at any time:

**For Square:**
1. Log in to Square Dashboard
2. Go to Apps > My Apps
3. Find "Smart Inventory Forecasting"
4. Click "Revoke Access"

**For Clover:**
1. Log in to Clover Dashboard
2. Go to Setup > Apps
3. Find "Smart Inventory Forecasting"
4. Click "Uninstall"

---

## Next Steps

After connecting your POS system:

1. **Review Data Quality**: Check the Data Cleanup dashboard for any issues
2. **Resolve Duplicates**: Merge any duplicate items found
3. **Add Supplier Information**: Assign suppliers to your products
4. **Generate Forecasts**: Once data is clean, forecasts will be generated automatically
5. **Review Recommendations**: Check your daily to-do list for reorder suggestions

---

## Need Help?

- **In-app Help**: Click the ? icon in the top right corner
- **Troubleshooting Guide**: See [Troubleshooting Common Issues](./troubleshooting-guide.md)
- **Video Tutorials**: Available in the Help Center
- **Support**: Contact support@smartinventory.com

---

**Last Updated**: November 2024  
**Version**: 1.0
