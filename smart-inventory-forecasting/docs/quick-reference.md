# Quick Reference Guide

A quick reference for common tasks and features in Smart Inventory Forecasting.

## 🚀 Common Tasks

### Connect POS System

**Square:**
1. Dashboard > Settings > POS Connection
2. Select "Square"
3. Click "Connect to Square"
4. Authorize access
5. Configure sync settings

**Clover:**
1. Dashboard > Settings > POS Connection
2. Select "Clover"
3. Click "Connect to Clover"
4. Authorize access
5. Configure sync settings

**CSV Upload:**
1. Dashboard > Import Data
2. Click "Upload CSV"
3. Select file type (Sales or Inventory)
4. Upload file
5. Map columns
6. Import data

### Clean Data

1. Go to Data Cleanup dashboard
2. Review detected issues
3. Merge duplicate items
4. Assign suppliers to items
5. Resolve all high-priority issues
6. Click "Mark as Complete"

### Generate Forecast

1. Ensure data cleanup is complete
2. Go to Forecasting dashboard
3. Click "Generate Forecasts"
4. Wait for processing (2-5 minutes)
5. Review forecast results

### Create Purchase Order

1. Go to Reorder List
2. Review recommendations
3. Select items to order
4. Adjust quantities if needed
5. Click "Generate PO"
6. Download PDF
7. Send via email

### Send PO via Email

1. Open purchase order
2. Click "Send Email"
3. Review email preview
4. Click "Send Email"
5. Email client opens with pre-filled content
6. Attach PDF
7. Send email

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open search |
| `Ctrl/Cmd + /` | Open help center |
| `Ctrl/Cmd + S` | Save current form |
| `Esc` | Close dialog/modal |
| `?` | Show keyboard shortcuts |

## 📊 Dashboard Widgets

### Today's To-Do List
- Shows urgent actions needed today
- Prioritized by urgency and impact
- Click item to view details

### Inventory Status
- Total items in inventory
- Low stock alerts
- Out of stock items
- Items needing reorder

### Forecast Accuracy
- Overall forecast accuracy percentage
- Trend over time
- Items with low confidence

### Recent Activity
- Latest data syncs
- Recent purchase orders
- System notifications

## 🔢 Data Requirements

### Minimum Requirements
- **Sales History**: 14 days minimum, 30+ days recommended
- **SKUs**: All items must have unique SKUs
- **Suppliers**: Required for purchase orders
- **Lead Times**: Required for accurate reorder timing

### Optimal Data
- **Sales History**: 90+ days for seasonal patterns
- **Complete Supplier Info**: Name, email, phone, lead time
- **Accurate Stock Levels**: Updated weekly
- **Consistent Naming**: Standardized product names

## 📈 Forecast Interpretation

### Confidence Scores
- **90-100%**: Very reliable, consistent sales pattern
- **70-89%**: Reliable, some variation in sales
- **50-69%**: Moderate reliability, significant variation
- **Below 50%**: Low reliability, erratic sales pattern

### Trend Indicators
- **↗️ Increasing**: Sales trending up, order more
- **↘️ Decreasing**: Sales trending down, order less
- **→ Stable**: Consistent sales, maintain current levels

### Urgency Levels
- **🔴 Urgent**: Order immediately (stockout in 1-3 days)
- **🟡 High**: Order soon (stockout in 4-7 days)
- **🟢 Normal**: Order when convenient (stockout in 8+ days)

## 📧 Email Templates

### Purchase Order Email
```
Subject: Purchase Order [PO-NUMBER]

Dear [Supplier Name],

Please find our purchase order [PO-NUMBER] attached. 
We would like to place an order for the following items:

[Item List]

Total Order Amount: [Total]
Expected Lead Time: [Days] days

Please confirm receipt and provide an estimated delivery date.

Thank you,
[Your Name]
```

