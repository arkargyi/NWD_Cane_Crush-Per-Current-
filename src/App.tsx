import React, { useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Rectangle,
} from 'recharts';
import { Activity, Zap, Gauge, Cpu, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon, LayoutDashboard, Download, FileJson, Image as ImageIcon, Search, Plus, Loader2, Upload, Calculator } from 'lucide-react';
import { toPng } from 'html-to-image';

// Initial Filtered data
const initialData = [
  {
    tcd_rate_range: '1500 - 1749',
    max_tcd: 1701.32,
    carrier_current: 106.730,
    tumbler_current: 28.000,
    kicker_current: 26.450,
    data_points: 1,
  },
  {
    tcd_rate_range: '2000 - 2249',
    max_tcd: 2052.83,
    carrier_current: 105.300,
    tumbler_current: 26.600,
    kicker_current: 27.200,
    data_points: 1,
  },
  {
    tcd_rate_range: '2250 - 2499',
    max_tcd: 2362.51,
    carrier_current: 107.535,
    tumbler_current: 29.925,
    kicker_current: 27.000,
    data_points: 2,
  },
  {
    tcd_rate_range: '2750 - 2999',
    max_tcd: 2987.14,
    carrier_current: 104.410,
    tumbler_current: 29.043,
    kicker_current: 27.313,
    data_points: 4,
  },
  {
    tcd_rate_range: '3000 - 3249',
    max_tcd: 3023.55,
    carrier_current: 105.220,
    tumbler_current: 29.065,
    kicker_current: 27.640,
    data_points: 2,
  },
  {
    tcd_rate_range: '3250 - 3499',
    max_tcd: 3388.41,
    carrier_current: 102.720,
    tumbler_current: 28.670,
    kicker_current: 27.110,
    data_points: 1,
  },
  {
    tcd_rate_range: '3500 - 3749',
    max_tcd: 3687.36,
    carrier_current: 106.026,
    tumbler_current: 29.378,
    kicker_current: 27.500,
    data_points: 5,
  },
  {
    tcd_rate_range: '3750 - 3999',
    max_tcd: 3999.71,
    carrier_current: 105.669,
    tumbler_current: 29.915,
    kicker_current: 27.460,
    data_points: 12,
  },
  {
    tcd_rate_range: '4000 - 4249',
    max_tcd: 4237.07,
    carrier_current: 103.448,
    tumbler_current: 30.012,
    kicker_current: 27.810,
    data_points: 17,
  },
  {
    tcd_rate_range: '4250 - 4499',
    max_tcd: 4498.12,
    carrier_current: 104.653,
    tumbler_current: 29.612,
    kicker_current: 27.611,
    data_points: 26,
  },
  {
    tcd_rate_range: '4500 - 4749',
    max_tcd: 4684.71,
    carrier_current: 101.708,
    tumbler_current: 29.865,
    kicker_current: 27.375,
    data_points: 4,
  },
];

