import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './css_modules/EntrySidebar.module.css';
import EntryCard from './EntryCard';
import EntryModal from './EntryModal';

export default function EntrySidebar({ entries, availableLabels, onRefresh }) {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const navigate = useNavigate();

  const recentEntries = entries && entries.length > 0
    ? [...entries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
    : [];

  return (
    <div className={styles.sidebarContainer}>
      <h3 className={styles.title}>Recent Activity</h3>

      <div className={styles.list}>
        {recentEntries.map(entry => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onClick={() => setSelectedEntry(entry)}
            onDeleted={() => {
              if (onRefresh) onRefresh();
            }}
          />
        ))}
      </div>

      <button
        className={styles.seeMoreBtn}
        onClick={() => navigate('/analytics')}
      >
        See full history
      </button>

      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          availableLabels={availableLabels}
          onClose={() => setSelectedEntry(null)}
          onUpdate={async () => {
            if (onRefresh) {
              await onRefresh();
            }
          }}
        />
      )}
    </div>
  );
}