# Troubleshooting Guide

## Overview

This guide helps you resolve common issues you may encounter while using Smart Inventory Forecasting. Issues are organized by feature area for easy navigation.

---

## Table of Contents

1. [Login and Authentication Issues](#login-and-authentication-issues)
2. [POS Connection Problems](#pos-connection-problems)
3. [CSV Import Errors](#csv-import-errors)
4. [Data Cleanup Issues](#data-cleanup-issues)
5. [Forecasting Problems](#forecasting-problems)
6. [Purchase Order Generation](#purchase-order-generation)
7. [Email Integration Issues](#email-integration-issues)
8. [Performance and Loading](#performance-and-loading)
9. [Mobile and Responsive Issues](#mobile-and-responsive-issues)
10. [General Errors](#general-errors)

---

## Login and Authentication Issues

### Cannot Log In - "Invalid Credentials"

**Symptoms**: Error message when entering email and password

**Solutions**:
1. **Verify email address**: Check for typos or extra spaces
2. **Check password**: Ensure Caps Lock is off
3. **Reset password**:
   - Click "Forgot Password" on login page
   - Enter your email address
   - Check email for reset link (check spam folder)
   - Create new password
4. **Clear browser cache**: Try clearing cookies and cache
5. **Try different browser**: Test in Chrome, Firefox, or Safari

### "Session Expired" Message

**Symptoms**: Logged out unexpectedly, session expired error

**Solutions**:
1. **Log in again**: Sessions expire after 24 hours of inactivity
2. **Enable "Remember Me"**: Check box on login page
3. **Check browser settings**: Ensure cookies are enabled
4. **Disable private browsing**: Use normal browser mode
5. **Update browser**: Ensure you're using latest version

### Email Verification Not Received

**Symptoms**: No verification email after signup

**Solutions**:
1. **Check spam folder**: Email may be filtered
2. **Wait 5-10 minutes**: Delivery can be delayed
3. **Verify email address**: Ensure you entered correct email
4. **Resend verification**:
   - Go to login page
   - Click "Resend Verification Email"
   - Enter your email address
5. **Add to safe senders**: Add noreply@smartinventory.com to contacts
6. **Contact support**: If still not received after 30 minutes

### Two-Factor Authentication Issues

**Symptoms**: Cannot complete 2FA verification

**Solutions**:
1. **Check authenticator app**: Ensure time is synced
2. **Use backup codes**: Enter one of your saved backup codes
3. **Regenerate codes**:
   - Contact support to disable 2FA temporarily
   - Log in and regenerate codes
4. **Try SMS option**: Use phone verification if available

---

## POS Connection Problems

### Square Connection Failed

**Symptoms**: "Authorization Failed" or "Connection Error" when connecting Square

**Solutions**:
1. **Verify Square account**:
   - Ensure you're logged in as account owner or admin
   - Check that Square account is active
2. **Clear authorization**:
   - Go to Square Dashboard > Apps > My Apps
   - Remove "Smart Inventory Forecasting" if listed
   - Try connecting again
3. **Check permissions**:
   - Ensure your Square role has API access
   - Contact Square account owner if needed
4. **Browser issues**:
   - Disable popup blockers
   - Allow redirects from smartinventory.com
   - Try different browser
5. **Network issues**:
   - Check internet connection
   - Disable VPN temporarily
   - Try from different network

### Clover Connection Failed

**Symptoms**: "Invalid Merchant ID" or "Authorization Failed" with Clover

**Solutions**:
1. **Verify Merchant ID**:
   - Log in to Clover Dashboard
   - Go to Setup > Business Information
   - Copy exact Merchant ID
2. **Check permissions**:
   - Ensure you have admin access
   - Verify account is active
3. **Clear previous authorization**:
   - Go to Clover Dashboard > Apps
   - Uninstall "Smart Inventory Forecasting" if present
   - Reconnect from our app
4. **API rate limits**:
   - If "Rate Limit Exceeded" error, wait 15 minutes
   - Try again during off-peak hours
5. **Contact Clover support**: For persistent issues

### POS Data Not Syncing

**Symptoms**: No new data appearing, last sync time not updating

**Solutions**:
1. **Check connection status**:
   - Go to Settings > POS Connection
   - Verify status shows "Connected"
2. **Verify sync schedule**:
   - Check sync frequency setting
   - Ensure sync is not paused
3. **Manual sync**:
   - Click "Sync Now" button
   - Wait 2-5 minutes for completion
4. **Check POS system**:
   - Verify you have new sales in POS
   - Ensure items have SKUs assigned
5. **Reconnect POS**:
   - Click "Disconnect"
   - Wait 30 seconds
   - Click "Reconnect"
6. **Review error logs**:
   - Go to Settings > Sync History
   - Check for error messages
   - Contact support with error details

### Missing Items After Sync

**Symptoms**: Some products not appearing after POS sync

**Solutions**:
1. **Check SKU assignment**:
   - Verify items have SKUs in POS system
   - Items without SKUs won't sync
2. **Check item status**:
   - Ensure items are active (not archived)
   - Verify items are in selected location
3. **Check sync filters**:
   - Go to Settings > Sync Settings
   - Verify no category filters are excluding items
4. **Manual refresh**:
   - Click "Sync Now" to force refresh
   - Check if items appear
5. **Review sync log**:
   - Go to Settings > Sync History
   - Look for skipped items
   - Note reasons for skipping

---

## CSV Import Errors

### "Invalid CSV Format" Error

**Symptoms**: Upload rejected with format error

**Solutions**:
1. **Verify file type**:
   - Ensure file extension is `.csv`
   - Not `.xlsx`, `.xls`, or `.txt`
2. **Check file structure**:
   - First row should be column headers
   - No blank rows at top
   - No merged cells
3. **Save as CSV**:
   - Open in Excel or Google Sheets
   - File > Save As > CSV (Comma delimited)
4. **Check encoding**:
   - Save with UTF-8 encoding
   - Remove special characters if needed
5. **Use template**:
   - Download our CSV template
   - Copy your data into template
   - Upload template file

### "Missing Required Columns" Error

**Symptoms**: Import fails due to missing fields

**Solutions**:
1. **Check required columns**:
   - Sales data needs: date, sku, item_name, quantity
   - Inventory data needs: sku, name, current_stock
2. **Use column mapping**:
   - System will show mapping interface
   - Map your columns to required fields
3. **Add missing columns**:
   - Edit CSV to add required columns
   - Fill with appropriate data
4. **Download template**:
   - Use our template for correct format
   - Copy your data into template

### "Date Format Error"

**Symptoms**: Dates not recognized or invalid date error

**Solutions**:
1. **Use correct format**:
   - Required: YYYY-MM-DD (e.g., 2024-01-15)
   - Not: MM/DD/YYYY or DD-MM-YYYY
2. **Fix in Excel**:
   - Select date column
   - Format Cells > Custom
   - Enter: `yyyy-mm-dd`
3. **Find and replace**:
   - Use Find & Replace to fix format
   - Example: Replace `/` with `-`
4. **Format as text**:
   - Format cells as Text before entering dates
   - Prevents Excel auto-formatting

### "Duplicate Entries" Warning

**Symptoms**: Warning about duplicate records

**Solutions**:
1. **Review duplicates**:
   - System shows which rows are duplicates
   - Check if they're truly duplicates
2. **Remove duplicates**:
   - In Excel: Data > Remove Duplicates
   - Select columns to check
3. **Keep duplicates if valid**:
   - Multiple sales of same item on same day is normal
   - Click "Import Anyway" if duplicates are valid
4. **Check source data**:
   - Verify POS export doesn't have duplicates
   - Re-export if needed

### Import Stuck or Slow

**Symptoms**: Import progress bar not moving, taking too long

**Solutions**:
1. **Check file size**:
   - Files over 10,000 rows may take 5-10 minutes
   - Split large files into smaller batches
2. **Check internet connection**:
   - Ensure stable connection
   - Don't close browser during import
3. **Wait patiently**:
   - Large imports can take time
   - Don't refresh page
4. **Try again**:
   - If stuck for 15+ minutes, refresh page
   - Upload file again
5. **Reduce file size**:
   - Remove unnecessary columns
   - Upload smaller date ranges
   - Split into multiple files

---

## Data Cleanup Issues

### Duplicate Items Not Detected

**Symptoms**: Know you have duplicates but system doesn't show them

**Solutions**:
1. **Refresh data cleanup**:
   - Go to Data Cleanup dashboard
   - Click "Scan for Issues"
2. **Check similarity threshold**:
   - Go to Settings > Data Cleanup
   - Adjust similarity threshold (default 80%)
   - Lower threshold finds more potential duplicates
3. **Manual search**:
   - Use search function to find similar names
   - Manually merge if needed
4. **Check SKUs**:
   - Duplicates must have different SKUs
   - Same SKU with different names is data inconsistency

### Cannot Merge Duplicate Items

**Symptoms**: Merge button disabled or merge fails

**Solutions**:
1. **Check selection**:
   - Must select exactly 2 items to merge
   - Select checkboxes next to items
2. **Verify permissions**:
   - Ensure you have edit permissions
   - Contact account owner if needed
3. **Check item status**:
   - Cannot merge items with active orders
   - Wait for orders to complete
4. **Try one at a time**:
   - Merge items individually
   - Don't try to merge multiple pairs at once
5. **Refresh page**:
   - Reload Data Cleanup dashboard
   - Try merge again

### Missing Supplier Information

**Symptoms**: Items show as missing supplier but you've added it

**Solutions**:
1. **Verify supplier assignment**:
   - Go to Inventory > Items
   - Check that supplier is actually assigned
2. **Refresh cleanup scan**:
   - Go to Data Cleanup
   - Click "Rescan Data"
3. **Check supplier details**:
   - Ensure supplier has name and email
   - Incomplete suppliers may show as missing
4. **Bulk assign**:
   - Use bulk actions to assign supplier
   - Select multiple items
   - Choose "Assign Supplier"

### Cleanup Progress Not Updating

**Symptoms**: Resolved issues but progress percentage doesn't change

**Solutions**:
1. **Refresh dashboard**:
   - Click refresh icon
   - Or reload page
2. **Clear resolved issues**:
   - Click "Clear Resolved"
   - Removes completed items from list
3. **Rescan data**:
   - Click "Rescan Data"
   - Recalculates progress
4. **Check browser cache**:
   - Clear cache and reload
   - Try different browser

---

## Forecasting Problems

### "Forecasting Blocked" Message

**Symptoms**: Cannot generate forecasts, blocked by data quality

**Solutions**:
1. **Complete data cleanup**:
   - Go to Data Cleanup dashboard
   - Resolve all high-priority issues
   - Merge duplicates
   - Assign suppliers
2. **Check requirements**:
   - Need at least 14 days of sales history
   - All items must have SKUs
   - No critical data quality issues
3. **Review blockers**:
   - System shows specific blockers
   - Address each one individually
4. **Force forecast** (if urgent):
   - Contact support to override
   - Not recommended for accuracy

### "Insufficient Data" Error

**Symptoms**: Cannot forecast specific items due to lack of data

**Solutions**:
1. **Check sales history**:
   - Item needs 14+ days of sales data
   - Upload more historical data
2. **New items**:
   - New items can't be forecasted yet
   - Wait until 14 days of sales history
   - Use manual reorder point temporarily
3. **Slow-moving items**:
   - Items with few sales may not forecast well
   - Consider manual inventory management
4. **Adjust settings**:
   - Go to Settings > Forecasting
   - Lower minimum data requirement (not recommended)

### Forecasts Seem Inaccurate

**Symptoms**: Forecast quantities don't match expectations

**Solutions**:
1. **Check data quality**:
   - Verify sales data is complete
   - Ensure no missing days
   - Check for data entry errors
2. **Review seasonality**:
   - Forecasts account for trends
   - Recent spike/drop affects predictions
3. **Adjust lead time**:
   - Go to Suppliers
   - Update lead time for each supplier
   - Affects reorder timing
4. **Manual override**:
   - Can manually adjust forecast
   - Click "Edit" on forecast
   - Enter your own quantity
5. **Provide feedback**:
   - Click "Report Issue" on forecast
   - System learns from feedback

### Forecasts Not Generating

**Symptoms**: No forecasts appearing, generation fails

**Solutions**:
1. **Check forecasting service**:
   - Go to Settings > System Status
   - Verify forecasting service is "Up"
2. **Wait for processing**:
   - Forecasts generate every 24 hours
   - Can take 10-30 minutes
3. **Manual generation**:
   - Go to Forecasting dashboard
   - Click "Generate Forecasts Now"
4. **Check data requirements**:
   - Ensure data cleanup is complete
   - Verify sufficient sales history
5. **Review error logs**:
   - Go to Settings > Logs
   - Check for forecasting errors
   - Contact support with error details

---

## Purchase Order Generation

### Cannot Generate Purchase Order

**Symptoms**: "Generate PO" button disabled or fails

**Solutions**:
1. **Check supplier information**:
   - Supplier must have name and email
   - Go to Suppliers > Edit
   - Add missing information
2. **Select items**:
   - Must select at least one item
   - Check boxes next to items to order
3. **Verify quantities**:
   - Ensure order quantities are > 0
   - Adjust quantities if needed
4. **Check permissions**:
   - Ensure you have PO generation permission
   - Contact account admin if needed

### PDF Generation Failed

**Symptoms**: Error when trying to generate PDF

**Solutions**:
1. **Try again**:
   - Click "Generate PDF" again
   - May be temporary service issue
2. **Check browser**:
   - Ensure popups are allowed
   - Try different browser
3. **Reduce PO size**:
   - If PO has 100+ items, split into multiple POs
   - Generate smaller POs
4. **Clear cache**:
   - Clear browser cache
   - Reload page and try again
5. **Download later**:
   - PO is saved even if PDF fails
   - Go to Purchase Orders > History
   - Download PDF from there

### PO Missing Items

**Symptoms**: Generated PO doesn't include all selected items

**Solutions**:
1. **Check selection**:
   - Verify items were checked before generating
   - Look for selection confirmation
2. **Check supplier grouping**:
   - POs are grouped by supplier
   - Items from different suppliers = separate POs
3. **Review PO list**:
   - Go to Purchase Orders
   - Check if multiple POs were created
4. **Check item status**:
   - Ensure items are active
   - Verify items have supplier assigned

### PO Numbers Not Sequential

**Symptoms**: PO numbers skip or are out of order

**Solutions**:
1. **This is normal**:
   - System generates unique PO numbers
   - May not be perfectly sequential
2. **Check all POs**:
   - Go to Purchase Orders > All
   - Sort by PO number
   - Verify no duplicates
3. **Custom numbering**:
   - Go to Settings > Purchase Orders
   - Configure custom PO number format

---

## Email Integration Issues

### Email Client Not Opening

**Symptoms**: Clicking "Send Email" does nothing

**Solutions**:
1. **Check default email client**:
   - Ensure you have email client configured
   - Windows: Settings > Apps > Default Apps > Email
   - Mac: Mail app should be default
2. **Browser settings**:
   - Allow mailto: links in browser
   - Check browser permissions
3. **Use copy option**:
   - Click "Copy Email Text"
   - Manually paste into email client
4. **Try different browser**:
   - Some browsers handle mailto: better
   - Try Chrome, Firefox, or Edge

### Supplier Email Missing

**Symptoms**: Cannot send email, no supplier email address

**Solutions**:
1. **Add supplier email**:
   - Go to Suppliers
   - Click Edit on supplier
   - Add email address
   - Save changes
2. **Verify email format**:
   - Ensure valid email format
   - Example: orders@supplier.com
3. **Update from PO screen**:
   - Click "Update Supplier Info"
   - Add email address
   - Generate email again

### Email Template Not Loading

**Symptoms**: Email preview shows error or blank

**Solutions**:
1. **Refresh page**:
   - Reload browser page
   - Try generating email again
2. **Check PO data**:
   - Ensure PO has items
   - Verify supplier information complete
3. **Clear cache**:
   - Clear browser cache
   - Reload and try again
4. **Try different PO**:
   - Generate email for different PO
   - Check if issue is PO-specific

### Cannot Attach PDF to Email

**Symptoms**: PDF not attaching when email opens

**Solutions**:
1. **Manual attachment**:
   - mailto: links cannot auto-attach files
   - Download PDF first
   - Manually attach to email
2. **Download PDF**:
   - Click "Download PDF"
   - Save to computer
   - Attach to email manually
3. **Use email service**:
   - Consider using email service integration
   - Contact support about direct email sending

---

## Performance and Loading

### Page Loading Slowly

**Symptoms**: Pages take long time to load

**Solutions**:
1. **Check internet connection**:
   - Test internet speed
   - Try different network
2. **Clear browser cache**:
   - Clear cache and cookies
   - Reload page
3. **Close other tabs**:
   - Too many tabs can slow browser
   - Close unnecessary tabs
4. **Update browser**:
   - Ensure using latest browser version
   - Update if needed
5. **Check system status**:
   - Go to Settings > System Status
   - Verify all services are "Up"
6. **Try different time**:
   - May be high traffic period
   - Try during off-peak hours

### Dashboard Not Loading

**Symptoms**: Dashboard shows loading spinner indefinitely

**Solutions**:
1. **Refresh page**:
   - Press F5 or Ctrl+R
   - Wait 30 seconds
2. **Check data**:
   - Ensure you have imported data
   - New accounts may have empty dashboard
3. **Clear cache**:
   - Clear browser cache
   - Reload page
4. **Check browser console**:
   - Press F12 to open developer tools
   - Look for errors in Console tab
   - Share errors with support
5. **Try different browser**:
   - Test in Chrome, Firefox, or Safari
   - May be browser-specific issue

### "Service Unavailable" Error

**Symptoms**: Error message about service being unavailable

**Solutions**:
1. **Check system status**:
   - Go to status.smartinventory.com
   - Check for known outages
2. **Wait and retry**:
   - May be temporary issue
   - Wait 5-10 minutes
   - Try again
3. **Check internet**:
   - Verify internet connection
   - Try different network
4. **Contact support**:
   - If persists for 30+ minutes
   - Report service outage

### Timeout Errors

**Symptoms**: "Request Timeout" or "Gateway Timeout" errors

**Solutions**:
1. **Retry operation**:
   - Click retry button
   - Or refresh page and try again
2. **Reduce data size**:
   - If uploading large file, split it
   - If generating large report, use filters
3. **Check connection**:
   - Ensure stable internet
   - Avoid VPN if possible
4. **Try later**:
   - May be temporary server load
   - Try during off-peak hours

---

## Mobile and Responsive Issues

### Mobile Layout Broken

**Symptoms**: Layout doesn't fit screen, elements overlapping

**Solutions**:
1. **Rotate device**:
   - Try portrait and landscape
   - Some features work better in landscape
2. **Zoom level**:
   - Reset zoom to 100%
   - Pinch to zoom out if needed
3. **Update app**:
   - Clear browser cache
   - Reload page
4. **Try different browser**:
   - Test in Chrome, Safari, or Firefox mobile
   - May be browser-specific issue
5. **Update OS**:
   - Ensure device OS is up to date
   - Old OS versions may have issues

### Touch Targets Too Small

**Symptoms**: Difficult to tap buttons on mobile

**Solutions**:
1. **Zoom in**:
   - Pinch to zoom on specific area
   - Tap more precisely
2. **Use landscape mode**:
   - Rotate device to landscape
   - Provides more space
3. **Report issue**:
   - Let us know which buttons are too small
   - We'll improve in next update
4. **Use desktop**:
   - For complex tasks, use desktop browser
   - Mobile is optimized for viewing and simple tasks

### Mobile Performance Slow

**Symptoms**: App slow or laggy on mobile device

**Solutions**:
1. **Close other apps**:
   - Free up device memory
   - Close background apps
2. **Clear browser cache**:
   - Clear cache in mobile browser settings
   - Reload page
3. **Update browser**:
   - Ensure using latest browser version
   - Update from app store
4. **Restart device**:
   - Restart phone or tablet
   - Clears memory
5. **Check connection**:
   - Use WiFi instead of cellular
   - Ensure strong signal

### Offline Banner Won't Dismiss

**Symptoms**: "You are offline" banner stays even when online

**Solutions**:
1. **Refresh page**:
   - Pull down to refresh
   - Or reload in browser
2. **Check connection**:
   - Verify actually online
   - Test by visiting other websites
3. **Toggle airplane mode**:
   - Turn airplane mode on
   - Wait 5 seconds
   - Turn off
4. **Clear cache**:
   - Clear browser cache
   - Reload page

---

## General Errors

### "Something Went Wrong" Error

**Symptoms**: Generic error message

**Solutions**:
1. **Refresh page**:
   - Reload browser page
   - Try action again
2. **Check error details**:
   - Click "Show Details" if available
   - Note error code
3. **Clear cache**:
   - Clear browser cache and cookies
   - Reload page
4. **Try different browser**:
   - Test in another browser
   - May be browser-specific
5. **Contact support**:
   - Provide error code
   - Describe what you were doing
   - Include screenshot if possible

### Data Not Saving

**Symptoms**: Changes not persisting after save

**Solutions**:
1. **Check for errors**:
   - Look for error messages
   - Verify all required fields filled
2. **Check internet**:
   - Ensure stable connection
   - Try saving again
3. **Refresh and retry**:
   - Reload page
   - Re-enter changes
   - Save again
4. **Check permissions**:
   - Verify you have edit permissions
   - Contact account admin if needed
5. **Try different browser**:
   - May be browser issue
   - Test in another browser

### Features Not Working

**Symptoms**: Specific feature not functioning

**Solutions**:
1. **Check browser compatibility**:
   - Use Chrome, Firefox, Safari, or Edge
   - Update to latest version
2. **Disable extensions**:
   - Try disabling browser extensions
   - Especially ad blockers
3. **Check JavaScript**:
   - Ensure JavaScript is enabled
   - Required for app to function
4. **Clear cache**:
   - Clear browser cache
   - Reload page
5. **Report bug**:
   - Contact support with details
   - Include browser and OS version

---

## Getting Additional Help

### Before Contacting Support

Gather this information:
1. **Error message**: Exact text or screenshot
2. **What you were doing**: Steps that led to error
3. **Browser and version**: Chrome 120, Safari 17, etc.
4. **Operating system**: Windows 11, macOS 14, iOS 17, etc.
5. **Account email**: Your login email
6. **When it started**: First occurrence of issue

### Contact Support

**Email**: support@smartinventory.com

**Response Time**:
- Critical issues: 2-4 hours
- High priority: 4-8 hours
- Normal priority: 24 hours
- Low priority: 48 hours

**Include in Email**:
- Subject: Brief description of issue
- Body: Detailed description
- Attachments: Screenshots, error logs
- Contact info: Best way to reach you

### Emergency Support

For critical issues affecting business operations:
- Email: urgent@smartinventory.com
- Subject line: "URGENT - [Brief Description]"
- Available: 24/7 for critical issues

### Community Resources

- **Help Center**: help.smartinventory.com
- **Video Tutorials**: youtube.com/smartinventory
- **User Forum**: community.smartinventory.com
- **Status Page**: status.smartinventory.com

---

**Last Updated**: November 2024  
**Version**: 1.0