// Vibrant, highly visible colors
const COLORS = {
  carrier: '#2563eb', // Vibrant Blue
  tumbler: '#ea580c', // Vibrant Orange
  kicker: '#9333ea',  // Vibrant Purple
  maxTcd: '#e11d48',  // Vibrant Rose/Red
  dataPoints: '#0ea5e9', // Vibrant Sky Blue
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    return (
      <div className="bg-white p-4 shadow-xl border border-slate-200 rounded-xl">
        <p className="text-sm font-bold text-slate-800 mb-2 border-b pb-1">Range: {label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-medium flex justify-between gap-4" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-mono">{typeof entry.value === 'number' ? entry.value.toFixed(3) : entry.value}</span>
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-500 flex justify-between">
              <span>Max TCD:</span>
              <span className="font-mono">{dataPoint.max_tcd.toFixed(2)}</span>
            </p>
            <p className="text-[10px] text-slate-500 flex justify-between">
              <span>Data Points:</span>
              <span className="font-mono">{dataPoint.data_points}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const calculateAggregation = (arr: number[], method: 'Average' | 'Median' | 'Max') => {
  if (!arr || arr.length === 0) return 0;
  if (method === 'Max') return Math.max(...arr);
  if (method === 'Average') return arr.reduce((a, b) => a + b, 0) / arr.length;
  if (method === 'Median') {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return 0;
};

export default function App() {
  const [rawChartData, setRawChartData] = useState(() => initialData.map(d => ({
    tcd_rate_range: d.tcd_rate_range,
    max_tcd: d.max_tcd,
    carrier_currents: Array(d.data_points).fill(d.carrier_current),
    tumbler_currents: Array(d.data_points).fill(d.tumbler_current),
    kicker_currents: Array(d.data_points).fill(d.kicker_current),
    data_points: d.data_points,
  })));
  
  const [aggregation, setAggregation] = useState<'Average' | 'Median' | 'Max'>('Average');
  const [chartStyle, setChartStyle] = useState('bar');
  const [manualTcd, setManualTcd] = useState<string>('');
  const [newEntry, setNewEntry] = useState({ tcd: '', carrier: '', tumbler: '', kicker: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = rawChartData.map(d => ({
    tcd_rate_range: d.tcd_rate_range,
    max_tcd: d.max_tcd,
    carrier_current: calculateAggregation(d.carrier_currents, aggregation),
    tumbler_current: calculateAggregation(d.tumbler_currents, aggregation),
    kicker_current: calculateAggregation(d.kicker_currents, aggregation),
    data_points: d.data_points,
  }));

  const overallMaxTcd = chartData.length > 0 ? Math.max(...chartData.map((d) => d.max_tcd)) : 0;
  const maxCarrierCurrent = chartData.length > 0 ? Math.max(...chartData.map((d) => d.carrier_current)) : 0;
  const maxTumblerCurrent = chartData.length > 0 ? Math.max(...chartData.map((d) => d.tumbler_current)) : 0;
  const maxKickerCurrent = chartData.length > 0 ? Math.max(...chartData.map((d) => d.kicker_current)) : 0;

  const getManualData = (tcd: number) => {
    if (isNaN(tcd)) return null;
    return chartData.find(d => {
      const [min, max] = d.tcd_rate_range.split(' - ').map(Number);
      return tcd >= min && tcd <= max;
    });
  };
  const manualResult = getManualData(parseFloat(manualTcd));

  const handleAddData = (e: React.FormEvent) => {
    e.preventDefault();
    const tcd = parseFloat(newEntry.tcd);
    const carrier = parseFloat(newEntry.carrier);
    const tumbler = parseFloat(newEntry.tumbler);
    const kicker = parseFloat(newEntry.kicker);

    if (isNaN(tcd) || isNaN(carrier) || isNaN(tumbler) || isNaN(kicker)) return;

    setIsLoading(true);

    // Simulate processing delay for visual feedback
    setTimeout(() => {
      const rangeStart = Math.floor(tcd / 250) * 250;
      const rangeStr = `${rangeStart} - ${rangeStart + 249}`;

      setRawChartData(prevData => {
        const existingIndex = prevData.findIndex(d => d.tcd_rate_range === rangeStr);
        let newData = [...prevData];

        if (existingIndex >= 0) {
          const old = newData[existingIndex];
          const newDp = old.data_points + 1;
          newData[existingIndex] = {
            ...old,
            max_tcd: Math.max(old.max_tcd, tcd),
            carrier_currents: [...old.carrier_currents, carrier],
            tumbler_currents: [...old.tumbler_currents, tumbler],
            kicker_currents: [...old.kicker_currents, kicker],
            data_points: newDp
          };
        } else {
          newData.push({
            tcd_rate_range: rangeStr,
            max_tcd: tcd,
            carrier_currents: [carrier],
            tumbler_currents: [tumbler],
            kicker_currents: [kicker],
            data_points: 1
          });
        }

        // Sort by range start
        newData.sort((a, b) => {
          const aStart = parseInt(a.tcd_rate_range.split(' - ')[0]);
          const bStart = parseInt(b.tcd_rate_range.split(' - ')[0]);
          return aStart - bStart;
        });

        return newData;
      });

      // Reset form and loading state
      setNewEntry({ tcd: '', carrier: '', tumbler: '', kicker: '' });
      setIsLoading(false);
      setSuccessMessage(`Successfully added 1 data point for TCD ${tcd}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSVData(text);
    };
    reader.onerror = () => {
      alert("Error reading file");
      setIsLoading(false);
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const processCSVData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      setIsLoading(false);
      return;
    }

    const firstLine = lines[0].toLowerCase();
    // Detect if it's our exported aggregated format or raw data format
    const isAggregated = firstLine.includes('range') || firstLine.includes('data points');
    let startIndex = (firstLine.includes('tcd') || firstLine.includes('carrier')) ? 1 : 0;

    setTimeout(() => {
      const parsedRows: any[] = [];

      for (let i = startIndex; i < lines.length; i++) {
        // Basic CSV split, removing quotes
        const cols = lines[i].split(',').map(c => c.trim().replace(/['"]/g, ''));

        if (isAggregated && cols.length >= 6) {
          const maxTcd = parseFloat(cols[1]);
          const carrier = parseFloat(cols[2]);
          const tumbler = parseFloat(cols[3]);
          const kicker = parseFloat(cols[4]);
          const dp = parseInt(cols[5], 10);

          if (!isNaN(maxTcd) && !isNaN(carrier) && !isNaN(tumbler) && !isNaN(kicker) && !isNaN(dp)) {
            parsedRows.push({ type: 'agg', cols });
          }
        } else if (!isAggregated && cols.length >= 4) {
          const tcd = parseFloat(cols[0]);
          const carrier = parseFloat(cols[1]);
          const tumbler = parseFloat(cols[2]);
          const kicker = parseFloat(cols[3]);

          if (!isNaN(tcd) && !isNaN(carrier) && !isNaN(tumbler) && !isNaN(kicker)) {
            parsedRows.push({ type: 'raw', cols });
          }
        }
      }

      if (parsedRows.length === 0) {
        alert("No valid data rows found in the CSV. Please ensure the format is correct (TCD, Carrier, Tumbler, Kicker).");
        setIsLoading(false);
        return;
      }

      setRawChartData(prevData => {
        let newData = [...prevData];

        parsedRows.forEach(row => {
          if (row.type === 'agg') {
            const cols = row.cols;
            const rangeStr = cols[0];
            const maxTcd = parseFloat(cols[1]);
            const carrier = parseFloat(cols[2]);
            const tumbler = parseFloat(cols[3]);
            const kicker = parseFloat(cols[4]);
            const dp = parseInt(cols[5], 10);

            const existingIndex = newData.findIndex(d => d.tcd_rate_range === rangeStr);
            if (existingIndex >= 0) {
              const old = newData[existingIndex];
              const newDp = old.data_points + dp;
              newData[existingIndex] = {
                ...old,
                max_tcd: Math.max(old.max_tcd, maxTcd),
                carrier_currents: [...old.carrier_currents, ...Array(dp).fill(carrier)],
                tumbler_currents: [...old.tumbler_currents, ...Array(dp).fill(tumbler)],
                kicker_currents: [...old.kicker_currents, ...Array(dp).fill(kicker)],
                data_points: newDp
              };
            } else {
              newData.push({
                tcd_rate_range: rangeStr,
                max_tcd: maxTcd,
                carrier_currents: Array(dp).fill(carrier),
                tumbler_currents: Array(dp).fill(tumbler),
                kicker_currents: Array(dp).fill(kicker),
                data_points: dp
              });
            }
          } else {
            const cols = row.cols;
            const tcd = parseFloat(cols[0]);
            const carrier = parseFloat(cols[1]);
            const tumbler = parseFloat(cols[2]);
            const kicker = parseFloat(cols[3]);

            const rangeStart = Math.floor(tcd / 250) * 250;
            const rangeStr = `${rangeStart} - ${rangeStart + 249}`;
            const existingIndex = newData.findIndex(d => d.tcd_rate_range === rangeStr);

            if (existingIndex >= 0) {
              const old = newData[existingIndex];
              const newDp = old.data_points + 1;
              newData[existingIndex] = {
                ...old,
                max_tcd: Math.max(old.max_tcd, tcd),
                carrier_currents: [...old.carrier_currents, carrier],
                tumbler_currents: [...old.tumbler_currents, tumbler],
                kicker_currents: [...old.kicker_currents, kicker],
                data_points: newDp
              };
            } else {
              newData.push({
                tcd_rate_range: rangeStr,
                max_tcd: tcd,
                carrier_currents: [carrier],
                tumbler_currents: [tumbler],
                kicker_currents: [kicker],
                data_points: 1
              });
            }
          }
        });

        // Sort by range start
        newData.sort((a, b) => {
          const aStart = parseInt(a.tcd_rate_range.split(' - ')[0]);
          const bStart = parseInt(b.tcd_rate_range.split(' - ')[0]);
          return aStart - bStart;
        });

        return newData;
      });

      setSuccessMessage(`Successfully imported ${parsedRows.length} data points!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsLoading(false);
    }, 800);
  };

  const exportToCSV = () => {
    const headers = ['TCD Rate Range', 'Max TCD', 'Carrier Current (A)', 'Tumbler Current (A)', 'Kicker Current (A)', 'Data Points'];
    const csvContent = [
      headers.join(','),
      ...chartData.map(row => [
        `"${row.tcd_rate_range}"`,
        row.max_tcd.toFixed(2),
        row.carrier_current.toFixed(3),
        row.tumbler_current.toFixed(3),
        row.kicker_current.toFixed(3),
        row.data_points
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cane_carrier_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPNG = async () => {
    if (chartRef.current === null) return;
    try {
      const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff', cacheBust: true });
      const link = document.createElement('a');
      link.download = `cane_carrier_chart_${chartStyle}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              MIS Dashboard Cane Carrier Per Current(A) 
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Detailed view of currents by TCD rate ranges (250 intervals)
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Aggregation Selector */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              {(['Average', 'Median', 'Max'] as const).map((agg) => (
                <button
                  key={agg}
                  onClick={() => setAggregation(agg)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    aggregation === agg ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {agg === 'Average' && <Calculator className="w-4 h-4" />}
                  {agg === 'Median' && <Activity className="w-4 h-4" />}
                  {agg === 'Max' && <Gauge className="w-4 h-4" />}
                  {agg}
                </button>
              ))}
            </div>

            {/* Chart Style Selector */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setChartStyle('bar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartStyle === 'bar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Bar
              </button>
              <button
                onClick={() => setChartStyle('line')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartStyle === 'line' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LineChartIcon className="w-4 h-4" />
                Line
              </button>
              <button
                onClick={() => setChartStyle('area')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartStyle === 'area' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AreaChartIcon className="w-4 h-4" />
                Area
              </button>
              <button
                onClick={() => setChartStyle('composed')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartStyle === 'composed' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Composed
              </button>
            </div>

            {/* Export Actions */}
            <div className="flex gap-2">
              <button
                onClick={exportToPNG}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
              >
                <ImageIcon className="w-4 h-4" />
                Export PNG
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </header>

        {/* Success Message Banner */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                <Gauge className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Max TCD</p>
                <p className="text-3xl font-bold text-slate-900">{overallMaxTcd.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Max Carrier</p>
                <p className="text-3xl font-bold text-slate-900">{maxCarrierCurrent.toFixed(3)} A</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-orange-100 p-3 text-orange-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Max Tumbler</p>
                <p className="text-3xl font-bold text-slate-900">{maxTumblerCurrent.toFixed(3)} A</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
                <Cpu className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Max Kicker</p>
                <p className="text-3xl font-bold text-slate-900">{maxKickerCurrent.toFixed(3)} A</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Manual TCD Lookup */}
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200 flex flex-col">
            <label htmlFor="tcd-input" className="block text-sm font-bold text-slate-800 mb-4">Manual TCD Lookup</label>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="tcd-input"
                type="number"
                value={manualTcd}
                onChange={(e) => setManualTcd(e.target.value)}
                placeholder="Enter TCD Rate (e.g., 3600)"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {manualTcd === '' ? (
                <div className="flex items-center justify-center w-full h-[88px] bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p className="text-slate-500 text-sm font-medium">Enter a TCD value to see corresponding currents.</p>
                </div>
              ) : manualResult ? (
                <div className="flex w-full gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex-1 shadow-sm text-center">
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Carrier</p>
                    <p className="text-xl font-black text-blue-900">{manualResult.carrier_current.toFixed(3)} <span className="text-xs font-medium text-blue-700">A</span></p>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex-1 shadow-sm text-center">
                    <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mb-1">Tumbler</p>
                    <p className="text-xl font-black text-orange-900">{manualResult.tumbler_current.toFixed(3)} <span className="text-xs font-medium text-orange-700">A</span></p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex-1 shadow-sm text-center">
                    <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1">Kicker</p>
                    <p className="text-xl font-black text-purple-900">{manualResult.kicker_current.toFixed(3)} <span className="text-xs font-medium text-purple-700">A</span></p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-[88px] bg-rose-50 rounded-xl border border-rose-200">
                  <p className="text-rose-600 text-sm font-medium text-center px-4">No data available for this TCD rate. Try a value between 1500 and 4749.</p>
                </div>
              )}
            </div>
          </div>

          {/* Add New Data Point */}
          <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-slate-800">Add New Data Point</label>
              <div>
                <input
                  type="file"
                  accept=".csv"
                  id="csv-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all shadow-sm"
                  title="Import CSV (Format: TCD, Carrier, Tumbler, Kicker)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Bulk Import CSV
                </label>
              </div>
            </div>
            <form onSubmit={handleAddData} className="flex flex-col flex-1 gap-4">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="any" placeholder="TCD Rate" required value={newEntry.tcd} onChange={e => setNewEntry({...newEntry, tcd: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm text-sm" />
                <input type="number" step="any" placeholder="Carrier (A)" required value={newEntry.carrier} onChange={e => setNewEntry({...newEntry, carrier: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm text-sm" />
                <input type="number" step="any" placeholder="Tumbler (A)" required value={newEntry.tumbler} onChange={e => setNewEntry({...newEntry, tumbler: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm text-sm" />
                <input type="number" step="any" placeholder="Kicker (A)" required value={newEntry.kicker} onChange={e => setNewEntry({...newEntry, kicker: e.target.value})} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm text-sm" />
              </div>
              <button type="submit" className="mt-auto w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Add to Dataset
              </button>
            </form>
          </div>
        </div>

        {/* Main Chart Display */}
        <div ref={chartRef} className="space-y-8 p-4 bg-slate-100 rounded-3xl relative">
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100/70 backdrop-blur-sm rounded-3xl">
              <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                <p className="text-slate-700 font-bold text-lg animate-pulse">Processing Data...</p>
              </div>
            </div>
          )}

          {/* Style 1: Bar Chart */}
          {chartStyle === 'bar' && (
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Bar Chart (Comparison)</h2>
                <p className="text-slate-500 text-sm">Best for directly comparing the exact values of Carrier, Tumbler, and Kicker currents side-by-side.</p>
              </div>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="tcd_rate_range" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                      dy={15}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                    <Legend wrapperStyle={{ paddingTop: '30px' }} iconType="circle" />
                    <Bar 
                      dataKey="carrier_current" 
                      name="Carrier Current (A)" 
                      fill={COLORS.carrier} 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={40}
                      activeBar={<Rectangle fill="#1e40af" stroke="#1e3a8a" />}
                    />
                    <Bar 
                      dataKey="tumbler_current" 
                      name="Tumbler Current (A)" 
                      fill={COLORS.tumbler} 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={40}
                      activeBar={<Rectangle fill="#c2410c" stroke="#9a3412" />}
                    />
                    <Bar 
                      dataKey="kicker_current" 
                      name="Kicker Current (A)" 
                      fill={COLORS.kicker} 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={40}
                      activeBar={<Rectangle fill="#7e22ce" stroke="#6b21a8" />}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Style 2: Line Chart */}
          {chartStyle === 'line' && (
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Line Chart (Trend Analysis)</h2>
                <p className="text-slate-500 text-sm">Best for observing the continuous trend and growth rate of currents as TCD increases.</p>
              </div>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="tcd_rate_range" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                      dy={15}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '30px' }} iconType="circle" />
                    <Line type="monotone" dataKey="carrier_current" name="Carrier Current (A)" stroke={COLORS.carrier} strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="tumbler_current" name="Tumbler Current (A)" stroke={COLORS.tumbler} strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="kicker_current" name="Kicker Current (A)" stroke={COLORS.kicker} strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Style 3: Area Chart */}
          {chartStyle === 'area' && (
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Area Chart (Volume & Overlap)</h2>
                <p className="text-slate-500 text-sm">Best for visualizing the overall volume and overlapping magnitude of the different currents.</p>
              </div>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <defs>
                      <linearGradient id="colorCarrier" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.carrier} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.carrier} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTumbler" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.tumbler} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.tumbler} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorKicker" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.kicker} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.kicker} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="tcd_rate_range" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                      dy={15}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '30px' }} iconType="circle" />
                    <Area type="monotone" dataKey="carrier_current" name="Carrier Current (A)" stroke={COLORS.carrier} strokeWidth={3} fillOpacity={1} fill="url(#colorCarrier)" />
                    <Area type="monotone" dataKey="kicker_current" name="Kicker Current (A)" stroke={COLORS.kicker} strokeWidth={3} fillOpacity={1} fill="url(#colorKicker)" />
                    <Area type="monotone" dataKey="tumbler_current" name="Tumbler Current (A)" stroke={COLORS.tumbler} strokeWidth={3} fillOpacity={1} fill="url(#colorTumbler)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Style 4: Composed Chart */}
          {chartStyle === 'composed' && (
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Max TCD & Data Points Distribution</h2>
                <p className="text-slate-500 text-sm">Shows the maximum TCD reached in each range alongside the volume of data points collected.</p>
              </div>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="tcd_rate_range" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                      dy={15}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                      domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '30px' }} iconType="circle" />
                    <Bar yAxisId="right" dataKey="data_points" name="Data Points" fill={COLORS.dataPoints} radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.8} />
                    <Line yAxisId="left" type="monotone" dataKey="max_tcd" name="Max TCD" stroke={COLORS.maxTcd} strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden mt-8">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Detailed Data Table ({aggregation})</h2>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
            >
              <FileJson className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600 font-bold">
                <tr>
                  <th className="px-6 py-4">TCD Rate Range</th>
                  <th className="px-6 py-4">Max TCD</th>
                  <th className="px-6 py-4 text-blue-700">Carrier Current (A)</th>
                  <th className="px-6 py-4 text-orange-700">Tumbler Current (A)</th>
                  <th className="px-6 py-4 text-purple-700">Kicker Current (A)</th>
                  <th className="px-6 py-4 text-sky-700">Data Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {chartData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{row.tcd_rate_range}</td>
                    <td className="px-6 py-4 font-mono font-medium">{row.max_tcd.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono font-medium text-blue-700">{row.carrier_current.toFixed(3)}</td>
                    <td className="px-6 py-4 font-mono font-medium text-orange-700">{row.tumbler_current.toFixed(3)}</td>
                    <td className="px-6 py-4 font-mono font-medium text-purple-700">{row.kicker_current.toFixed(3)}</td>
                    <td className="px-6 py-4 font-mono font-medium text-sky-700">{row.data_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <a
            href="https://arkarsoe-profolio-showcase.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block group"
          >
            <span className="text-lg font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 drop-shadow-sm group-hover:drop-shadow-md group-hover:brightness-110 transition-all duration-300">
              Created By AKS_Tech Channel
            </span>
            <div className="h-0.5 w-0 bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 group-hover:w-full transition-all duration-300 mx-auto mt-1 rounded-full"></div>
          </a>
        </footer>
      </div>
    </div>
  );
}
