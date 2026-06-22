import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Download, Filter, Calendar, LayoutGrid } from 'lucide-react';
import { getFilteredEntries } from '../api/conn';
import EntryModal from '../components/EntryModal';
import EntryCard from '../components/EntryCard';
import MoodTrendChart from '../components/MoodTrendChart';
import styles from './css_modules/AnalyticsPage.module.css';

export default function AnalyticsPage() {
    const { labels: availableLabels, refreshData } = useOutletContext();
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });

    const [selectedEntry, setSelectedEntry] = useState(null);
    const [activeFilter, setActiveFilter] = useState('30d');
    const [selectedLabels, setSelectedLabels] = useState([]);

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchFilteredData = async () => {
            setIsLoading(true);
            try {
                const data = await getFilteredEntries({ startDate, endDate, labelNames: selectedLabels });
                setEntries(data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilteredData();
    }, [startDate, endDate, selectedLabels, refreshTrigger]);

    const setQuickDate = (days, filterName) => {
        if (days === null) {
            setStartDate('');
            setEndDate('');
        } else {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - days);
            setEndDate(end.toISOString().split('T')[0]);
            setStartDate(start.toISOString().split('T')[0]);
        }
        setActiveFilter(filterName);
    };

    const toggleLabel = (labelName) => {
        setSelectedLabels(prev =>
            prev.includes(labelName) ? prev.filter(l => l !== labelName) : [...prev, labelName]
        );
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'Time', 'Mood Level (1-5)', 'Sleep Duration (h)', 'Factors', 'Note'];
        const rows = entries.map(e => {
            const dateObj = new Date(e.createdAt);
            return [
                dateObj.toLocaleDateString(),
                dateObj.toLocaleTimeString(),
                e.moodLevel,
                e.sleepDuration || 0,
                e.labels.map(l => l.name).join('; '),
                `"${(e.note || '').replace(/"/g, '""')}"`
            ];
        });

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mood_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.analyticsContainer}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.pageTitle}>Analytics</h1>
                    <p className={styles.subText}>Dive deep into your mood history and spot the trends.</p>
                </div>
                <button onClick={handleExportCSV} className={styles.exportBtn} disabled={entries.length === 0}>
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className={styles.filtersCard}>
                <div className={styles.filterSection}>
                    <div className={styles.filterTitle}><Calendar size={18} /> Timeframe</div>
                    <div className={styles.dateInputs}>
                        <input
                            type="date"
                            value={startDate}
                            max={endDate || todayStr}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setActiveFilter('custom');
                            }}
                            className={styles.dateInput}
                        />
                        <span>—</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={todayStr}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setActiveFilter('custom');
                            }}
                            className={styles.dateInput}
                        />
                    </div>
                    <div className={styles.quickFilters}>
                        <button className={`${styles.quickFilterBtn} ${activeFilter === '7d' ? styles.active : ''}`} onClick={() => setQuickDate(7, '7d')}>Last 7d</button>
                        <button className={`${styles.quickFilterBtn} ${activeFilter === '30d' ? styles.active : ''}`} onClick={() => setQuickDate(30, '30d')}>Last 30d</button>
                        <button className={`${styles.quickFilterBtn} ${activeFilter === 'all' ? styles.active : ''}`} onClick={() => setQuickDate(null, 'all')}>All Time</button>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.filterSection}>
                    <div className={styles.filterTitle}><Filter size={18} /> Factors</div>
                    <div className={styles.labelsGrid}>
                        {availableLabels.map(label => {
                            const isActive = selectedLabels.includes(label.name);
                            return (
                                <button
                                    key={label.id}
                                    onClick={() => toggleLabel(label.name)}
                                    style={{
                                        borderColor: label.colorHex,
                                        backgroundColor: isActive ? label.colorHex : 'transparent',
                                        color: isActive ? '#fff' : 'var(--text-primary)'
                                    }}
                                    className={styles.filterLabelPill}
                                >
                                    {label.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loadingArea}>Loading trends...</div>
            ) : (
                <MoodTrendChart entries={entries} />
            )}

            <div className={styles.gridHeader}>
                <LayoutGrid size={20} />
                <h2>Filtered Entries ({entries.length})</h2>
            </div>

            <div className={styles.entriesGrid}>
                {entries.map(entry => (
                    <EntryCard
                        key={entry.id}
                        entry={entry}
                        onClick={() => setSelectedEntry(entry)}
                        onDeleted={() => {
                            setRefreshTrigger(prev => prev + 1);
                            if (refreshData) refreshData();
                        }}
                    />
                ))}
            </div>

            {selectedEntry && (
                <EntryModal
                    entry={selectedEntry}
                    availableLabels={availableLabels}
                    onClose={() => setSelectedEntry(null)}
                    onUpdate={async () => {
                        setRefreshTrigger(prev => prev + 1);
                        if (refreshData) {
                            await refreshData();
                        }
                    }}
                />
            )}
        </div>
    );
}