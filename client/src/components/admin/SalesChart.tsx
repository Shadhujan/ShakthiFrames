import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesDataPoint {
  date: string;
  sales: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']} />
        <Legend />
        <Line type="monotone" dataKey="sales" stroke="#D4AF37" strokeWidth={2} activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}