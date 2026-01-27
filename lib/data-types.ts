// Type definitions for data visualization application

// Column schema and data types
export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'unknown';

export interface ColumnSchema {
  key: string;
  label: string;
  type: DataType;
  visible: boolean;
  order: number;
  format?: FormatConfig;
}

export interface FormatConfig {
  type: 'none' | 'number' | 'currency' | 'percentage' | 'date';
  decimals?: number;
  currency?: string;
  dateFormat?: string;
}

// Parsed data result
export interface ParseResult {
  data: Record<string, unknown>[];
  schema: ColumnSchema[];
  totalRows: number;
  errors: ParseError[];
}

export interface ParseError {
  row: number;
  message: string;
  type: 'missing_value' | 'invalid_type' | 'parse_error';
}

// Chart configuration
export type ChartType =
  | 'line'
  | 'bar'
  | 'stackedBar'
  | 'area'
  | 'stackedArea'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'scatter'
  | 'bubble'
  | 'histogram'
  | 'heatmap'
  | 'treemap'
  | 'candlestick'
  | 'mixed';

export interface ChartConfig {
  type: ChartType;
  xAxis: string;
  yAxes: string[];
  showLegend: boolean;
  enableZoom: boolean;
  title?: string;
  colorScheme: string;
}

export interface ChartTypeInfo {
  type: ChartType;
  label: string;
  icon: string;
  description: string;
  requiresNumericY: boolean;
  supportsMultipleY: boolean;
  requiresNumericX?: boolean;
}

// Chart type metadata
export const CHART_TYPES: ChartTypeInfo[] = [
  { type: 'line', label: 'Line Chart', icon: '📈', description: 'Show trends over time', requiresNumericY: true, supportsMultipleY: true },
  { type: 'bar', label: 'Bar Chart', icon: '📊', description: 'Compare categories', requiresNumericY: true, supportsMultipleY: true },
  { type: 'stackedBar', label: 'Stacked Bar', icon: '📊', description: 'Compare parts of a whole', requiresNumericY: true, supportsMultipleY: true },
  { type: 'area', label: 'Area Chart', icon: '📉', description: 'Show cumulative trends', requiresNumericY: true, supportsMultipleY: true },
  { type: 'stackedArea', label: 'Stacked Area', icon: '📉', description: 'Show cumulative parts', requiresNumericY: true, supportsMultipleY: true },
  { type: 'pie', label: 'Pie Chart', icon: '🥧', description: 'Show proportions', requiresNumericY: true, supportsMultipleY: false },
  { type: 'donut', label: 'Donut Chart', icon: '🍩', description: 'Show proportions with center', requiresNumericY: true, supportsMultipleY: false },
  { type: 'radar', label: 'Radar Chart', icon: '🎯', description: 'Compare multiple variables', requiresNumericY: true, supportsMultipleY: true },
  { type: 'scatter', label: 'Scatter Plot', icon: '🔘', description: 'Show correlation', requiresNumericY: true, supportsMultipleY: false, requiresNumericX: true },
  { type: 'bubble', label: 'Bubble Chart', icon: '🔵', description: 'Show 3 dimensions', requiresNumericY: true, supportsMultipleY: false, requiresNumericX: true },
  { type: 'histogram', label: 'Histogram', icon: '📶', description: 'Show distribution', requiresNumericY: true, supportsMultipleY: false },
  { type: 'heatmap', label: 'Heatmap', icon: '🔥', description: 'Show intensity matrix', requiresNumericY: true, supportsMultipleY: false },
  { type: 'treemap', label: 'Treemap', icon: '🗺️', description: 'Show hierarchical data', requiresNumericY: true, supportsMultipleY: false },
  { type: 'candlestick', label: 'Candlestick', icon: '📊', description: 'Show OHLC data', requiresNumericY: true, supportsMultipleY: false },
  { type: 'mixed', label: 'Mixed Chart', icon: '📈📊', description: 'Combine line and bar', requiresNumericY: true, supportsMultipleY: true },
];

