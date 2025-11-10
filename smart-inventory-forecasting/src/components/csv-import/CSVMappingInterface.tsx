'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVMappingInterfaceProps {
  csvHeaders: string[];
  sampleData: string[][];
  onMappingComplete: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
  description: string;
  type: 'text' | 'number' | 'date';
}

const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    key: 'sku',
    label: 'SKU/Product Code',
    required: true,
    description: 'Unique product identifier',
    type: 'text'
  },
  {
    key: 'item_name',
    label: 'Product Name',
    required: true,
    description: 'Name or description of the product',
    type: 'text'
  },
  {
    key: 'quantity_sold',
    label: 'Quantity Sold',
    required: false,
    description: 'Number of units sold',
    type: 'number'
  },
  {
    key: 'sale_date',
    label: 'Sale Date',
    required: false,
    description: 'Date of sale (YYYY-MM-DD format)',
    type: 'date'
  },
  {
    key: 'unit_price',
    label: 'Unit Price',
    required: false,
    description: 'Selling price per unit',
    type: 'number'
  },
  {
    key: 'current_stock',
    label: 'Current Stock',
    required: false,
    description: 'Current inventory quantity',
    type: 'number'
  },
  {
    key: 'supplier_name',
    label: 'Supplier Name',
    required: false,
    description: 'Name of the supplier',
    type: 'text'
  },
  {
    key: 'lead_time_days',
    label: 'Lead Time (Days)',
    required: false,
    description: 'Supplier lead time in days',
    type: 'number'
  },
  {
    key: 'unit_cost',
    label: 'Unit Cost',
    required: false,
    description: 'Cost price per unit',
    type: 'number'
  }
];

export default function CSVMappingInterface({
  csvHeaders,
  sampleData,
  onMappingComplete,
  onCancel
}: CSVMappingInterfaceProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [autoMappingApplied, setAutoMappingApplied] = useState(false);

  // Auto-mapping logic
  useEffect(() => {
    if (!autoMappingApplied && csvHeaders.length > 0) {
      const autoMapping: Record<string, string> = {};
      
      FIELD_DEFINITIONS.forEach(field => {
        const matchingHeader = csvHeaders.find(header => {
          const normalizedHeader = header.toLowerCase().replace(/[_\s-]/g, '');
          const normalizedField = field.key.toLowerCase().replace(/[_\s-]/g, '');
          
          // Direct match
          if (normalizedHeader === normalizedField) return true;
          
          // Partial matches
          if (field.key === 'sku' && (
            normalizedHeader.includes('sku') ||
            normalizedHeader.includes('code') ||
            normalizedHeader.includes('id')
          )) return true;
          
          if (field.key === 'item_name' && (
            normalizedHeader.includes('name') ||
            normalizedHeader.includes('product') ||
            normalizedHeader.includes('item') ||
            normalizedHeader.includes('description')
          )) return true;
          
          if (field.key === 'quantity_sold' && (
            normalizedHeader.includes('quantity') ||
            normalizedHeader.includes('sold') ||
            normalizedHeader.includes('qty')
          )) return true;
          
          if (field.key === 'sale_date' && (
            normalizedHeader.includes('date') ||
            normalizedHeader.includes('time')
          )) return true;
          
          if (field.key === 'unit_price' && (
            normalizedHeader.includes('price') ||
            normalizedHeader.includes('amount')
          )) return true;
          
          if (field.key === 'current_stock' && (
            normalizedHeader.includes('stock') ||
            normalizedHeader.includes('inventory')
          )) return true;
          
          if (field.key === 'supplier_name' && (
            normalizedHeader.includes('supplier') ||
            normalizedHeader.includes('vendor')
          )) return true;
          
          if (field.key === 'lead_time_days' && (
            normalizedHeader.includes('lead') ||
            normalizedHeader.includes('time')
          )) return true;
          
          if (field.key === 'unit_cost' && (
            normalizedHeader.includes('cost')
          )) return true;
          
          return false;
        });
        
        if (matchingHeader) {
          autoMapping[field.key] = matchingHeader;
        }
      });
      
      // Use a timeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setMapping(autoMapping);
        setAutoMappingApplied(true);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [csvHeaders, autoMappingApplied]);

  const handleMappingChange = (fieldKey: string, csvHeader: string) => {
    setMapping(prev => {
      const newMapping = { ...prev };
      if (csvHeader === '') {
        delete newMapping[fieldKey];
      } else {
        newMapping[fieldKey] = csvHeader;
      }
      return newMapping;
    });
  };

  const getValidationStatus = () => {
    const requiredFields = FIELD_DEFINITIONS.filter(f => f.required);
    const mappedRequiredFields = requiredFields.filter(f => mapping[f.key]);
    
    return {
      isValid: mappedRequiredFields.length === requiredFields.length,
      missingRequired: requiredFields.filter(f => !mapping[f.key])
    };
  };

  const getSampleValue = (csvHeader: string): string => {
    const headerIndex = csvHeaders.indexOf(csvHeader);
    if (headerIndex === -1 || sampleData.length === 0) return '';
    
    // Get first non-empty sample value
    for (const row of sampleData) {
      if (row[headerIndex] && row[headerIndex].trim()) {
        return row[headerIndex].trim();
      }
    }
    
    return '';
  };

  const validation = getValidationStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Map Your CSV Columns</h2>
        <p className="text-gray-600">
          Match your CSV columns to our system fields. Required fields must be mapped to proceed.
        </p>
      </div>

      {/* Validation Status */}
      <div className="mb-6 p-4 rounded-lg border">
        {validation.isValid ? (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            <span className="font-medium">All required fields are mapped</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span className="font-medium">
              Missing required fields: {validation.missingRequired.map(f => f.label).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Mapping Interface */}
      <div className="space-y-4 mb-6">
        {FIELD_DEFINITIONS.map(field => (
          <div key={field.key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-900">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                  {field.type}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{field.description}</p>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select CSV Column --</option>
                  {csvHeaders.map(header => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
              
              {mapping[field.key] && (
                <>
                  <ArrowRight className="text-gray-400" size={20} />
                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-md">
                    <span className="text-sm text-gray-600">Sample: </span>
                    <span className="font-mono text-sm">
                      {getSampleValue(mapping[field.key]) || 'No sample data'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      {Object.keys(mapping).length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Mapping Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {Object.entries(mapping).map(([fieldKey, csvHeader]) => {
              const field = FIELD_DEFINITIONS.find(f => f.key === fieldKey);
              return (
                <div key={fieldKey} className="flex justify-between">
                  <span className="text-gray-600">{field?.label}:</span>
                  <span className="font-mono">{csvHeader}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onMappingComplete(mapping)}
          disabled={!validation.isValid}
          className={`px-6 py-2 rounded-md transition-colors ${
            validation.isValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Apply Mapping & Import
        </button>
      </div>
    </div>
  );
}