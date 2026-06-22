import { NavLink } from 'react-router-dom';
import { Home, BarChart2, Settings, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import styles from './css_modules/Sidebar.module.css';

export default function Sidebar() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <div className={styles.sidebarInner}>
      <div className={styles.navLinks}>
        <NavLink to="/home" className={({isActive}) => isActive ? styles.active : styles.link}>
          <Home size={28} />
        </NavLink>
        <NavLink to="/analytics" className={({isActive}) => isActive ? styles.active : styles.link}>
          <BarChart2 size={28} />
        </NavLink>
      </div>

      <div className={styles.bottomActions}>
        <button onClick={toggleTheme} className={styles.iconBtn}>
          {dark ? <Sun size={28} /> : <Moon size={28} />}
        </button>
        <NavLink to="/settings" className={({isActive}) => isActive ? styles.active : styles.link}>
          <Settings size={28} />
        </NavLink>
      </div>
    </div>
  );
}