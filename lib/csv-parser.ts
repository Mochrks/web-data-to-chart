import Papa from 'papaparse';
import { ColumnSchema, ParseResult, ParseError, detectColumnType } from './data-types';

interface ParseOptions {
  onProgress?: (percent: number) => void;
  maxRows?: number;
  skipEmptyLines?: boolean;
}

/**
 * Parse CSV file with streaming for large files
 * Automatically detects column types and handles errors gracefully
 */
export async function parseCSV(
  file: File,
  options: ParseOptions = {}
): Promise<ParseResult> {
  const { onProgress, maxRows, skipEmptyLines = true } = options;

  return new Promise((resolve, reject) => {
    const results: Record<string, unknown>[] = [];
    const errors: ParseError[] = [];
    let rowCount = 0;
    let bytesProcessed = 0;
    const fileSize = file.size;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines,
      worker: true, // Use web worker for large files
      chunk: (chunk, parser) => {
        // Process each chunk
        for (const row of chunk.data as Record<string, unknown>[]) {
          if (maxRows && rowCount >= maxRows) {
            parser.abort();
            return;
          }

          // Validate row and handle errors
          const validatedRow = validateRow(row);
          if (validatedRow) {
            results.push(validatedRow);
          }
          rowCount++;
        }

        // Update progress
        bytesProcessed += chunk.data.length * 50; // Approximate bytes per row
        if (onProgress) {
          const percent = Math.min(99, (bytesProcessed / fileSize) * 100);
          onProgress(percent);
        }
      },
      complete: () => {
        if (onProgress) onProgress(100);

        // Generate schema from parsed data
        const schema = generateSchema(results);

        resolve({
          data: results,
          schema,
          totalRows: results.length,
          errors,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Parse CSV string directly (for smaller data)
 */
export function parseCSVString(csvString: string): ParseResult {
  const parseResult = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const errors: ParseError[] = [];
  const validatedData = parseResult.data
    .map((row) => validateRow(row as Record<string, unknown>))
    .filter((row): row is Record<string, unknown> => row !== null);

  const schema = generateSchema(validatedData);

  return {
    data: validatedData,
    schema,
    totalRows: validatedData.length,
    errors,
  };
}

/**
 * Validate a single row and collect errors
 */
function validateRow(
  row: Record<string, unknown>
): Record<string, unknown> | null {
  const cleanedRow: Record<string, unknown> = {};
  let hasValues = false;

  for (const [key, value] of Object.entries(row)) {
    // Handle missing values
    if (value === null || value === undefined || value === '') {
      cleanedRow[key] = null;
      // Only report as error if many values are missing
    } else if (typeof value === 'string' && value.trim() === '') {
      cleanedRow[key] = null;
    } else {
      cleanedRow[key] = value;
      hasValues = true;
    }
  }

  // Skip completely empty rows
  if (!hasValues) {
    return null;
  }

  return cleanedRow;
}

/**
 * Generate column schema from parsed data
 */
function generateSchema(data: Record<string, unknown>[]): ColumnSchema[] {
  if (data.length === 0) return [];

  const keys = Object.keys(data[0]);
  
  return keys.map((key, index) => {
    const values = data.map(row => row[key]);
    const detectedType = detectColumnType(values);

    return {
      key,
      label: formatColumnLabel(key),
      type: detectedType,
      visible: true,
      order: index,
    };
  });
}

/**
 * Format column key as human-readable label
 */
function formatColumnLabel(key: string): string {
  return key
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

/**
 * Export data to CSV string
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  columns?: string[]
): string {
  const filteredData = columns
    ? data.map(row => {
        const filtered: Record<string, unknown> = {};
        columns.forEach(col => {
          filtered[col] = row[col];
        });
        return filtered;
      })
    : data;

  return Papa.unparse(filteredData);
}

/**
 * Download data as CSV file
 */
export function downloadCSV(
  data: Record<string, unknown>[],
  filename: string = 'export.csv',
  columns?: string[]
): void {
  const csv = exportToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(url);
}
