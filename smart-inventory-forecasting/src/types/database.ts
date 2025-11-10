// Database types for Smart Inventory Forecasting MVP
// These interfaces match the database schema defined in migrations

export interface Store {
  id: string
  user_id: string
  name: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  user_id: string
  name: string
  contact_email?: string
  contact_phone?: string
  address?: string
  lead_time_days: number
  created_at: string
  updated_at: string
}

export interface POSConnection {
  id: string
  user_id: string
  pos_type: 'square' | 'clover' | 'manual'
  credentials?: Record<string, string>
  last_sync?: string
  status: 'active' | 'error' | 'pending'
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  user_id: string
  sku: string
  name: string
  current_stock: number
  supplier_id?: string
  lead_time_days?: number
  unit_cost?: number
  created_at: string
  updated_at: string
}

export interface SalesData {
  id: string
  user_id: string
  sku: string
  item_name?: string
  quantity_sold: number
  sale_date: string
  unit_price?: number
  created_at: string
}

export interface Forecast {
  id: string
  user_id: string
  sku: string
  forecast_date: string
  forecast_quantity: number
  confidence_score?: number
  model_used?: string
  trend?: 'increasing' | 'decreasing' | 'stable'
  seasonality_detected: boolean
  recommended_order?: number
  data_quality_score?: number
  created_at: string
}

export interface CleanupIssue {
  id: string
  user_id: string
  issue_type: 'duplicate' | 'missing_supplier' | 'no_sales_history'
  severity: 'high' | 'medium' | 'low'
  affected_items?: string[]
  suggested_action?: string
  resolved: boolean
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: string
  user_id: string
  supplier_id: string
  po_number: string
  total_amount?: number
  status: 'draft' | 'sent' | 'confirmed' | 'received'
  email_draft?: string
  generated_at: string
  sent_at?: string
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  sku: string
  item_name: string
  quantity: number
  unit_cost?: number
  line_total?: number
  created_at: string
}

// Input types for creating new records (without generated fields)
export interface CreateStore {
  name: string
  address?: string
}

export interface CreateSupplier {
  name: string
  contact_email?: string
  contact_phone?: string
  address?: string
  lead_time_days?: number
}

export interface CreatePOSConnection {
  pos_type: 'square' | 'clover' | 'manual'
  credentials?: Record<string, string>
}

export interface CreateInventoryItem {
  sku: string
  name: string
  current_stock?: number
  supplier_id?: string
  lead_time_days?: number
  unit_cost?: number
}

export interface CreateSalesData {
  sku: string
  item_name?: string
  quantity_sold: number
  sale_date: string
  unit_price?: number
}

export interface CreateForecast {
  sku: string
  forecast_date: string
  forecast_quantity: number
  confidence_score?: number
  model_used?: string
  trend?: 'increasing' | 'decreasing' | 'stable'
  seasonality_detected?: boolean
  recommended_order?: number
  data_quality_score?: number
}

export interface CreateCleanupIssue {
  issue_type: 'duplicate' | 'missing_supplier' | 'no_sales_history'
  severity: 'high' | 'medium' | 'low'
  affected_items?: string[]
  suggested_action?: string
}

export interface CreatePurchaseOrder {
  supplier_id: string
  po_number: string
  total_amount?: number
  status?: 'draft' | 'sent' | 'confirmed' | 'received'
  email_draft?: string
}

export interface CreatePurchaseOrderItem {
  purchase_order_id: string
  sku: string
  item_name: string
  quantity: number
  unit_cost?: number
  line_total?: number
}

// Update types (partial updates)
export type UpdateStore = Partial<CreateStore>
export type UpdateSupplier = Partial<CreateSupplier>
export type UpdatePOSConnection = Partial<CreatePOSConnection>
export type UpdateInventoryItem = Partial<CreateInventoryItem>
export type UpdateForecast = Partial<CreateForecast>
export type UpdateCleanupIssue = Partial<CreateCleanupIssue>
export type UpdatePurchaseOrder = Partial<CreatePurchaseOrder>
export type UpdatePurchaseOrderItem = Partial<CreatePurchaseOrderItem>

// User profile types
export interface UserProfile {
  user_id: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}