// Color schemes for charts
export const COLOR_SCHEMES = {
  default: [
    'hsl(262, 83%, 58%)', // Purple
    'hsl(200, 98%, 39%)', // Blue
    'hsl(293, 69%, 49%)', // Pink
    'hsl(43, 96%, 56%)',  // Amber
    'hsl(160, 84%, 39%)', // Emerald
    'hsl(24, 95%, 53%)',  // Orange
    'hsl(346, 77%, 49%)', // Rose
    'hsl(173, 80%, 40%)', // Teal
  ],
  pastel: [
    'hsl(262, 70%, 75%)',
    'hsl(200, 80%, 70%)',
    'hsl(293, 60%, 75%)',
    'hsl(43, 90%, 75%)',
    'hsl(160, 70%, 70%)',
    'hsl(24, 85%, 70%)',
    'hsl(346, 65%, 70%)',
    'hsl(173, 70%, 65%)',
  ],
  vibrant: [
    'hsl(262, 90%, 55%)',
    'hsl(200, 100%, 45%)',
    'hsl(293, 80%, 55%)',
    'hsl(43, 100%, 50%)',
    'hsl(160, 90%, 35%)',
    'hsl(24, 100%, 50%)',
    'hsl(346, 85%, 50%)',
    'hsl(173, 90%, 35%)',
  ],
  monochrome: [
    'hsl(262, 83%, 35%)',
    'hsl(262, 83%, 45%)',
    'hsl(262, 83%, 55%)',
    'hsl(262, 83%, 65%)',
    'hsl(262, 83%, 75%)',
    'hsl(262, 83%, 85%)',
    'hsl(262, 83%, 25%)',
    'hsl(262, 83%, 95%)',
  ],
};

// Format utilities
export function formatValue(value: unknown, format?: FormatConfig): string {
  if (value === null || value === undefined) return '-';
  
  if (!format || format.type === 'none') {
    return String(value);
  }

  const numValue = typeof value === 'number' ? value : parseFloat(String(value));
  
  if (isNaN(numValue)) return String(value);

  switch (format.type) {
    case 'number':
      return numValue.toLocaleString('en-US', {
        minimumFractionDigits: format.decimals ?? 0,
        maximumFractionDigits: format.decimals ?? 2,
      });
    
    case 'currency':
      return numValue.toLocaleString('en-US', {
        style: 'currency',
        currency: format.currency ?? 'USD',
        minimumFractionDigits: format.decimals ?? 2,
        maximumFractionDigits: format.decimals ?? 2,
      });
    
    case 'percentage':
      return (numValue * 100).toLocaleString('en-US', {
        minimumFractionDigits: format.decimals ?? 1,
        maximumFractionDigits: format.decimals ?? 1,
      }) + '%';
    
    case 'date':
      const date = new Date(value as string | number);
      if (isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    
    default:
      return String(value);
  }
}

// Detect data type from value
export function detectType(value: unknown): DataType {
  if (value === null || value === undefined || value === '') {
    return 'unknown';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'number' && !isNaN(value)) {
    return 'number';
  }

  const strValue = String(value).trim();

  // Check for boolean strings
  if (['true', 'false', 'yes', 'no', '1', '0'].includes(strValue.toLowerCase())) {
    return 'boolean';
  }

  // Check for number
  const numValue = parseFloat(strValue.replace(/,/g, ''));
  if (!isNaN(numValue) && isFinite(numValue)) {
    return 'number';
  }

  // Check for date
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\w{3}\s\d{1,2},?\s\d{4}$/, // Mon DD, YYYY
  ];

  if (datePatterns.some(pattern => pattern.test(strValue)) || !isNaN(Date.parse(strValue))) {
    return 'date';
  }

  return 'string';
}

// Detect column type from sample values
export function detectColumnType(values: unknown[]): DataType {
  const sampleSize = Math.min(100, values.length);
  const sample = values.slice(0, sampleSize).filter(v => v !== null && v !== undefined && v !== '');
  
  if (sample.length === 0) return 'unknown';

  const types = sample.map(detectType);
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<DataType, number>);

  // Get the most common type (excluding unknown)
  let maxType: DataType = 'string';
  let maxCount = 0;
  
  for (const [type, count] of Object.entries(typeCounts)) {
    if (type !== 'unknown' && count > maxCount) {
      maxType = type as DataType;
      maxCount = count;
    }
  }

  return maxType;
}
