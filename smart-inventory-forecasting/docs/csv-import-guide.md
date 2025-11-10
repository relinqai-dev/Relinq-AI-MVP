# CSV Import Guide

## Overview

This guide provides detailed instructions for importing your sales and inventory data using CSV files. This is the best option if your POS system isn't directly supported or if you prefer manual data uploads.

## Quick Start

1. Download our CSV template
2. Fill in your data
3. Upload the file
4. Map columns (if needed)
5. Import and verify

---

## CSV Templates

### Download Templates

We provide pre-formatted templates to make importing easier:

**Sales Data Template**: [Download](../public/templates/sales-data-template.csv)
- Includes all required columns
- Example data for reference
- Ready to fill and upload

**Inventory Data Template**: [Download](../public/templates/inventory-data-template.csv)
- Includes all required columns
- Example data for reference
- Ready to fill and upload

### How to Access Templates

1. Log in to Smart Inventory Forecasting
2. Go to **Dashboard > Import Data**
3. Click **"Download CSV Template"**
4. Select the template type you need
5. Save to your computer

---

## Sales Data CSV Format

### Required Columns

Your sales data CSV **must** include these columns:

| Column | Description | Format | Example |
|--------|-------------|--------|---------|
| **date** | Date of sale | YYYY-MM-DD | 2024-01-15 |
| **sku** | Product SKU or ID | Text | SKU-001 |
| **item_name** | Product name | Text | Widget A |
| **quantity** | Quantity sold | Number | 5 |

### Optional Columns

These columns are optional but recommended:

| Column | Description | Format | Example |
|--------|-------------|--------|---------|
| **unit_price** | Price per unit | Number | 25.50 |
| **total** | Total sale amount | Number | 127.50 |
| **category** | Product category | Text | Electronics |
| **location** | Store location | Text | Main Store |

### Column Name Variations

The system recognizes these alternative column names:

- **Date**: `date`, `sale_date`, `transaction_date`, `order_date`
- **SKU**: `sku`, `product_id`, `item_id`, `product_code`
- **Item Name**: `item_name`, `product_name`, `name`, `item`
- **Quantity**: `quantity`, `quantity_sold`, `qty`, `units_sold`
- **Unit Price**: `unit_price`, `price`, `item_price`, `unit_cost`
- **Total**: `total`, `sale_total`, `amount`, `total_amount`

### Example Sales Data CSV

```csv
date,sku,item_name,quantity,unit_price,total
2024-01-15,SKU-001,Widget A,5,25.50,127.50
2024-01-15,SKU-002,Widget B,3,50.00,150.00
2024-01-15,SKU-003,Gadget X,2,75.00,150.00
2024-01-16,SKU-001,Widget A,8,25.50,204.00
2024-01-16,SKU-002,Widget B,1,50.00,50.00
2024-01-17,SKU-001,Widget A,6,25.50,153.00
2024-01-17,SKU-003,Gadget X,4,75.00,300.00
```

### Sales Data Best Practices

✅ **Do:**
- Include at least 14 days of sales history (30+ days recommended)
- Use consistent SKUs across all rows
- Keep item names consistent for the same SKU
- Use YYYY-MM-DD date format
- Include one row per item per transaction

❌ **Don't:**
- Include summary rows or totals
- Mix different date formats
- Leave required fields empty
- Include formulas or Excel formatting
- Use special characters in SKUs

---

## Inventory Data CSV Format

### Required Columns

Your inventory data CSV **must** include these columns:

| Column | Description | Format | Example |
|--------|-------------|--------|---------|
| **sku** | Product SKU or ID | Text | SKU-001 |
| **name** | Product name | Text | Widget A |
| **current_stock** | Current quantity in stock | Number | 45 |

### Optional Columns

These columns are optional but highly recommended:

| Column | Description | Format | Example |
|--------|-------------|--------|---------|
| **unit_cost** | Cost per unit | Number | 15.00 |
| **unit_price** | Selling price per unit | Number | 25.50 |
| **supplier** | Supplier name | Text | Acme Corp |
| **supplier_email** | Supplier email | Email | orders@acme.com |
| **lead_time_days** | Supplier lead time | Number | 7 |
| **reorder_point** | Reorder threshold | Number | 10 |
| **category** | Product category | Text | Electronics |

### Column Name Variations

The system recognizes these alternative column names:

- **SKU**: `sku`, `product_id`, `item_id`, `product_code`
- **Name**: `name`, `item_name`, `product_name`, `item`
- **Current Stock**: `current_stock`, `quantity`, `qty`, `stock_level`, `on_hand`
- **Unit Cost**: `unit_cost`, `cost`, `item_cost`, `purchase_price`
- **Supplier**: `supplier`, `supplier_name`, `vendor`, `vendor_name`
- **Lead Time**: `lead_time_days`, `lead_time`, `delivery_days`

### Example Inventory Data CSV

