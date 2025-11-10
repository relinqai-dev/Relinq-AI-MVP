/**
 * Help Content Library
 * 
 * Centralized help content for tooltips, inline help, and contextual assistance
 * throughout the application. Used by HelpTooltip and other help components.
 */

export interface HelpContent {
  title: string;
  content: string;
  learnMoreUrl?: string;
}

export const helpContent: Record<string, HelpContent> = {
  // Dashboard
  'dashboard.overview': {
    title: 'Dashboard Overview',
    content: 'Your dashboard shows daily recommendations, inventory status, and key metrics. Check here each day to see what actions you need to take.',
    learnMoreUrl: '/docs#dashboard',
  },
  'dashboard.recommendations': {
    title: 'AI Recommendations',
    content: 'These are AI-generated suggestions based on your sales history and current inventory. Urgent items appear at the top and should be addressed first.',
    learnMoreUrl: '/docs#ai-recommendations',
  },
  'dashboard.metrics': {
    title: 'Key Metrics',
    content: 'Track your inventory health with metrics like total items, low stock alerts, and forecast accuracy. These update in real-time as you make changes.',
    learnMoreUrl: '/docs#metrics',
  },

  // POS Connection
  'pos.connection': {
    title: 'POS Connection',
    content: 'Connect your Point of Sale system to automatically sync sales and inventory data. We support Square, Clover, and manual CSV uploads.',
    learnMoreUrl: '/docs/user-guide-pos-connection',
  },
  'pos.square': {
    title: 'Square Integration',
    content: 'Connect your Square account to automatically import inventory items and sales history. You\'ll need admin access to authorize the connection.',
    learnMoreUrl: '/docs/user-guide-pos-connection#connecting-square-pos',
  },
  'pos.clover': {
    title: 'Clover Integration',
    content: 'Connect your Clover account to sync inventory and orders. Make sure you have your Merchant ID ready from the Clover Dashboard.',
    learnMoreUrl: '/docs/user-guide-pos-connection#connecting-clover-pos',
  },
  'pos.csv': {
    title: 'CSV Upload',
    content: 'Upload sales and inventory data from any POS system using CSV files. Download our template to ensure correct formatting.',
    learnMoreUrl: '/docs/csv-import-guide',
  },
  'pos.sync-frequency': {
    title: 'Sync Frequency',
    content: 'Choose how often to sync data: Real-time (recommended), Hourly, or Daily. More frequent syncing provides more accurate forecasts.',
    learnMoreUrl: '/docs/user-guide-pos-connection#configure-sync-settings',
  },

  // CSV Import
  'csv.format': {
    title: 'CSV Format Requirements',
    content: 'Your CSV must include: date, sku, item_name, and quantity columns. Use YYYY-MM-DD format for dates. Download our template for the correct format.',
    learnMoreUrl: '/docs/csv-import-guide#csv-file-requirements',
  },
  'csv.mapping': {
    title: 'Column Mapping',
    content: 'Map your CSV columns to our standard fields. For example, if your CSV has "product_id", map it to "SKU". The system will remember your mapping for future uploads.',
    learnMoreUrl: '/docs/csv-import-guide#step-3-map-columns',
  },
  'csv.validation': {
    title: 'Data Validation',
    content: 'We automatically check your data for errors like missing fields, invalid dates, and duplicate entries. Fix any errors before importing.',
    learnMoreUrl: '/docs/csv-import-guide#step-4-validate-data',
  },

  // Data Cleanup
  'cleanup.overview': {
    title: 'Data Cleanup',
    content: 'Clean data is essential for accurate forecasts. Resolve duplicates, assign suppliers, and fix data quality issues before generating forecasts.',
    learnMoreUrl: '/docs#data-cleanup',
  },
  'cleanup.duplicates': {
    title: 'Duplicate Items',
    content: 'Items with similar names but different SKUs may be duplicates. Review and merge them to avoid splitting sales history across multiple items.',
    learnMoreUrl: '/docs/user-guide-pos-connection#duplicate-sku-warning',
  },
  'cleanup.suppliers': {
    title: 'Missing Suppliers',
    content: 'Assign a supplier to each item so we can calculate lead times and group purchase orders. Items without suppliers can\'t be included in POs.',
    learnMoreUrl: '/docs#supplier-assignment',
  },
  'cleanup.progress': {
    title: 'Cleanup Progress',
    content: 'Track your progress toward clean data. You must resolve all high-priority issues before forecasting is enabled.',
    learnMoreUrl: '/docs#cleanup-progress',
  },
  'cleanup.bulk-actions': {
    title: 'Bulk Actions',
    content: 'Select multiple items to merge duplicates or assign suppliers in bulk. This saves time when cleaning large datasets.',
    learnMoreUrl: '/docs#bulk-actions',
  },

  // Forecasting
  'forecast.overview': {
    title: 'Demand Forecasting',
    content: 'We use machine learning to predict future demand based on your sales history. Forecasts are generated daily and account for trends and seasonality.',
    learnMoreUrl: '/docs#forecasting',
  },
  'forecast.requirements': {
    title: 'Forecast Requirements',
    content: 'Accurate forecasts require at least 14 days of sales history per item. More data (30-90 days) produces better results.',
    learnMoreUrl: '/docs#forecast-requirements',
  },
  'forecast.confidence': {
    title: 'Confidence Score',
    content: 'This score (0-100%) indicates how confident we are in the forecast. Higher scores mean more reliable predictions based on consistent sales patterns.',
    learnMoreUrl: '/docs#confidence-scores',
  },
  'forecast.trends': {
    title: 'Sales Trends',
    content: 'We detect increasing, decreasing, or stable trends in your sales. Forecasts adjust automatically based on recent patterns.',
    learnMoreUrl: '/docs#trends',
  },
  'forecast.seasonality': {
    title: 'Seasonal Patterns',
    content: 'If we detect seasonal patterns (like higher sales on weekends), forecasts will account for these cycles.',
    learnMoreUrl: '/docs#seasonality',
  },
  'forecast.blocked': {
    title: 'Forecasting Blocked',
    content: 'Forecasting is blocked until you complete data cleanup. Resolve all high-priority issues to enable forecasting.',
    learnMoreUrl: '/docs/troubleshooting-guide#forecasting-blocked-message',
  },

  // Reorder Recommendations
  'reorder.overview': {
    title: 'Reorder Recommendations',
    content: 'Based on forecasts and current stock, we recommend which items to reorder and how much. Items are grouped by supplier for easy ordering.',
    learnMoreUrl: '/docs#reorder-recommendations',
  },
  'reorder.quantity': {
    title: 'Recommended Quantity',
    content: 'This quantity accounts for forecasted demand, current stock, and supplier lead time. You can adjust it before creating a purchase order.',
    learnMoreUrl: '/docs#recommended-quantities',
  },
  'reorder.lead-time': {
    title: 'Lead Time',
    content: 'The number of days between ordering and receiving items from your supplier. We factor this into reorder timing to prevent stockouts.',
    learnMoreUrl: '/docs#lead-times',
  },
  'reorder.urgency': {
    title: 'Urgency Level',
    content: 'Urgent items risk stockout soon. High priority items should be ordered within a few days. Normal items can wait longer.',
    learnMoreUrl: '/docs#urgency-levels',
  },

  // Purchase Orders
  'po.overview': {
    title: 'Purchase Orders',
    content: 'Generate professional purchase orders grouped by supplier. POs include item details, quantities, and pricing.',
    learnMoreUrl: '/docs#purchase-orders',
  },
  'po.supplier-grouping': {
    title: 'Supplier Grouping',
    content: 'Items are automatically grouped by supplier. Each supplier gets a separate purchase order for easy ordering.',
    learnMoreUrl: '/docs/email-integration#supplier-grouping',
  },
  'po.pdf': {
    title: 'PDF Generation',
    content: 'Download a professional PDF purchase order to send to your supplier. The PDF includes all item details and your company information.',
    learnMoreUrl: '/docs#pdf-generation',
  },
  'po.email': {
    title: 'Email Integration',
    content: 'Send purchase orders via email with pre-written templates. Your default email client will open with the supplier\'s address and message pre-filled.',
    learnMoreUrl: '/docs/email-integration',
  },
  'po.tracking': {
    title: 'Order Tracking',
    content: 'Track the status of your purchase orders: Draft, Sent, Confirmed, or Received. Update status as orders progress.',
    learnMoreUrl: '/docs#order-tracking',
  },

  // Suppliers
  'supplier.overview': {
    title: 'Supplier Management',
    content: 'Manage your supplier information including contact details and lead times. Complete supplier info is required for purchase orders.',
    learnMoreUrl: '/docs#suppliers',
  },
  'supplier.contact': {
    title: 'Supplier Contact Info',
    content: 'Add supplier email addresses to enable email integration. Phone numbers and addresses are optional but helpful for reference.',
    learnMoreUrl: '/docs#supplier-contact',
  },
  'supplier.lead-time': {
    title: 'Supplier Lead Time',
    content: 'The typical number of days from ordering to delivery. This affects when we recommend reordering to prevent stockouts.',
    learnMoreUrl: '/docs#lead-times',
  },

  // Settings
  'settings.account': {
    title: 'Account Settings',
    content: 'Manage your account information, password, and notification preferences.',
    learnMoreUrl: '/docs#account-settings',
  },
  'settings.notifications': {
    title: 'Notification Settings',
    content: 'Choose which notifications to receive: stockout alerts, forecast updates, or order confirmations.',
    learnMoreUrl: '/docs#notifications',
  },
  'settings.data': {
    title: 'Data Management',
    content: 'Export your data, manage POS connections, or delete your account. All data exports are in CSV format.',
    learnMoreUrl: '/docs#data-management',
  },

  // System Status
  'system.status': {
    title: 'System Status',
    content: 'Check the health of all system services: database, forecasting engine, and authentication. Green means everything is working.',
    learnMoreUrl: '/docs#system-status',
  },
  'system.offline': {
    title: 'Offline Mode',
    content: 'You\'re currently offline. Some features may not work until you reconnect to the internet.',
    learnMoreUrl: '/docs/mobile-responsiveness#offline-detection',
  },

  // Mobile
  'mobile.navigation': {
    title: 'Mobile Navigation',
    content: 'Use the bottom navigation bar to quickly access Dashboard, Inventory, Forecasts, and Orders on mobile devices.',
    learnMoreUrl: '/docs/mobile-responsiveness#mobile-navigation',
  },
  'mobile.gestures': {
    title: 'Touch Gestures',
    content: 'Swipe left/right to navigate between sections. Pull down to refresh data. Tap and hold for additional options.',
    learnMoreUrl: '/docs/mobile-responsiveness#touch-friendly-interactions',
  },
};

/**
 * Get help content by key
 */
export function getHelpContent(key: string): HelpContent | undefined {
  return helpContent[key];
}

/**
 * Get all help content for a specific category
 */
export function getHelpContentByCategory(category: string): Record<string, HelpContent> {
  const prefix = `${category}.`;
  return Object.entries(helpContent)
    .filter(([key]) => key.startsWith(prefix))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, HelpContent>);
}

/**
 * Search help content
 */
export function searchHelpContent(query: string): Array<{ key: string; content: HelpContent }> {
  const lowerQuery = query.toLowerCase();
  return Object.entries(helpContent)
    .filter(([, content]) =>
      content.title.toLowerCase().includes(lowerQuery) ||
      content.content.toLowerCase().includes(lowerQuery)
    )
    .map(([key, content]) => ({ key, content }));
}
