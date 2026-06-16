import { useState, useEffect } from 'react';
import { updateEntry, getLabels } from '../api/conn';
import { Star, X } from 'lucide-react';
import styles from './EntryModal.module.css';

export default function EntryModal({ entry, onClose, onUpdate }) {
  const [moodLevel, setMoodLevel] = useState(entry.moodLevel);
  const [sleepHours, setSleepHours] = useState(entry.sleepDuration || 0);
  const [note, setNote] = useState(entry.note || '');

  const initialLabels = entry.labels ? entry.labels.map(l => l.name) : [];
  const [selectedLabels, setSelectedLabels] = useState(initialLabels);

  const [availableLabels, setAvailableLabels] = useState([]);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labelsFromDb = await getLabels();
        setAvailableLabels(labelsFromDb);
      } catch (error) { console.error(error); }
    };
    fetchLabels();
  }, []);

  const getMoodColor = (level) => {
    const colors = { 1: '#636e72', 2: '#0984e3', 3: '#fdcb6e', 4: '#00b894', 5: '#009432' };
    return colors[level] || 'var(--color-primary)';
  };

  const toggleLabel = (labelName) => {
    if (selectedLabels.includes(labelName)) {
      setSelectedLabels(selectedLabels.filter(l => l !== labelName));
    } else {
      setSelectedLabels([...selectedLabels, labelName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        moodLevel: parseInt(moodLevel),
        sleepDuration: parseFloat(sleepHours),
        labelNames: selectedLabels,
        note: note
      };

      const updatedEntry = await updateEntry(entry.id, payload);
      onUpdate(updatedEntry);
      onClose();
    } catch (error) {
      console.error("[PUT Error]", error);
    }
  };
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Edit Entry</h2>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label>Mood Level</label>
            <div className={styles.moodSelector}>
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={styles.moodBtn}
                  style={{
                    backgroundColor: moodLevel === level ? getMoodColor(level) : 'transparent',
                    color: moodLevel === level ? '#fff' : getMoodColor(level),
                    borderColor: getMoodColor(level)
                  }}
                  onClick={() => setMoodLevel(level)}
                >
                  <Star size={20} fill={moodLevel === level ? "#fff" : "currentColor"} />
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Sleep Duration ({sleepHours}h)</label>
            <input
              type="range" min="0" max="16" step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className={styles.sleepSlider}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Labels</label>
            <div className={styles.labelsGrid}>
              {availableLabels.map(label => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.name)}
                  style={{
                    backgroundColor: selectedLabels.includes(label.name) ? (label.colorHex || 'var(--color-primary)') : 'transparent',
                    borderColor: label.colorHex || 'var(--color-primary)',
                    color: selectedLabels.includes(label.name) ? '#fff' : 'var(--text-primary)'
                  }}
                  className={styles.labelPill}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={styles.textArea}
              placeholder="Update your thoughts..."
            />
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}