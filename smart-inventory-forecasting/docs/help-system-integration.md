# Help System Integration Guide

## Overview

This guide explains how to integrate the help system components throughout the Smart Inventory Forecasting application.

## Components Available

### 1. HelpTooltip
Contextual help icon/button that opens a dialog with detailed information.

```tsx
import { HelpTooltip } from '@/components/help';

<HelpTooltip
  title="What is forecasting?"
  content="Forecasting uses your sales history to predict future demand..."
  learnMoreUrl="/docs/forecasting"
/>
```

### 2. InlineHelp
Inline help text displayed below form fields or sections.

```tsx
import { InlineHelp } from '@/components/help';

<InlineHelp>
  Enter at least 14 days of sales history for accurate forecasting.
</InlineHelp>
```

### 3. HelpSection
Collapsible help section with title and expandable content.

```tsx
import { HelpSection } from '@/components/help';

<HelpSection title="How to connect Square POS">
  <ol>
    <li>Click "Connect POS System"</li>
    <li>Select "Square"</li>
    <li>Authorize access</li>
  </ol>
</HelpSection>
```

### 4. QuickTip
Dismissible tip or hint displayed at the top of a page.

```tsx
import { QuickTip } from '@/components/help';

<QuickTip>
  💡 Tip: Upload at least 30 days of sales history for better forecasts.
</QuickTip>
```

### 5. HelpCenter
Main help center dialog with search, articles, and videos.

```tsx
import { HelpCenter } from '@/components/help';

// In navigation or header
<HelpCenter />
```

### 6. ContextualHelp
Context-aware help articles for specific features.

```tsx
import { ContextualHelp } from '@/components/help';

<ContextualHelp context="pos-connection" />
```

## Using Help Content Library

The centralized help content library provides consistent help text across the app.

```tsx
import { getHelpContent } from '@/lib/help-content';

// Get specific help content
const helpContent = getHelpContent('forecast.overview');

// Use with HelpTooltip
<HelpTooltip {...helpContent} />

// Or destructure
const { title, content, learnMoreUrl } = getHelpContent('csv.format');
<HelpTooltip title={title} content={content} learnMoreUrl={learnMoreUrl} />
```

## Integration Examples

### Form Fields

```tsx
import { HelpTooltip, InlineHelp } from '@/components/help';
import { getHelpContent } from '@/lib/help-content';

<div className="space-y-2">
  <label className="flex items-center gap-2">
    Supplier Lead Time
    <HelpTooltip {...getHelpContent('supplier.lead-time')} />
  </label>
  <Input type="number" />
  <InlineHelp>
    The typical number of days from ordering to delivery.
  </InlineHelp>
</div>
```

### Page Headers

```tsx
import { HelpTooltip } from '@/components/help';
import { getHelpContent } from '@/lib/help-content';

<div className="flex items-center gap-2">
  <h1>Data Cleanup</h1>
  <HelpTooltip {...getHelpContent('cleanup.overview')} />
</div>
```

### Dashboard Widgets

```tsx
import { HelpTooltip, QuickTip } from '@/components/help';
import { getHelpContent } from '@/lib/help-content';

<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Forecast Accuracy</CardTitle>
      <HelpTooltip {...getHelpContent('forecast.confidence')} />
    </div>
  </CardHeader>
  <CardContent>
    <QuickTip>
      Higher confidence scores indicate more reliable predictions.
    </QuickTip>
    {/* Widget content */}
  </CardContent>
</Card>
```

### Onboarding Steps

```tsx
import { HelpSection, ContextualHelp } from '@/components/help';

<div className="space-y-4">
  <HelpSection title="Connecting Your POS System">
    <p>Follow these steps to connect Square or Clover...</p>
  </HelpSection>
  
  <ContextualHelp context="pos-connection" />
</div>
```

### Settings Pages

```tsx
import { HelpTooltip, InlineHelp } from '@/components/help';
import { getHelpContent } from '@/lib/help-content';

<div className="space-y-6">
  <div>
    <label className="flex items-center gap-2">
      Sync Frequency
      <HelpTooltip {...getHelpContent('pos.sync-frequency')} />
    </label>
    <Select>
      <option>Real-time</option>
      <option>Hourly</option>
      <option>Daily</option>
    </Select>
    <InlineHelp>
      More frequent syncing provides more accurate forecasts.
    </InlineHelp>
  </div>
</div>
```

## Adding New Help Content

To add new help topics, edit `src/lib/help-content.ts`:

```typescript
export const helpContent: Record<string, HelpContent> = {
  // ... existing content
  
  'new-feature.overview': {
    title: 'New Feature Overview',
    content: 'Description of the new feature...',
    learnMoreUrl: '/docs/new-feature',
  },
};
```

## Best Practices

### 1. Use Consistent Keys
Follow the naming convention: `category.topic`
- `dashboard.overview`
- `forecast.confidence`
- `po.tracking`

### 2. Keep Content Concise
- Tooltip content: 1-3 sentences
- Inline help: 1 sentence
- Help sections: 3-5 bullet points

### 3. Provide Learn More Links
Always include a `learnMoreUrl` for detailed documentation.

### 4. Use Contextual Help
Place help where users need it, not just in a help center.

### 5. Test on Mobile
Ensure help dialogs and tooltips work well on touch devices.

### 6. Accessibility
- All help components have proper ARIA labels
- Keyboard navigation is supported
- Screen reader friendly

## Integration Checklist

When adding help to a new page or feature:

- [ ] Add help content to `help-content.ts`
- [ ] Add HelpTooltip to page title
- [ ] Add InlineHelp to complex form fields
- [ ] Add QuickTip for important information
- [ ] Add ContextualHelp at bottom of page
- [ ] Test on desktop and mobile
- [ ] Verify all links work
- [ ] Check accessibility

## Troubleshooting

### Help Dialog Not Opening
- Verify Dialog component is imported correctly
- Check that button has proper onClick handler
- Ensure no z-index conflicts

### Content Not Displaying
- Verify help content key exists in `help-content.ts`
- Check for typos in key names
- Ensure content is properly formatted

### Mobile Issues
- Verify touch targets are at least 44x44px
- Test dialog scrolling on small screens
- Check that dialogs don't overflow viewport

## Examples in Codebase

See these files for integration examples:
- `src/components/layout/DashboardLayout.tsx` - HelpCenter in header
- `src/components/csv-import/CSVUploadComponent.tsx` - Form field help
- `src/components/data-cleanup/DataCleanupDashboard.tsx` - Page-level help
- `src/components/forecasting/ForecastingDashboard.tsx` - Widget help

## Support

For questions about help system integration:
- Review this guide
- Check existing implementations
- Refer to component documentation
- Contact development team

---

**Last Updated**: November 2024  
**Version**: 1.0
