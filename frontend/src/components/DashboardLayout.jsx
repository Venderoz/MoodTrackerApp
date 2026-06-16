import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import EntrySidebar from './EntrySidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout() {
  return (
    <div className={styles.layoutWrapper}>
      <aside className={styles.leftColumn}>
        <Sidebar />
      </aside>

      <main className={styles.mainColumn}>
        <Outlet />
      </main>

      <aside className={styles.rightColumn}>
        <EntrySidebar />
      </aside>
    </div>
  );
}