### Order Confirmation Request
```
Subject: Confirmation Request - PO [PO-NUMBER]

Hi [Supplier Name],

Can you please confirm receipt of our purchase order [PO-NUMBER] 
sent on [Date]?

We need delivery by [Date] to maintain our inventory levels.

Thanks,
[Your Name]
```

## 🔧 Troubleshooting Quick Fixes

### Connection Issues
```
1. Check internet connection
2. Clear browser cache
3. Try different browser
4. Disable VPN
5. Contact support
```

### Data Not Syncing
```
1. Check POS connection status
2. Click "Sync Now"
3. Verify POS credentials
4. Check sync schedule
5. Review error logs
```

### Forecasting Blocked
```
1. Go to Data Cleanup
2. Resolve all high-priority issues
3. Merge duplicates
4. Assign suppliers
5. Click "Rescan Data"
```

### PDF Won't Generate
```
1. Allow popups in browser
2. Try different browser
3. Reduce PO size
4. Clear browser cache
5. Download from PO history
```

## 📱 Mobile Quick Tips

### Navigation
- **Bottom Bar**: Quick access to main sections
- **Hamburger Menu**: Full navigation menu
- **Swipe**: Navigate between pages
- **Pull Down**: Refresh data

### Touch Gestures
- **Tap**: Select item
- **Long Press**: Show options menu
- **Swipe Left**: Delete/archive
- **Swipe Right**: Mark complete
- **Pinch**: Zoom in/out

### Mobile Optimization
- Use landscape mode for tables
- Enable notifications for alerts
- Download app for offline access
- Use WiFi for large uploads

## 🎯 Best Practices

### Daily Routine
1. ✅ Check Today's To-Do List
2. ✅ Review urgent recommendations
3. ✅ Create purchase orders for urgent items
4. ✅ Update inventory if needed
5. ✅ Check for system notifications

### Weekly Routine
1. ✅ Review forecast accuracy
2. ✅ Update supplier information
3. ✅ Reconcile inventory counts
4. ✅ Follow up on pending orders
5. ✅ Export data for records

### Monthly Routine
1. ✅ Analyze sales trends
2. ✅ Review supplier performance
3. ✅ Update lead times
4. ✅ Clean up old data
5. ✅ Review system settings

## 📞 Quick Contact

### Support Channels
- **Email**: support@smartinventory.com
- **Urgent**: urgent@smartinventory.com
- **Phone**: 1-800-INVENTORY
- **Chat**: Available in-app (bottom right)

### Response Times
- **Critical**: 2-4 hours
- **High**: 4-8 hours
- **Normal**: 24 hours
- **Low**: 48 hours

### Before Contacting Support
Have ready:
- Error message or screenshot
- Steps to reproduce issue
- Browser and OS version
- Your account email

## 🔗 Quick Links

### Documentation
- [User Guide](./user-guide-pos-connection.md)
- [CSV Import Guide](./csv-import-guide.md)
- [Troubleshooting](./troubleshooting-guide.md)
- [Email Integration](./email-integration.md)

### Templates
- [Sales Data CSV](../public/templates/sales-data-template.csv)
- [Inventory Data CSV](../public/templates/inventory-data-template.csv)

### External Resources
- Help Center: help.smartinventory.com
- Video Tutorials: youtube.com/smartinventory
- Community Forum: community.smartinventory.com
- Status Page: status.smartinventory.com

## 💡 Pro Tips

1. **Upload more data**: 90+ days of history improves forecast accuracy
2. **Keep SKUs consistent**: Use same SKUs across all systems
3. **Update lead times**: Accurate lead times prevent stockouts
4. **Review daily**: Check recommendations every morning
5. **Provide feedback**: Help improve forecast accuracy
6. **Use bulk actions**: Save time with bulk operations
7. **Set up notifications**: Get alerts for urgent items
8. **Track order status**: Update PO status as orders progress
9. **Export regularly**: Keep backup of your data
10. **Stay organized**: Use categories and tags

---

**Last Updated**: November 2024  
**Version**: 1.0

Print this page for quick reference at your desk!
