import { useState } from 'react';
import styles from './AuthPage.module.css';
import { loginUser, registerUser } from '../api/conn';

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }

      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }

      if (!/[a-zA-Z]/.test(password)) {
        setErrorMsg('Password must contain at least one letter.');
        return;
      }

      if (!/\d/.test(password)) {
        setErrorMsg('Password must contain at least one number.');
        return;
      }
    }

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
        setErrorMsg('Email is already in use.');
      }
    } catch (error) {
      console.error("[AUTH ERROR]", error);
      setErrorMsg(isLogin ? 'Invalid email or password.' : 'Registration failed. Please try again.');
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFirstName('');
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>

        <h1 className={styles.authTitle}>MoodTracker</h1>
        <p className={styles.authSubtitle}>
          {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to track your mood.'}
        </p>
        {errorMsg && (
          <div style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
            {errorMsg}
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

          <button type="submit" className={styles.btnPrimary}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '25px', fontSize: '14px', color: '#7f8c8d' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className={styles.textLink}>
            {isLogin ? 'Sign up here' : 'Log in here'}
          </span>
        </p>
      </div>
    </div>
  );
}