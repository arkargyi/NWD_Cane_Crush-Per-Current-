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
import { Activity, Zap, Gauge, Cpu, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon, LayoutDashboard, Download, FileJson, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';

// Filtered data: Removed zero-value ranges '1750 - 1999' and '2500 - 2749'
const data = [
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

export default function App() {
  const [chartStyle, setChartStyle] = useState('bar');
  const chartRef = useRef<HTMLDivElement>(null);

  const overallMaxTcd = Math.max(...data.map((d) => d.max_tcd));
  const maxCarrierCurrent = Math.max(...data.map((d) => d.carrier_current));
  const maxTumblerCurrent = Math.max(...data.map((d) => d.tumbler_current));
  const maxKickerCurrent = Math.max(...data.map((d) => d.kicker_current));

  const exportToCSV = () => {
    const headers = ['TCD Rate Range', 'Max TCD', 'Carrier Current (A)', 'Tumbler Current (A)', 'Kicker Current (A)', 'Data Points'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
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
              Cane Carrier Current Analysis
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Detailed view of currents by TCD rate ranges (250 intervals)
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
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

        {/* Main Chart Display */}
        <div ref={chartRef} className="space-y-8 p-4 bg-slate-100 rounded-3xl">
          
          {/* Style 1: Bar Chart */}
          {chartStyle === 'bar' && (
            <div className="rounded-2xl bg-white p-6 shadow-md border border-slate-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Bar Chart (Comparison)</h2>
                <p className="text-slate-500 text-sm">Best for directly comparing the exact values of Carrier, Tumbler, and Kicker currents side-by-side.</p>
              </div>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
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
                  <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
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
                  <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
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
                  <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
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
            <h2 className="text-xl font-bold text-slate-800">Detailed Data Table</h2>
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
                {data.map((row, i) => (
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
      </div>
    </div>
  );
}
