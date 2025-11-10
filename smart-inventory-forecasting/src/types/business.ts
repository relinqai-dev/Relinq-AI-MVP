// Business logic types for Smart Inventory Forecasting MVP
// These types are used for API responses, business logic, and UI components

import { CleanupIssue } from './database';

// Data cleanup related types
export interface CleanupReport {
  total_issues: number;
  issues_by_type: Record<string, number>;
  completion_percentage: number;
  blocking_forecasting: boolean;
  issues: CleanupIssue[];
}

export interface SupplierValidation {
  supplier_id: string;
  has_contact_info: boolean;
  missing_fields: string[];
  can_generate_po: boolean;
}

// Forecasting related types
export interface ForecastRequest {
  user_id: string;
  items: string[]; // SKUs to forecast
  forecast_days?: number;
  min_data_points?: number;
}

export interface ItemForecast {
  sku: string;
  current_stock: number;
  forecast_7_day: number;
  recommended_order: number;
  confidence_score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality_detected: boolean;
  lead_time_factored: number;
}

export interface ForecastResponse {
  forecasts: ItemForecast[];
  insufficient_data_items: string[];
  data_quality_warnings: string[];
}

// AI Agent and recommendations
export interface AIRecommendation {
  sku: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  action: string;
  explanation: string;
  confidence: number;
  timeline_warning?: string;
  reasoning_context: string;
}

export interface DailyTodoList {
  date: string;
  urgent_actions: AIRecommendation[];
  routine_actions: AIRecommendation[];
  positive_status?: string;
  total_action_count: number;
}

// Purchase Order related types
export interface POLineItem {
  sku: string;
  name: string;
  quantity: number;
  unit_cost?: number;
  line_total?: number;
}

export interface PurchaseOrderWithItems {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_email?: string;
  po_number: string;
  items: POLineItem[];
  total_amount?: number;
  generated_at: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received';
  email_draft?: string;
}

export interface ReorderRecommendation {
  sku: string;
  item_name: string;
  current_stock: number;
  recommended_quantity: number;
  supplier_id?: string;
  supplier_name?: string;
  urgency: 'urgent' | 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface ReorderListBySupplier {
  supplier_id: string;
  supplier_name: string;
  supplier_email?: string;
  items: ReorderRecommendation[];
  total_items: number;
  can_generate_po: boolean;
  missing_supplier_fields: string[];
}

// CSV Import types
export interface CSVImportResult {
  success: boolean;
  imported_count: number;
  error_count: number;
  errors: CSVImportError[];
  warnings: string[];
}

export interface CSVImportError {
  row: number;
  field: string;
  value: string;
  error: string;
}

// Dashboard and analytics
export interface InventoryMetrics {
  total_items: number;
  low_stock_items: number;
  out_of_stock_items: number;
  items_needing_reorder: number;
  total_inventory_value: number;
}

export interface SalesMetrics {
  total_sales_7_days: number;
  total_sales_30_days: number;
  top_selling_items: Array<{
    sku: string;
    name: string;
    quantity_sold: number;
    revenue: number;
  }>;
  sales_trend: 'increasing' | 'decreasing' | 'stable';
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// Search and filtering
export interface InventoryFilters {
  search?: string;
  supplier_id?: string;
  low_stock_only?: boolean;
  out_of_stock_only?: boolean;
  needs_reorder?: boolean;
}

export interface SalesDataFilters {
  sku?: string;
  date_from?: string;
  date_to?: string;
  min_quantity?: number;
}

// Onboarding and setup
export interface OnboardingStatus {
  completed: boolean;
  current_step: number;
  total_steps: number;
  steps: OnboardingStep[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface DatabaseError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}