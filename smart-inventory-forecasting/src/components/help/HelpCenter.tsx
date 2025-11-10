'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Book,
  FileText,
  Video,
  MessageCircle,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface HelpCenterProps {
  className?: string;
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'pos-connection' | 'data-cleanup' | 'forecasting' | 'purchase-orders';
  url: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    description: 'Learn the basics of Smart Inventory Forecasting',
    category: 'getting-started',
    url: '/docs/getting-started',
  },
  {
    id: '2',
    title: 'Connecting Your POS System',
    description: 'Step-by-step guide to connect Square, Clover, or upload CSV',
    category: 'pos-connection',
    url: '/docs/user-guide-pos-connection',
  },
  {
    id: '3',
    title: 'CSV Import Instructions',
    description: 'How to format and upload CSV files',
    category: 'pos-connection',
    url: '/docs/csv-import-guide',
  },
  {
    id: '4',
    title: 'Data Cleanup Process',
    description: 'Resolve duplicates and missing supplier information',
    category: 'data-cleanup',
    url: '/docs/data-cleanup',
  },
  {
    id: '5',
    title: 'Understanding Forecasts',
    description: 'How forecasting works and how to interpret results',
    category: 'forecasting',
    url: '/docs/forecasting',
  },
  {
    id: '6',
    title: 'Generating Purchase Orders',
    description: 'Create and send purchase orders to suppliers',
    category: 'purchase-orders',
    url: '/docs/purchase-orders',
  },
  {
    id: '7',
    title: 'Troubleshooting Common Issues',
    description: 'Solutions to frequently encountered problems',
    category: 'getting-started',
    url: '/docs/troubleshooting-guide',
  },
];

const videoTutorials = [
  {
    id: '1',
    title: 'Quick Start: 5-Minute Setup',
    duration: '5:23',
    url: 'https://youtube.com/watch?v=example1',
  },
  {
    id: '2',
    title: 'Connecting Square POS',
    duration: '3:45',
    url: 'https://youtube.com/watch?v=example2',
  },
  {
    id: '3',
    title: 'Data Cleanup Walkthrough',
    duration: '7:12',
    url: 'https://youtube.com/watch?v=example3',
  },
  {
    id: '4',
    title: 'Understanding Your Forecasts',
    duration: '6:30',
    url: 'https://youtube.com/watch?v=example4',
  },
];

const quickLinks = [
  {
    icon: Book,
    title: 'User Guide',
    description: 'Complete documentation',
    url: '/docs',
  },
  {
    icon: FileText,
    title: 'API Documentation',
    description: 'For developers',
    url: '/docs/api',
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Get help from our team',
    url: 'mailto:support@smartinventory.com',
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    description: 'Watch and learn',
    url: 'https://youtube.com/smartinventory',
  },
];

/**
 * HelpCenter Component
 * 
 * Main help center dialog with search, articles, videos, and support options.
 * Accessible from the main navigation via the help icon.
 * 
 * @example
 * <HelpCenter />
 */
export function HelpCenter({ className }: HelpCenterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = helpArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative', className)}
          aria-label="Open help center"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <HelpCircle className="h-6 w-6 text-primary" />
            Help Center
          </DialogTitle>
          <DialogDescription>
            Find answers, watch tutorials, and get support
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {quickLinks.map((link) => (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-lg',
                'border bg-card hover:bg-accent transition-colors',
                'text-center group'
              )}
            >
              <link.icon className="h-6 w-6 text-primary" />
              <div>
                <div className="font-medium text-sm">{link.title}</div>
                <div className="text-xs text-muted-foreground">
                  {link.description}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="articles" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles">
              <Book className="h-4 w-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="mt-4 space-y-2">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No articles found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg',
                    'border bg-card hover:bg-accent transition-colors',
                    'group'
                  )}
                >
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {article.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-4 space-y-2">
            {videoTutorials.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg',
                  'border bg-card hover:bg-accent transition-colors',
                  'group'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium group-hover:text-primary transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {video.duration}
                    </p>
                  </div>
                </div>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            ))}
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <div className="mt-6 p-4 rounded-lg bg-muted">
          <h3 className="font-medium mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our support team is here to help you with any questions or issues.
          </p>
          <div className="flex gap-2">
            <Button variant="default" size="sm" asChild>
              <a href="mailto:support@smartinventory.com">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="/docs/troubleshooting-guide"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Troubleshooting Guide
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * ContextualHelp Component
 * 
 * Provides contextual help for specific features or pages.
 * Shows relevant help articles and quick tips based on current context.
 * 
 * @example
 * <ContextualHelp context="pos-connection" />
 */
interface ContextualHelpProps {
  context: 'getting-started' | 'pos-connection' | 'data-cleanup' | 'forecasting' | 'purchase-orders';
  className?: string;
}

export function ContextualHelp({ context, className }: ContextualHelpProps) {
  const relevantArticles = helpArticles.filter(
    (article) => article.category === context
  );

  if (relevantArticles.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium flex items-center gap-2">
        <HelpCircle className="h-4 w-4" />
        Related Help Articles
      </h3>
      {relevantArticles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center justify-between p-3 rounded-md',
            'border bg-card hover:bg-accent transition-colors text-sm',
            'group'
          )}
        >
          <span className="group-hover:text-primary transition-colors">
            {article.title}
          </span>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </a>
      ))}
    </div>
  );
}