```csv
sku,name,current_stock,unit_cost,unit_price,supplier,supplier_email,lead_time_days,category
SKU-001,Widget A,45,15.00,25.50,Acme Corp,orders@acme.com,7,Widgets
SKU-002,Widget B,23,30.00,50.00,Beta Supplies,sales@beta.com,14,Widgets
SKU-003,Gadget X,12,45.00,75.00,Acme Corp,orders@acme.com,7,Gadgets
SKU-004,Tool Y,67,8.00,15.00,Tool Co,info@toolco.com,5,Tools
SKU-005,Part Z,89,2.50,5.00,Parts Plus,orders@partsplus.com,10,Parts
```

### Inventory Data Best Practices

✅ **Do:**
- Include all active products
- Keep SKUs consistent with sales data
- Include supplier information for better forecasting
- Update inventory regularly (weekly recommended)
- Include accurate unit costs

❌ **Don't:**
- Include discontinued products
- Use different SKUs than in sales data
- Leave current_stock empty
- Include negative stock quantities
- Mix different units of measure

---

## Step-by-Step Import Process

### Step 1: Prepare Your CSV File

#### Export from Your POS System

Most POS systems can export data to CSV:

**Square:**
1. Go to Reports > Sales Summary
2. Select date range
3. Click Export > CSV

**Clover:**
1. Go to Orders > Order History
2. Select date range
3. Click Export

**Shopify:**
1. Go to Products or Orders
2. Click Export
3. Select CSV format

**Generic POS:**
1. Look for "Export" or "Reports" section
2. Choose CSV or Excel format
3. Select the data you need

#### Clean Your Data

Before uploading:

1. **Remove extra rows**: Delete any header rows, footer rows, or summary rows
2. **Check dates**: Ensure all dates use YYYY-MM-DD format
3. **Verify SKUs**: Make sure SKUs are consistent
4. **Remove formulas**: Copy and paste values only
5. **Save as CSV**: File > Save As > CSV (Comma delimited)

### Step 2: Upload Your File

1. Log in to Smart Inventory Forecasting
2. Go to **Dashboard > Import Data**
3. Click **"Upload CSV"**
4. Select file type:
   - **Sales Data**: Historical sales transactions
   - **Inventory Data**: Current stock levels
5. Drag and drop your CSV file, or click **"Browse"** to select it
6. Click **"Upload"**

### Step 3: Map Columns

If your CSV columns don't match our standard format, you'll see the mapping interface:

1. **Review detected columns**: System shows your CSV column names
2. **Map each column**: 
   - Click dropdown next to each column
   - Select the matching field
   - Example: Map "product_id" to "SKU"
3. **Preview data**: Check first 5 rows to verify mapping
4. **Mark optional columns**: Select "Skip" for columns you don't need
5. Click **"Confirm Mapping"**

#### Mapping Example

Your CSV has these columns:
```
product_code, description, qty_sold, sale_date, price
```

Map them like this:
- `product_code` → **SKU**
- `description` → **Item Name**
- `qty_sold` → **Quantity**
- `sale_date` → **Date**
- `price` → **Unit Price**

### Step 4: Validate Data

The system automatically validates your data:

#### Validation Checks

✅ **Required Fields**: All required columns have data  
✅ **Date Format**: Dates are in correct format  
✅ **Number Format**: Quantities and prices are valid numbers  
✅ **Duplicate Detection**: Identifies potential duplicate entries  
✅ **SKU Consistency**: Checks for SKU variations  

#### Review Warnings

You may see warnings like:

⚠️ **"5 rows have missing unit prices"**
- Action: Optional field, can proceed
- Fix: Add prices if available

⚠️ **"3 items have inconsistent names for same SKU"**
- Action: Review and standardize
- Fix: Use data cleanup tools after import

⚠️ **"Date range is only 7 days"**
- Action: Can proceed but forecasting may be limited
- Fix: Upload more historical data (14+ days recommended)

#### Review Errors

Errors must be fixed before importing:

❌ **"Missing required column: SKU"**
- Fix: Go back and map the SKU column

❌ **"Invalid date format in row 15"**
- Fix: Correct the date format in your CSV

❌ **"Negative quantity in row 23"**
- Fix: Remove or correct the negative value

### Step 5: Import Data

1. Review the validation summary
2. Click **"Import Data"**
3. Wait for import to complete:
   - Small files (< 1000 rows): 10-30 seconds
   - Medium files (1000-5000 rows): 1-2 minutes
   - Large files (5000+ rows): 2-5 minutes
4. See import summary:
   - Total rows processed
   - Successful imports
   - Skipped rows
   - Errors encountered

### Step 6: Verify Import

After import completes:

1. **Check Dashboard**: View imported items count
2. **Review Data Quality**: Go to Data Cleanup dashboard
3. **Verify Dates**: Ensure date range is correct
4. **Check SKUs**: Verify all products imported
5. **Test Forecasting**: Generate a test forecast

---

## Advanced CSV Features

### Handling Large Files

For files with 10,000+ rows:

1. **Split into smaller files**: Upload in batches of 5,000 rows
2. **Use date ranges**: Upload one month at a time
3. **Remove old data**: Only include last 6 months
4. **Compress file**: ZIP before uploading (system will extract)

