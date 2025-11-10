import { Metadata } from 'next';
import { DataCleanupClient } from './data-cleanup-client';

export const metadata: Metadata = {
  title: 'Data Cleanup | Smart Inventory Forecasting',
  description: 'Review and resolve data quality issues to enable accurate forecasting',
};

export default function DataCleanupPage() {
  return <DataCleanupClient />;
}