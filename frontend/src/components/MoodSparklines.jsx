import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Smile, Moon } from 'lucide-react';
import styles from './MoodSparklines.module.css';

const MiniTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            const isSleep = payload[0].dataKey === 'sleep';
            return (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>{dataPoint.dateStr}:</span>
                    <strong style={{ color: payload[0].color }}>
                        {dataPoint[payload[0].dataKey]} {isSleep ? 'h' : '/ 5'}
                    </strong>
                </div>
            );
        }
        return null;
    };

export default function MoodSparklines({ entries }) {
    const processData = () => {
        const sorted = [...entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const dailyData = {};
        sorted.forEach(entry => {
            const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            dailyData[dateStr] = {
                dateStr,
                mood: entry.moodLevel,
                sleep: entry.sleepDuration || 0
            };
        });
        return Object.values(dailyData).slice(-7);
    };

    const data = processData();
    const avgSleep = data.length ? (data.reduce((acc, curr) => acc + curr.sleep, 0) / data.length).toFixed(1) : 0;

    const getMostFrequentMood = (dataArr) => {
        if (!dataArr || dataArr.length === 0) return 0;

        const counts = {};
        let maxCount = 0;
        let mostFrequent = dataArr[0].mood;

        dataArr.forEach(item => {
            const mood = item.mood;
            counts[mood] = (counts[mood] || 0) + 1;

            if (counts[mood] > maxCount) {
                maxCount = counts[mood];
                mostFrequent = mood;
            }
        });

        return mostFrequent;
    };

    const frequentMood = getMostFrequentMood(data);

    return (
        <div className={styles.sparklinesContainer}>
            <div className={styles.sparkCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleArea}>
                        <Smile size={18} className={styles.moodIcon} />
                        <span>Frequent Mood (Last 7d)</span>
                    </div>
                    <span className={styles.mainValue}>{frequentMood}<span className={styles.subValue}>/5</span></span>
                </div>

                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Tooltip content={<MiniTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Line type="monotone" dataKey="mood" stroke="#2ecc71" strokeWidth={2.5} dot={{ r: 3, fill: '#2ecc71' }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className={styles.sparkCard}>
                <div className={styles.cardHeader}>
                    <div className={styles.titleArea}>
                        <Moon size={18} className={styles.sleepIcon} />
                        <span>Sleep (Last 7d)</span>
                    </div>
                    <span className={styles.mainValue}>{avgSleep}<span className={styles.subValue}>h</span></span>
                </div>

                <div className={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <Tooltip content={<MiniTooltip />} cursor={{ stroke: 'var(--border-color)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Line type="monotone" dataKey="sleep" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3, fill: '#a855f7' }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}