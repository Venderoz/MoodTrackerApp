import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import styles from './css_modules/MoodTrendChart.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
          {label}
        </p>
        {payload.map((item, index) => (
          <p key={index} style={{ margin: '4px 0', color: item.color, fontWeight: 'bold', fontSize: '13px' }}>
            {item.name}: {item.value} {item.dataKey === 'sleep' ? 'h' : '/ 5'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MoodTrendChart({ entries }) {
  const data = [...entries]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(e => ({
      dateStr: new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood: e.moodLevel,
      sleep: e.sleepDuration || 0,
    }));

  return (
    <div className={styles.chartBox}>
      <h3>Mood & Sleep Trend</h3>

      {data.length > 0 ? (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />

              <XAxis
                dataKey="dateStr"
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                dy={10}
                interval={data.length > 15 ? 'preserveStartEnd' : 0}
                minTickGap={20} 
              />

              <YAxis
                yAxisId="left"
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 16]}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                dx={10}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
              />

              <Bar
                yAxisId="right"
                name="Sleep"
                dataKey="sleep"
                fill="#a855f7"
                fillOpacity={0.2}
                radius={[4, 4, 0, 0]}
              />

              <Line
                yAxisId="left"
                name="Mood"
                type="monotone"
                dataKey="mood"
                stroke="#2ecc71"
                strokeWidth={3}
                dot={{ r: 4, fill: '#2ecc71', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles.placeholder}>No entries found for the selected timeframe.</div>
      )}
    </div>
  );
}