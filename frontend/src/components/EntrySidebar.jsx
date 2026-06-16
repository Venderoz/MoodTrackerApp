import { useState, useEffect } from 'react';
import { getEntries } from '../api/conn';
import styles from './EntrySidebar.module.css';
import { Star, Moon, Calendar } from 'lucide-react';
import EntryModal from './EntryModal';

export default function EntrySidebar() {
  const [recentEntries, setRecentEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const data = await getEntries();
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentEntries(sortedData.slice(0, 3));
      } catch (e) {
        console.error(e);
      }
    };
    loadRecent();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getMoodColor = (level) => {
    const colors = { 1: '#636e72', 2: '#0984e3', 3: '#fdcb6e', 4: '#00b894', 5: '#009432' };
    return colors[level] || 'var(--color-primary)';
  };

  return (
    <div className={styles.sidebarContainer}>
      <h3 className={styles.title}>Recent Activity</h3>

      <div className={styles.list}>
        {recentEntries.map(entry => (
          <div
            key={entry.id}
            className={styles.itemCard}
            style={{ borderLeftColor: getMoodColor(entry.moodLevel) }}
            onClick={() => setSelectedEntry(entry)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.ratingBadge} style={{ color: getMoodColor(entry.moodLevel) }}>
                <Star size={16} fill="currentColor" /> {entry.moodLevel}/5
              </div>
              <div className={styles.dateText}>
                <Calendar size={12} /> {formatDate(entry.createdAt)}
              </div>
            </div>

            {entry.sleepDuration > 0 && (
              <div className={styles.sleepInfo}>
                <Moon size={14} /> {entry.sleepDuration}h of sleep
              </div>
            )}

            <p className={styles.noteText}>{entry.note || <span className={styles.emptyNote}>No notes...</span>}</p>

            {entry.labels && entry.labels.length > 0 && (
              <div className={styles.labelsWrapper}>
                {entry.labels.map(label => (
                  <span
                    key={label.id}
                    className={styles.labelBadge}
                    style={{ backgroundColor: label.colorHex || 'var(--color-primary)' }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className={styles.seeMoreBtn}>See full history</button>

      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onUpdate={(updatedEntry) => {
            setRecentEntries(prevEntries =>
              prevEntries.map(entry =>
                entry.id === updatedEntry.id ? updatedEntry : entry
              )
            );
          }}
        />
      )}
    </div>
  );
}