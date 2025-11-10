import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CSVImportResult, CSVImportError } from '@/types/business'
import type { User } from '@supabase/supabase-js'

// CSV parsing utility
function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim())
  const result: string[][] = []
  
  for (const line of lines) {
    const row: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    row.push(current.trim())
    result.push(row)
  }
  
  return result
}

interface ValidatedRowData {
  sku: string
  item_name: string
  quantity_sold?: number
  sale_date?: string
  unit_price?: number
  current_stock?: number
  supplier_name?: string
  lead_time_days?: number
  unit_cost?: number
  user_id?: string
}

// Validate and transform CSV row data
function validateRow(row: string[], headers: string[], rowIndex: number): {
  isValid: boolean
  errors: CSVImportError[]
  data?: ValidatedRowData
} {
  const errors: CSVImportError[] = []
  const data: Record<string, string | number> = {}
  
  // Map row data to headers
  headers.forEach((header, index) => {
    data[header] = row[index] || ''
  })
  
  // Required fields validation
  const requiredFields = ['sku', 'item_name']
  requiredFields.forEach(field => {
    const value = data[field]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push({
        row: rowIndex,
        field,
        value: String(value || ''),
        error: `${field} is required and cannot be empty`
      })
    } else if (typeof value === 'string') {
      // Trim whitespace for text fields
      data[field] = value.trim()
    }
  })
  
  // Validate SKU format (basic validation)
  if (data.sku && typeof data.sku === 'string' && data.sku.length > 50) {
    errors.push({
      row: rowIndex,
      field: 'sku',
      value: data.sku,
      error: 'SKU must be 50 characters or less'
    })
  }
  
  // Validate item name length
  if (data.item_name && typeof data.item_name === 'string' && data.item_name.length > 255) {
    errors.push({
      row: rowIndex,
      field: 'item_name',
      value: data.item_name,
      error: 'Item name must be 255 characters or less'
    })
  }
  
  // Validate numeric fields
  const numericFields = ['quantity_sold', 'unit_price', 'current_stock', 'lead_time_days', 'unit_cost']
  numericFields.forEach(field => {
    const value = data[field]
    if (value && value !== '') {
      const numValue = parseFloat(String(value))
      if (isNaN(numValue)) {
        errors.push({
          row: rowIndex,
          field,
          value: String(value),
          error: `${field} must be a valid number`
        })
      } else if (numValue < 0) {
        errors.push({
          row: rowIndex,
          field,
          value: String(value),
          error: `${field} cannot be negative`
        })
      } else if (field === 'lead_time_days' && numValue > 365) {
        errors.push({
          row: rowIndex,
          field,
          value: String(value),
          error: 'Lead time cannot exceed 365 days'
        })
      } else {
        data[field] = numValue
      }
    }
  })
  
  // Validate date format
  if (data.sale_date && data.sale_date !== '') {
    const dateValue = String(data.sale_date)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateValue)) {
      errors.push({
        row: rowIndex,
        field: 'sale_date',
        value: dateValue,
        error: 'sale_date must be in YYYY-MM-DD format (e.g., 2024-01-15)'
      })
    } else {
      // Validate that it's a real date
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowIndex,
          field: 'sale_date',
          value: dateValue,
          error: 'sale_date must be a valid date'
        })
      } else if (date > new Date()) {
        errors.push({
          row: rowIndex,
          field: 'sale_date',
          value: dateValue,
          error: 'sale_date cannot be in the future'
        })
      }
    }
  }
  
  // Validate supplier name length
  if (data.supplier_name && typeof data.supplier_name === 'string' && data.supplier_name.length > 100) {
    errors.push({
      row: rowIndex,
      field: 'supplier_name',
      value: data.supplier_name,
      error: 'Supplier name must be 100 characters or less'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as unknown as ValidatedRowData) : undefined
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    


    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mappingStr = formData.get('mapping') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Parse column mapping if provided
    let columnMapping: Record<string, string> | null = null
    if (mappingStr) {
      try {
        columnMapping = JSON.parse(mappingStr)
      } catch {
        return NextResponse.json(
          { error: 'Invalid mapping format' },
          { status: 400 }
        )
      }
    }
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      )
    }
    
    // Read file content
    const csvText = await file.text()
    
    if (!csvText.trim()) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      )
    }
    
    // Parse CSV
    const rows = parseCSV(csvText)
    
    if (rows.length < 2) {
      return NextResponse.json(
        { error: 'CSV must contain at least a header row and one data row' },
        { status: 400 }
      )
    }
    
    let headers = rows[0].map(h => h.toLowerCase().trim())
    const dataRows = rows.slice(1)
    
    // Apply column mapping if provided
    if (columnMapping) {
      // Create a reverse mapping from CSV headers to our field names
      const reverseMapping: Record<string, string> = {}
      Object.entries(columnMapping).forEach(([fieldKey, csvHeader]) => {
        reverseMapping[csvHeader.toLowerCase().trim()] = fieldKey
      })
      
      // Transform headers using the mapping
      headers = headers.map(header => reverseMapping[header] || header)
    }
    
    // Validate headers
    const requiredHeaders = ['sku', 'item_name']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingHeaders.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Process each row
    const validRows: ValidatedRowData[] = []
    const allErrors: CSVImportError[] = []
    const warnings: string[] = []
    
    dataRows.forEach((row, index) => {
      const rowIndex = index + 2 // +2 because we start from row 2 (after header)
      const validation = validateRow(row, headers, rowIndex)
      
      if (validation.isValid && validation.data) {
        validRows.push({
          ...validation.data,
          user_id: (user as User).id
        })
      } else if (validation.errors) {
        allErrors.push(...validation.errors)
      }
    })
    
    let importedCount = 0
    
    // Import valid rows to database
    if (validRows.length > 0) {
      // Separate inventory items and sales data
      const inventoryItems: Array<{
        user_id: string
        sku: string
        name: string
        current_stock: number
        supplier_id: string | null
        lead_time_days: number | null
        unit_cost: number | null
      }> = []
      const salesData: Array<{
        user_id: string
        sku: string
        quantity_sold: number
        sale_date: string
        unit_price: number | null
      }> = []
      const suppliers: Array<{
        id: string
        user_id: string
        name: string
        lead_time_days: number
      }> = []
      const supplierMap = new Map<string, string>()
      
      for (const row of validRows) {
        // Handle suppliers
        if (row.supplier_name && !supplierMap.has(row.supplier_name)) {
          const supplierId = crypto.randomUUID()
          supplierMap.set(row.supplier_name, supplierId)
          suppliers.push({
            id: supplierId,
            user_id: (user as User).id,
            name: row.supplier_name,
            lead_time_days: row.lead_time_days || 7
          })
        }
        
        // Prepare inventory item
        const inventoryItem = {
          user_id: (user as User).id,
          sku: row.sku,
          name: row.item_name,
          current_stock: row.current_stock || 0,
          supplier_id: row.supplier_name ? (supplierMap.get(row.supplier_name) || null) : null,
          lead_time_days: row.lead_time_days || null,
          unit_cost: row.unit_cost || null
        }
        inventoryItems.push(inventoryItem)
        
        // Prepare sales data if provided
        if (row.quantity_sold && row.sale_date) {
          salesData.push({
            user_id: (user as User).id,
            sku: row.sku,
            quantity_sold: row.quantity_sold,
            sale_date: row.sale_date,
            unit_price: row.unit_price || null
          })
        }
      }
      
      // Insert suppliers first
      if (suppliers.length > 0) {
        const { error: supplierError } = await supabase
          .from('suppliers')
          .upsert(suppliers, { onConflict: 'user_id,name' })
        
        if (supplierError) {
          console.error('Error inserting suppliers:', supplierError)
          const errorMessage = supplierError instanceof Error ? supplierError.message : 'Unknown error'
          warnings.push(`Some supplier data could not be imported: ${errorMessage}`)
        }
      }
      
      // Insert inventory items
      if (inventoryItems.length > 0) {
        const { error: inventoryError } = await supabase
          .from('inventory_items')
          .upsert(inventoryItems, { onConflict: 'user_id,sku' })
        
        if (inventoryError) {
          console.error('Error inserting inventory items:', inventoryError)
          warnings.push(`Some inventory data could not be imported: ${(inventoryError as { message?: string })?.message || 'Unknown error'}`)
        } else {
          importedCount += inventoryItems.length
        }
      }
      
      // Insert sales data
      if (salesData.length > 0) {
        const { error: salesError } = await supabase
          .from('sales_data')
          .insert(salesData)
        
        if (salesError) {
          console.error('Error inserting sales data:', salesError)
          warnings.push(`Some sales data could not be imported: ${salesError.message}`)
        }
      }
    }
    
    // Prepare response
    const result: CSVImportResult = {
      success: importedCount > 0,
      imported_count: importedCount,
      error_count: allErrors.length,
      errors: allErrors,
      warnings
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('CSV import API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}