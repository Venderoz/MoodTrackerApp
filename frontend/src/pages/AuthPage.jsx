import { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import styles from './AuthPage.module.css';
import { loginUser, registerUser } from '../api/conn';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!isLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
        return;
      }

      if (password.length < 8) {
        setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
        return;
      }

      if (!/[a-zA-Z]/.test(password)) {
        setMessage({ type: 'error', text: 'Password must contain at least one letter.' });
        return;
      }

      if (!/\d/.test(password)) {
        setMessage({ type: 'error', text: 'Password must contain at least one number.' });
        return;
      }
    }

    setIsLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginUser({ email, password });
      } else {
        data = await registerUser({ firstName, email, password });
      }

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('firstName', data.firstName);
        onLogin();
      } else {
        setMessage({ type: 'error', text: 'Email is already in use.' });
      }
    } catch (error) {
      console.error("[AUTH ERROR]", error);
      setMessage({ 
        type: 'error', 
        text: isLogin ? 'Invalid email or password.' : 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFirstName('');
    setEmail('');
    setPassword('');
    setMessage({ type: '', text: '' });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>

        <h1 className={styles.authTitle}>MoodTracker</h1>
        <p className={styles.authSubtitle}>
          {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to track your mood.'}
        </p>

        {message.text && (
          <div className={`${styles.alert} ${styles[message.type]}`}>
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>First Name</label>
              <input
                type="text"
                required
                className={styles.formInput}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              required
              className={styles.formInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Password</label>
            <input
              type="password"
              required
              className={styles.formInput}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className={styles.textLink}>
            {isLogin ? 'Sign up here' : 'Log in here'}
          </span>
        </p>
      </div>
    </div>
  );
}