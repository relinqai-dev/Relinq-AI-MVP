'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { CSVImportResult } from '@/types/business';
import CSVMappingInterface from './CSVMappingInterface';

interface CSVUploadComponentProps {
  onUploadComplete?: (result: CSVImportResult) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

export default function CSVUploadComponent({
  onUploadComplete,
  acceptedFileTypes = ['.csv'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  className = ''
}: CSVUploadComponentProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error' | 'mapping'>('idle');
  const [uploadResult, setUploadResult] = useState<CSVImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][]; file: File } | null>(null);

  // CSV parsing utility
  const parseCSV = (csvText: string): { headers: string[]; rows: string[][] } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const result: string[][] = [];
    
    for (const line of lines) {
      const row: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      row.push(current.trim());
      result.push(row);
    }
    
    if (result.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    return {
      headers: result[0],
      rows: result.slice(1)
    };
  };

  const uploadFile = useCallback(async (file: File, mapping?: Record<string, string>) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (mapping) {
        formData.append('mapping', JSON.stringify(mapping));
      }

      const response = await fetch('/api/csv-import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result: CSVImportResult = await response.json();
      setUploadResult(result);
      setUploadStatus(result.success ? 'success' : 'error');
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('error');
    }
  }, [onUploadComplete]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      // Read and parse CSV to check if mapping is needed
      const csvText = await file.text();
      const { headers, rows } = parseCSV(csvText);
      
      // Check if headers match our standard format
      const standardHeaders = ['sku', 'item_name', 'quantity_sold', 'sale_date', 'unit_price', 'current_stock', 'supplier_name', 'lead_time_days', 'unit_cost'];
      const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
      
      const hasStandardFormat = standardHeaders.every(sh => 
        normalizedHeaders.includes(sh) || !['sku', 'item_name'].includes(sh) // Only require essential fields
      ) && ['sku', 'item_name'].every(required => normalizedHeaders.includes(required));
      
      if (hasStandardFormat) {
        // Direct upload with standard format
        await uploadFile(file);
      } else {
        // Show mapping interface
        setCsvData({ headers, rows: rows.slice(0, 5), file }); // Only show first 5 rows for preview
        setUploadStatus('mapping');
      }
    } catch (error) {
      console.error('CSV parsing error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse CSV file');
      setUploadStatus('error');
    }
  }, [uploadFile]);

  const handleMappingComplete = async (mapping: Record<string, string>) => {
    if (!csvData) return;
    
    setUploadStatus('uploading');
    await uploadFile(csvData.file, mapping);
  };

  const handleMappingCancel = () => {
    setCsvData(null);
    setUploadStatus('idle');
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': acceptedFileTypes,
    },
    maxSize: maxFileSize,
    multiple: false,
  });

  const downloadTemplate = () => {
    // Create and download CSV template
    const csvContent = `sku,item_name,quantity_sold,sale_date,unit_price,current_stock,supplier_name,lead_time_days,unit_cost
PROD001,Sample Product 1,10,2024-01-15,29.99,50,Supplier A,7,15.00
PROD002,Sample Product 2,5,2024-01-15,49.99,25,Supplier B,14,25.00
PROD003,Sample Product 3,8,2024-01-16,19.99,100,Supplier A,7,10.00`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_sales_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setUploadResult(null);
    setErrorMessage('');
  };

  // Show mapping interface if needed
  if (uploadStatus === 'mapping' && csvData) {
    return (
      <CSVMappingInterface
        csvHeaders={csvData.headers}
        sampleData={csvData.rows}
        onMappingComplete={handleMappingComplete}
        onCancel={handleMappingCancel}
      />
    );
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Template Download Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-900">Need a template?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Download our standardized CSV template to ensure proper formatting
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Download Template
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : uploadStatus === 'error' 
              ? 'border-red-300 bg-red-50'
              : uploadStatus === 'success'
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {uploadStatus === 'uploading' ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Uploading and processing your CSV file...</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <p className="text-green-700 font-medium">Upload successful!</p>
            <p className="text-sm text-gray-600 mt-2">
              Imported {uploadResult?.imported_count} records
              {uploadResult?.error_count ? ` with ${uploadResult.error_count} errors` : ''}
            </p>
            <button
              onClick={resetUpload}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Upload Another File
            </button>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <p className="text-red-700 font-medium">Upload failed</p>
            <p className="text-sm text-gray-600 mt-2">{errorMessage}</p>
            <button
              onClick={resetUpload}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {isDragActive ? (
              <>
                <Upload className="h-12 w-12 text-blue-600 mb-4" />
                <p className="text-blue-700 font-medium">Drop your CSV file here</p>
              </>
            ) : (
              <>
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-700 font-medium">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports CSV files up to {Math.round(maxFileSize / (1024 * 1024))}MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">File rejected:</h4>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="text-sm text-red-700">
              <p className="font-medium">{file.name}</p>
              <ul className="list-disc list-inside ml-2">
                {errors.map((error) => (
                  <li key={error.code}>{error.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && uploadStatus === 'success' && uploadResult.errors.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            Import completed with {uploadResult.errors.length} errors:
          </h4>
          <div className="max-h-40 overflow-y-auto">
            {uploadResult.errors.map((error, index) => (
              <div key={index} className="text-sm text-yellow-700 mb-1">
                Row {error.row}: {error.field} - {error.error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {uploadResult && uploadResult.warnings.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Warnings:</h4>
          <ul className="list-disc list-inside text-sm text-blue-700">
            {uploadResult.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}