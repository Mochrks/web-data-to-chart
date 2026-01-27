import html2canvas from 'html2canvas';
import { COLOR_SCHEMES, ChartType } from './data-types';

/**
 * Get colors for chart based on scheme and count
 */
export function getChartColors(
  count: number,
  scheme: keyof typeof COLOR_SCHEMES = 'default'
): string[] {
  const colors = COLOR_SCHEMES[scheme];
  const result: string[] = [];
  
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
}

/**
 * Convert HSL to RGBA with alpha
 */
export function hslToRgba(hsl: string, alpha: number = 1): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hsl;

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}

/**
 * Aggregate data for charts
 */
export function aggregateData<T extends Record<string, unknown>>(
  data: T[],
  groupBy: string,
  valueKeys: string[],
  aggregationType: 'sum' | 'avg' | 'count' | 'min' | 'max' = 'sum'
): { labels: string[]; datasets: { key: string; values: number[] }[] } {
  const groups = new Map<string, { count: number; values: Record<string, number[]> }>();

  // Group data
  for (const row of data) {
    const key = String(row[groupBy] ?? 'Unknown');
    
    if (!groups.has(key)) {
      groups.set(key, { count: 0, values: {} });
      valueKeys.forEach(vk => {
        groups.get(key)!.values[vk] = [];
      });
    }

    const group = groups.get(key)!;
    group.count++;
    
    valueKeys.forEach(vk => {
      const val = Number(row[vk]) || 0;
      group.values[vk].push(val);
    });
  }

  // Calculate aggregated values
  const labels = Array.from(groups.keys());
  const datasets = valueKeys.map(key => ({
    key,
    values: labels.map(label => {
      const group = groups.get(label)!;
      const values = group.values[key];
      
      switch (aggregationType) {
        case 'sum':
          return values.reduce((a, b) => a + b, 0);
        case 'avg':
          return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        case 'count':
          return group.count;
        case 'min':
          return Math.min(...values);
        case 'max':
          return Math.max(...values);
        default:
          return 0;
      }
    }),
  }));

  return { labels, datasets };
}

/**
 * Calculate histogram bins
 */
export function calculateHistogramBins(
  values: number[],
  binCount: number = 10
): { bins: { min: number; max: number; count: number; label: string }[] } {
  if (values.length === 0) return { bins: [] };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount;

  const bins = Array.from({ length: binCount }, (_, i) => ({
    min: min + i * binWidth,
    max: min + (i + 1) * binWidth,
    count: 0,
    label: `${(min + i * binWidth).toFixed(1)} - ${(min + (i + 1) * binWidth).toFixed(1)}`,
  }));

  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
    if (binIndex >= 0 && binIndex < binCount) {
      bins[binIndex].count++;
    }
  });

  return { bins };
}

/**
 * Export chart as PNG
 */
export async function exportChartAsPNG(
  elementId: string,
  filename: string = 'chart.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // Higher resolution
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Export chart as SVG (for Recharts)
 */
export function exportChartAsSVG(
  elementId: string,
  filename: string = 'chart.svg'
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const svgElement = element.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG element found in chart');
  }

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Validate if columns are compatible with chart type
 */
export function validateChartConfig(
  chartType: ChartType,
  xAxisType: string,
  yAxisTypes: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check Y-axis requirements
  const numericYRequired: ChartType[] = [
    'line', 'bar', 'stackedBar', 'area', 'stackedArea',
    'pie', 'donut', 'radar', 'scatter', 'bubble',
    'histogram', 'heatmap', 'treemap', 'candlestick', 'mixed'
  ];

  if (numericYRequired.includes(chartType)) {
    const hasNonNumericY = yAxisTypes.some(t => t !== 'number');
    if (hasNonNumericY) {
      errors.push('Y-axis columns must be numeric for this chart type');
    }
  }

  // Check X-axis requirements for scatter/bubble
  if (['scatter', 'bubble'].includes(chartType) && xAxisType !== 'number') {
    errors.push('X-axis must be numeric for scatter and bubble charts');
  }

  // Check multiple Y-axis support
  const singleYOnly: ChartType[] = ['pie', 'donut', 'histogram', 'heatmap'];
  if (singleYOnly.includes(chartType) && yAxisTypes.length > 1) {
    errors.push('This chart type only supports a single Y-axis column');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate optimal tick count for axis
 */
export function calculateTickCount(dataLength: number): number {
  if (dataLength <= 10) return dataLength;
  if (dataLength <= 50) return 10;
  if (dataLength <= 100) return 15;
  return 20;
}

/**
 * Format large numbers for display
 */
export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(1) + 'B';
  }
  if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(1) + 'M';
  }
  if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(1) + 'K';
  }
  return value.toFixed(0);
}
