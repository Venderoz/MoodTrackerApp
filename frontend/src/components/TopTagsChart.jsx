import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from './css_modules/TopTagsChart.module.css';

export default function TopTagsChart({ data }) {
    const renderCustomLegend = (props) => {
        const { payload } = props;
        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span 
                            style={{ 
                                display: 'inline-block', width: '12px', height: '12px', 
                                backgroundColor: entry.color, borderRadius: '50%' 
                            }} 
                        />
                        <span style={{ color: 'var(--text-primary)', fontSize: '15px', fontWeight: '500' }}>
                            {entry.value}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className={styles.chartBox}>
            <h3>Top Factors</h3>

            {data && data.length > 0 ? (
                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="45%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Legend
                                content={renderCustomLegend}
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className={styles.placeholder}>No factors logged yet.</div>
            )}
        </div>
    );
}