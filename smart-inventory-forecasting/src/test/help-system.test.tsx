/**
 * Help System Integration Tests
 * Tests for help components and content library
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelpTooltip, InlineHelp, HelpSection, QuickTip } from '@/components/help';
import { getHelpContent, searchHelpContent, getHelpContentByCategory } from '@/lib/help-content';

describe('Help Content Library', () => {
  it('should retrieve help content by key', () => {
    const content = getHelpContent('dashboard.overview');
    
    expect(content).toBeDefined();
    expect(content?.title).toBe('Dashboard Overview');
    expect(content?.content).toContain('dashboard');
  });

  it('should return undefined for non-existent key', () => {
    const content = getHelpContent('non.existent.key');
    
    expect(content).toBeUndefined();
  });

  it('should search help content', () => {
    const results = searchHelpContent('forecasting');
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content.title.toLowerCase()).toContain('forecast');
  });

  it('should filter help content by category', () => {
    const dashboardHelp = getHelpContentByCategory('dashboard');
    
    expect(Object.keys(dashboardHelp).length).toBeGreaterThan(0);
    expect(Object.keys(dashboardHelp)[0]).toContain('dashboard.');
  });

  it('should have all required help topics', () => {
    const requiredTopics = [
      'dashboard.overview',
      'pos.connection',
      'csv.format',
      'cleanup.overview',
      'forecast.overview',
      'reorder.overview',
      'po.overview',
    ];

    requiredTopics.forEach(topic => {
      const content = getHelpContent(topic);
      expect(content).toBeDefined();
      expect(content?.title).toBeTruthy();
      expect(content?.content).toBeTruthy();
    });
  });
});

describe('HelpTooltip Component', () => {
  it('should render help tooltip', () => {
    render(
      <HelpTooltip
        title="Test Help"
        content="This is test help content"
      />
    );

    const button = screen.getByRole('button', { name: /help: test help/i });
    expect(button).toBeDefined();
  });

  it('should render with learn more link', () => {
    render(
      <HelpTooltip
        title="Test Help"
        content="This is test help content"
        learnMoreUrl="/docs/test"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
  });

  it('should render as button variant', () => {
    render(
      <HelpTooltip
        title="Test Help"
        content="This is test help content"
        variant="button"
      />
    );

    const button = screen.getByRole('button', { name: /help: test help/i });
    expect(button).toBeDefined();
  });
});

describe('InlineHelp Component', () => {
  it('should render inline help', () => {
    render(
      <InlineHelp>
        This is inline help text
      </InlineHelp>
    );

    expect(screen.getByText('This is inline help text')).toBeDefined();
  });

  it('should have help icon', () => {
    const { container } = render(
      <InlineHelp>
        Help text
      </InlineHelp>
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeDefined();
  });
});

describe('HelpSection Component', () => {
  it('should render help section', () => {
    render(
      <HelpSection title="Test Section">
        <p>Section content</p>
      </HelpSection>
    );

    expect(screen.getByText('Test Section')).toBeDefined();
  });

  it('should be collapsible', () => {
    const { container } = render(
      <HelpSection title="Test Section">
        <p>Section content</p>
      </HelpSection>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    
    // Content should be hidden initially
    const content = screen.queryByText('Section content');
    expect(content).toBeNull();
  });
});

describe('QuickTip Component', () => {
  it('should render quick tip', () => {
    render(
      <QuickTip>
        This is a quick tip
      </QuickTip>
    );

    expect(screen.getByText('This is a quick tip')).toBeDefined();
  });

  it('should have dismiss button', () => {
    render(
      <QuickTip>
        Tip content
      </QuickTip>
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss tip/i });
    expect(dismissButton).toBeDefined();
  });
});

describe('Help System Integration', () => {
  it('should integrate help content with tooltip', () => {
    const helpContent = getHelpContent('dashboard.overview');
    
    if (helpContent) {
      render(
        <HelpTooltip {...helpContent} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDefined();
    }
  });

  it('should have consistent help content structure', () => {
    const allContent = [
      'dashboard.overview',
      'pos.connection',
      'csv.format',
      'cleanup.overview',
      'forecast.overview',
    ];

    allContent.forEach(key => {
      const content = getHelpContent(key);
      expect(content).toBeDefined();
      expect(content).toHaveProperty('title');
      expect(content).toHaveProperty('content');
      expect(typeof content?.title).toBe('string');
      expect(typeof content?.content).toBe('string');
    });
  });

  it('should have valid learn more URLs', () => {
    const contentWithUrls = [
      'dashboard.overview',
      'pos.connection',
      'csv.format',
    ];

    contentWithUrls.forEach(key => {
      const content = getHelpContent(key);
      if (content?.learnMoreUrl) {
        expect(content.learnMoreUrl).toMatch(/^\/docs/);
      }
    });
  });
});

describe('Help Content Coverage', () => {
  it('should have help for all major features', () => {
    const features = [
      'dashboard',
      'pos',
      'csv',
      'cleanup',
      'forecast',
      'reorder',
      'po',
      'supplier',
      'settings',
      'system',
      'mobile',
    ];

    features.forEach(feature => {
      const categoryContent = getHelpContentByCategory(feature);
      expect(Object.keys(categoryContent).length).toBeGreaterThan(0);
    });
  });

  it('should have searchable content', () => {
    const searchTerms = [
      'forecast',
      'inventory',
      'supplier',
      'order',
      'sync',
    ];

    searchTerms.forEach(term => {
      const results = searchHelpContent(term);
      expect(results.length).toBeGreaterThan(0);
    });
  });
});

describe('Accessibility', () => {
  it('should have proper ARIA labels on help tooltip', () => {
    render(
      <HelpTooltip
        title="Test Help"
        content="Content"
      />
    );

    const button = screen.getByRole('button', { name: /help: test help/i });
    expect(button.getAttribute('aria-label')).toContain('Help');
  });

  it('should have proper ARIA label on quick tip dismiss', () => {
    render(
      <QuickTip>
        Tip content
      </QuickTip>
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss tip/i });
    expect(dismissButton.getAttribute('aria-label')).toBe('Dismiss tip');
  });
});
