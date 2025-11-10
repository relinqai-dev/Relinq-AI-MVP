'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Upload, AlertTriangle } from 'lucide-react';
import CSVUploadComponent from '@/components/csv-import/CSVUploadComponent';
import { CSVImportResult } from '@/types/business';

export default function ImportClient() {
  const router = useRouter();
  const [importComplete, setImportComplete] = useState(false);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);

  const handleUploadComplete = (result: CSVImportResult) => {
    setImportResult(result);
    setImportComplete(true);
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleImportAnother = () => {
    setImportComplete(false);
    setImportResult(null);
  };

  if (importComplete && importResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Import Complete</h1>
          </div>

          {/* Import Results */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            {importResult.success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Successfully Imported!
                </h2>
                <p className="text-gray-600 mb-6">
                  {importResult.imported_count} records have been imported into your inventory system.
                </p>
                
                {importResult.error_count > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h3 className="font-medium text-yellow-800">
                        {importResult.error_count} rows had errors and were skipped
                      </h3>
                    </div>
                    <div className="max-h-40 overflow-y-auto text-left">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm text-yellow-700 mb-1">
                          Row {error.row}: {error.field} - {error.error}
                        </div>
                      ))}
                      {importResult.errors.length > 10 && (
                        <div className="text-sm text-yellow-600 italic">
                          ... and {importResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {importResult.warnings.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-blue-800 mb-2">Warnings:</h3>
                    <ul className="text-left text-sm text-blue-700 space-y-1">
                      {importResult.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleImportAnother}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Import Another File
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continue to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Import Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  There were issues with your CSV file that prevented import.
                </p>
                
                {importResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-red-800 mb-2">Errors found:</h3>
                    <div className="max-h-40 overflow-y-auto text-left">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700 mb-1">
                          Row {error.row}: {error.field} - {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleImportAnother}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Import Data</h1>
          <p className="text-gray-600 mt-2">
            Upload your inventory and sales data via CSV file
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                CSV Import Instructions
              </h2>
              <div className="text-gray-600 space-y-2">
                <p>
                  Upload a CSV file containing your inventory and sales data. The system supports:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Standard format with predefined columns</li>
                  <li>Custom format with column mapping interface</li>
                  <li>Automatic data validation and error reporting</li>
                  <li>Duplicate detection and supplier management</li>
                </ul>
                <p className="mt-3">
                  <strong>Required fields:</strong> SKU and Product Name
                </p>
                <p>
                  <strong>Optional fields:</strong> Quantity Sold, Sale Date, Unit Price, Current Stock, 
                  Supplier Name, Lead Time, Unit Cost
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Component */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <CSVUploadComponent
            onUploadComplete={handleUploadComplete}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}