### Updating Existing Data

To update previously imported data:

1. Upload new CSV with same SKUs
2. System will:
   - Add new sales records
   - Update inventory quantities
   - Merge supplier information
3. Existing data is preserved
4. Duplicates are automatically detected

### Bulk Operations

Import multiple files at once:

1. Prepare multiple CSV files
2. Upload them one after another
3. System queues imports
4. All files process in order
5. Receive summary when complete

### Scheduled Imports

Set up automatic imports:

1. Go to **Settings > Import Schedule**
2. Click **"Add Scheduled Import"**
3. Configure:
   - File source (FTP, Dropbox, Google Drive)
   - Schedule (daily, weekly)
   - File format and mapping
4. System imports automatically

---

## Common CSV Issues and Solutions

### Issue: "File Too Large"

**Problem**: CSV file exceeds 50MB  
**Solution**:
- Split file into smaller chunks
- Remove unnecessary columns
- Compress file to ZIP format
- Upload historical data in batches

### Issue: "Invalid Character Encoding"

**Problem**: Special characters display incorrectly  
**Solution**:
- Save CSV with UTF-8 encoding
- In Excel: Save As > CSV UTF-8
- Remove special characters if possible
- Use plain text editor to verify encoding

### Issue: "Date Not Recognized"

**Problem**: Dates in wrong format  
**Solution**:
- Use YYYY-MM-DD format (e.g., 2024-01-15)
- In Excel: Format cells as Text before entering dates
- Use Find & Replace to fix date formats
- Download our template for correct format

### Issue: "Duplicate SKUs with Different Names"

**Problem**: Same SKU has multiple product names  
**Solution**:
- Standardize product names in your source data
- Use data cleanup tools after import
- Choose one canonical name per SKU
- Update your POS system to be consistent

### Issue: "Missing Required Columns"

**Problem**: CSV doesn't have required fields  
**Solution**:
- Add missing columns to your CSV
- Use column mapping to match your format
- Download our template for reference
- Export different report from your POS

### Issue: "Import Stuck or Slow"

**Problem**: Import taking too long  
**Solution**:
- Check internet connection
- Reduce file size
- Try uploading during off-peak hours
- Contact support if issue persists

---

## CSV Format Reference

### Date Formats

✅ **Accepted**:
- `2024-01-15` (YYYY-MM-DD) - Recommended
- `2024/01/15` (YYYY/MM/DD)
- `01-15-2024` (MM-DD-YYYY)
- `15-01-2024` (DD-MM-YYYY)

❌ **Not Accepted**:
- `Jan 15, 2024` (text dates)
- `1/15/24` (ambiguous)
- `15.1.2024` (dot separator)

### Number Formats

✅ **Accepted**:
- `25.50` (decimal)
- `25` (integer)
- `1,250.00` (with comma separator)

❌ **Not Accepted**:
- `$25.50` (currency symbols)
- `25,50` (comma as decimal)
- `25.50.00` (multiple decimals)

### Text Formats

✅ **Accepted**:
- `Widget A` (alphanumeric)
- `SKU-001` (with hyphens)
- `Product_Name` (with underscores)

❌ **Not Accepted**:
- `"Widget A"` (with quotes)
- `Widget A;` (with semicolons)
- `Widget A\n` (with line breaks)

---

## Tips for Success

### Before Uploading

1. **Test with small file first**: Upload 10-20 rows to test format
2. **Backup your data**: Keep original file safe
3. **Document your mapping**: Note which columns map to which fields
4. **Check for errors**: Review data in spreadsheet first

### During Upload

1. **Don't close browser**: Keep tab open during import
2. **Check progress**: Monitor import status
3. **Note any warnings**: Review validation messages
4. **Wait for confirmation**: Don't upload again if it seems slow

### After Upload

1. **Verify data**: Check dashboard for imported items
2. **Run data cleanup**: Resolve any quality issues
3. **Generate forecast**: Test that forecasting works
4. **Schedule next import**: Set reminder for next upload

---

## Need Help?

### Resources

- **Video Tutorial**: [Watch CSV Import Guide](link-to-video)
- **Template Files**: Download from Dashboard > Import Data
- **Troubleshooting**: See [Troubleshooting Guide](./troubleshooting-guide.md)
- **Support**: Email support@smartinventory.com

### Common Questions

**Q: How often should I upload CSV files?**  
A: Weekly is recommended for accurate forecasting. Daily is better for fast-moving inventory.

**Q: Can I upload multiple stores' data?**  
A: Yes, include a "location" column to separate stores.

**Q: What if my POS exports Excel files?**  
A: Open in Excel and Save As > CSV (Comma delimited).

**Q: How far back should my sales history go?**  
A: Minimum 14 days, but 30-90 days is recommended for better forecasts.

**Q: Can I automate CSV uploads?**  
A: Yes, set up scheduled imports in Settings > Import Schedule.

---

**Last Updated**: November 2024  
**Version**: 1.0
