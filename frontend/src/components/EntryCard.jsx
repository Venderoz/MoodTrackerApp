import { Star, Moon, Calendar, Trash2 } from 'lucide-react';
import { deleteEntry } from '../api/conn';
import styles from './css_modules/EntryCard.module.css';

export default function EntryCard({ entry, onClick, onDeleted }) { 
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getMoodColor = (level) => {
    const colors = { 1: '#636e72', 2: '#0984e3', 3: '#fdcb6e', 4: '#00b894', 5: '#009432' };
    return colors[level] || 'var(--color-primary)';
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      try {
        await deleteEntry(entry.id);
        
        if (onDeleted) {
          onDeleted(entry.id);
        }
      } catch (error) {
        console.error("Failed to delete entry:", error);
        alert("Failed to delete entry: " + error.message);
      }
    }
  };

  return (
    <div
      className={`${styles.itemCard} ${onClick ? styles.clickable : ''}`}
      style={{ borderLeftColor: getMoodColor(entry.moodLevel) }}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <div className={styles.ratingBadge} style={{ color: getMoodColor(entry.moodLevel) }}>
          <Star size={16} fill="currentColor" /> {entry.moodLevel}/5
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.dateText}>
            <Calendar size={12} /> {formatDate(entry.createdAt)}
          </div>
          {onDeleted && (
            <button className={styles.deleteBtn} onClick={handleDelete} title="Delete entry">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {entry.sleepDuration > 0 && (
        <div className={styles.sleepInfo}>
          <Moon size={14} /> {entry.sleepDuration}h of sleep
        </div>
      )}

      <p className={styles.noteText}>
        {entry.note || <span className={styles.emptyNote}>No notes...</span>}
      </p>

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
  );
}