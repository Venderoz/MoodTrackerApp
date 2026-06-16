import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import styles from './TopTagsChart.module.css';

export default function TopTagsChart({ entries }) {
    const processData = () => {
        const tagCounts = {};

        entries.forEach(entry => {
            const tags = entry.labelNames || entry.labels || entry.tags || [];

            if (Array.isArray(tags)) {
                tags.forEach(tag => {
                    let tagName = null;
                    let tagColor = null;

                    if (typeof tag === 'string') {
                        tagName = tag;
                        tagColor = '#a855f7';
                    } else if (typeof tag === 'object' && tag !== null) {
                        tagName = tag.name || (tag.label && tag.label.name);
                        tagColor = tag.colorHex || tag.color || (tag.label && (tag.label.colorHex || tag.label.color));
                    }

                    if (tagName) {
                        if (!tagCounts[tagName]) {
                            tagCounts[tagName] = { name: tagName, value: 0, color: tagColor || '#a855f7' };
                        }
                        tagCounts[tagName].value += 1;
                    }
                });
            }
        });

        return Object.values(tagCounts)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    };

    const data = processData();

    return (
        <div className={styles.chartBox}>
            <h3>Top Factors</h3>

            {data.length > 0 ? (
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Legend
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                                iconType="circle"
                                wrapperStyle={{ fontSize: '13px', paddingLeft: '10px' }}
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