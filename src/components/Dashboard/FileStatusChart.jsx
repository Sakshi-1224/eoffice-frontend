import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FileStatusChart = ({ stats }) => {
  // 1. Transform your stats object into an array for the chart
  const data = [
    { name: 'Pending', value: stats?.pending || 0, color: '#f59e0b' }, // Amber (Warning)
    { name: 'Created', value: stats?.created || 0, color: '#0d9488' }, // Teal (Primary)
    { name: 'Approved', value: stats?.approved || 0, color: '#10b981' }, // Emerald (Success)
    { name: 'Rejected', value: stats?.rejected || 0, color: '#f43f5e' }, // Rose (Danger)
  ];

  // Filter out zero values so the chart looks clean
  const activeData = data.filter(item => item.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <p className="text-sm">No file data available to display.</p>
      </div>
    );
  }

  // Custom Tooltip Design
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="text-sm font-bold text-slate-700">{payload[0].name}</p>
          <p className="text-xs text-slate-500">
            Count: <span className="font-mono font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={activeData}
          cx="50%"
          cy="50%"
          innerRadius={60} // Makes it a Doughnut Chart
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {activeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle"
          formatter={(value) => <span className="text-slate-600 text-xs font-medium ml-1">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default FileStatusChart;