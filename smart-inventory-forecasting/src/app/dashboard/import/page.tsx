import { Metadata } from 'next'
import ImportClient from './import-client'

export const metadata: Metadata = {
  title: 'Import Data | Smart Inventory Forecasting',
  description: 'Import your inventory and sales data via CSV upload',
}

export default function ImportPage() {
  return <ImportClient />
}