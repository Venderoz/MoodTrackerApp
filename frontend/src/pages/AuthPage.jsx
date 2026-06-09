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

    try {
      if (isLogin) {
        await loginUser({ email, password });
        onLogin(); 
      } else {
        await registerUser({ firstName, email, password });
        onLogin();
      }
    } catch (error) {
      console.error("[AUTH ERROR]", error);
      setErrorMsg(isLogin ? 'Invalid email or password.' : 'Registration failed. Try again.');
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