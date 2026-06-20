import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Frown, Annoyed, Meh, Smile, Laugh, CheckCircle2 } from 'lucide-react';
import { createEntry, getDashboardStats } from '../api/conn';
import ActivityChart from '../components/ActivityChart';
import MoodSparklines from '../components/MoodSparklines';
import TopTagsChart from '../components/TopTagsChart';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [moodLevel, setMoodLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(8);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [note, setNote] = useState('');

  const { entries, labels: availableLabels, refreshData, refreshCount } = useOutletContext();

  const [dashboardStats, setDashboardStats] = useState(null);

  const moodOptions = [
    { value: 1, icon: <Frown size={36} strokeWidth={1.5} />, label: 'Awful' },
    { value: 2, icon: <Annoyed size={36} strokeWidth={1.5} />, label: 'Bad' },
    { value: 3, icon: <Meh size={36} strokeWidth={1.5} />, label: 'Okay' },
    { value: 4, icon: <Smile size={36} strokeWidth={1.5} />, label: 'Good' },
    { value: 5, icon: <Laugh size={36} strokeWidth={1.5} />, label: 'Great' }
  ];

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await getDashboardStats();
      setDashboardStats({ ...statsData });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      await fetchStats();
    };
    loadStats();
  }, [fetchStats, refreshCount]);

  const hasEntryToday = entries.some(entry => {
    const entryDate = new Date(entry.createdAt).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  });

  const handleMoodSelect = (value) => {
    setMoodLevel(value);
    setStep(2);
  };

  const toggleLabel = (label) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      const payload = { moodLevel: parseInt(moodLevel), sleepDuration: parseFloat(sleepHours), labelNames: selectedLabels, note: note };
      await createEntry(payload);

      await refreshData();

      setStep(5);
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error("[POST Error]", error);
      alert(error.message);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); setStep(1); setMoodLevel(5); setSleepHours(8); setSelectedLabels([]); setNote('');
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.topSection}>
        <div>
          <h1 className={styles.welcomeText}>Welcome back, {localStorage.getItem('firstName')}!</h1>
          <p className={styles.subText}>Here is your mood summary.</p>
        </div>
        <button
          className={styles.mainAddBtn}
          onClick={() => setIsModalOpen(true)}
          disabled={hasEntryToday}
          style={{ opacity: hasEntryToday ? 0.5 : 1, cursor: hasEntryToday ? 'not-allowed' : 'pointer' }}
        >
          {hasEntryToday ? (
            <>
              Entry added <CheckCircle2 size={18} strokeWidth={2.5} style={{ position: 'relative', top: '2px' }} />
            </>
          ) : (
            "+ Add new entry"
          )}
        </button>
      </div>

      <div className={styles.chartsGrid}>
        <ActivityChart entries={entries} key={`activity-${refreshCount}`} />

        {dashboardStats ? (
          <>
            <MoodSparklines
              key={`sparklines-${refreshCount}`}
              data={dashboardStats.sparklines}
              frequentMood={dashboardStats.frequentMood}
              avgSleep={dashboardStats.avgSleep}
            />
            <TopTagsChart
              key={`tags-${refreshCount}`}
              data={dashboardStats.topTags}
            />
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            Loading stats...
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {step === 1 && (
              <div className={styles.stepContainer}>
                <h2 className={styles.stepTitle}>How are you feeling today?</h2>
                <p className={styles.stepSubtitle}>Select one of the options below.</p>

                <div className={styles.moodGrid}>
                  {moodOptions.map((mood) => (
                    <button
                      key={mood.value}
                      className={styles.moodBtn}
                      onClick={() => handleMoodSelect(mood.value)}
                    >
                      <span className={styles.moodIcon}>{mood.icon}</span>
                      <span className={styles.moodLabel}>{mood.label}</span>
                    </button>
                  ))}
                </div>

                <button className={styles.cancelTextBtn} onClick={closeModal}>Cancel</button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.stepContainer}>
                <h2 className={styles.stepTitle}>How much did you sleep?</h2>
                <p className={styles.stepSubtitle}>Slide to adjust hours of sleep.</p>

                <div className={styles.sleepContainer}>
                  <div className={styles.sleepValue}>{sleepHours} h</div>
                  <input
                    type="range"
                    min="0" max="16" step="0.1"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className={styles.sleepSlider}
                  />
                  <div className={styles.sleepLabels}>
                    <span>0 h</span>
                    <span>16 h</span>
                  </div>
                </div>

                <div className={styles.modalActions}>
                  <button onClick={() => setStep(1)} className={styles.cancelBtn}>Back</button>
                  <button onClick={() => setStep(3)} className={styles.nextBtn}>Next</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={styles.stepContainer}>
                <h2 className={styles.stepTitle}>What affected your mood?</h2>
                <p className={styles.stepSubtitle}>Select all that apply.</p>

                <div className={styles.labelsGrid}>
                  {availableLabels.map(label => {
                    const isActive = selectedLabels.includes(label.name);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabel(label.name)}
                        style={{ 
                          borderColor: label.colorHex,
                          backgroundColor: isActive ? label.colorHex : 'var(--bg-main)',
                          color: isActive ? '#ffffff' : 'var(--text-primary)',
                          textShadow: isActive ? '0px 1px 2px rgba(0,0,0,0.4)' : 'none' 
                        }}
                        className={styles.labelPill}
                      >
                        {label.name}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.modalActions}>
                  <button onClick={() => setStep(2)} className={styles.cancelBtn}>Back</button>
                  <button onClick={() => setStep(4)} className={styles.nextBtn}>Next</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className={styles.stepContainer}>
                <h2 className={styles.stepTitle}>Want to add anything else?</h2>
                <p className={styles.stepSubtitle}>Jot down your thoughts (optional).</p>

                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What happened today?"
                  className={styles.formInput}
                  style={{ height: '120px', resize: 'vertical', marginBottom: '20px' }}
                />

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setStep(3)} className={styles.cancelBtn}>
                    Back
                  </button>
                  <button type="button" onClick={handleSubmit} className={styles.submitBtn}>
                    Save entry
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className={styles.successContainer}>
                <CheckCircle2 size={72} color="#2ecc71" className={styles.successIcon} strokeWidth={1.5} />
                <h2 className={styles.stepTitle}>Awesome!</h2>
                <p className={styles.stepSubtitle}>Your entry has been saved successfully.</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}