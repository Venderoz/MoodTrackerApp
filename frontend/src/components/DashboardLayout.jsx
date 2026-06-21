import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import EntrySidebar from './EntrySidebar';
import { getEntries, getLabels } from '../api/conn';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
  const [entries, setEntries] = useState([]);
  const [labels, setLabels] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);

  const location = useLocation();
  const isAnalyticsPage = location.pathname === '/analytics';

  const refreshData = useCallback(async () => {
    try {
      const [entriesData, labelsData] = await Promise.all([
        getEntries(),
        getLabels()
      ]);
      setEntries(entriesData);
      setLabels(labelsData);
      setRefreshCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to load global data.", error);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      await refreshData();
    };
    initData();
  }, [refreshData]);

  return (
    <div className={isAnalyticsPage ? styles.layoutWrapperWide : styles.layoutWrapper}>
      <aside className={styles.leftColumn}>
        <Sidebar />
      </aside>

      <main className={styles.mainColumn}>
        <Outlet context={{ entries, labels, refreshData, refreshCount }} />
      </main>

      {!isAnalyticsPage && (
        <aside className={styles.rightColumn}>
          <EntrySidebar 
            entries={entries} 
            availableLabels={labels} 
            onRefresh={refreshData} 
          />
        </aside>
      )}
    </div>
  );
}