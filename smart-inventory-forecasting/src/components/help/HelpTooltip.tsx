'use client';

import React, { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  title: string;
  content: string;
  learnMoreUrl?: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
}

/**
 * HelpTooltip Component
 * 
 * Provides contextual help and tooltips throughout the application.
 * Can be displayed as an icon or button with detailed help content in a dialog.
 * 
 * @example
 * <HelpTooltip
 *   title="What is forecasting?"
 *   content="Forecasting uses your sales history to predict future demand..."
 *   learnMoreUrl="/docs/forecasting"
 * />
 */
export function HelpTooltip({
  title,
  content,
  learnMoreUrl,
  className,
  iconSize = 'md',
  variant = 'icon',
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);

  const iconSizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[iconSize];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center rounded-full',
              'text-muted-foreground hover:text-foreground',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-ring',
              'touch-target', // Ensures minimum 44x44px touch target
              className
            )}
            aria-label={`Help: ${title}`}
          >
            <HelpCircle className={iconSizeClass} />
          </button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2', className)}
            aria-label={`Help: ${title}`}
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base leading-relaxed">
          {content}
        </DialogDescription>
        {learnMoreUrl && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="gap-2"
            >
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface InlineHelpProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * InlineHelp Component
 * 
 * Displays help text inline with content, typically below form fields or sections.
 * 
 * @example
 * <InlineHelp>
 *   Enter at least 14 days of sales history for accurate forecasting.
 * </InlineHelp>
 */
export function InlineHelp({ children, className }: InlineHelpProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 text-sm text-muted-foreground',
        'mt-2 p-3 rounded-md bg-muted/50',
        className
      )}
    >
      <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

interface HelpSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * HelpSection Component
 * 
 * Displays a collapsible help section with title and content.
 * Useful for longer help content or step-by-step instructions.
 * 
 * @example
 * <HelpSection title="How to connect Square POS">
 *   <ol>
 *     <li>Click "Connect POS System"</li>
 *     <li>Select "Square"</li>
 *     <li>Authorize access</li>
 *   </ol>
 * </HelpSection>
 */
export function HelpSection({ title, children, className }: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        'border rounded-lg p-4 bg-card',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <span className="text-muted-foreground">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      {isExpanded && (
        <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

interface QuickTipProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * QuickTip Component
 * 
 * Displays a quick tip or hint, typically at the top of a page or section.
 * 
 * @example
 * <QuickTip>
 *   💡 Tip: Upload at least 30 days of sales history for better forecasts.
 * </QuickTip>
 */
export function QuickTip({ children, className }: QuickTipProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg',
        'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800',
        'text-blue-900 dark:text-blue-100',
        className
      )}
    >
      <div className="flex-1 text-sm leading-relaxed">{children}</div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        aria-label="Dismiss tip"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
