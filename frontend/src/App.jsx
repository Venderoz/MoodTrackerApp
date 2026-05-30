import { useState, useEffect } from 'react';

function App() {
  // Stan dla listy nastrojów pobranych z bazy
  const [moods, setMoods] = useState([]);
  
  // Stan dla formularza (to, co wpisuje użytkownik)
  const [moodLevel, setMoodLevel] = useState(5);
  const [note, setNote] = useState('');

  // Adres Twojego backendu - używamy relative path, aby działało za reverse proxy
  const API_URL = '/api/moodentry';

  // 1. FUNKCJA POBIERAJĄCA DANE (GET)
  const fetchMoods = async () => {
    console.log('[FETCH] Starting GET request to:', API_URL);
    try {
      console.log('[FETCH] Sending fetch request...');
      const response = await fetch(API_URL);
      console.log('[FETCH] Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: {
          'content-type': response.headers.get('content-type'),
          'content-length': response.headers.get('content-length'),
        }
      });
      
      if (response.ok) {
        const text = await response.text();
        console.log('[FETCH] Raw response text:', text);
        const data = JSON.parse(text);
        console.log('[FETCH] Parsed JSON:', data);
        setMoods(data);
      } else {
        console.error('[FETCH] Response not OK:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("[FETCH] Error fetching the data:", error);
      console.error("[FETCH] Error type:", error.constructor.name);
      console.error("[FETCH] Error message:", error.message);
      console.error("[FETCH] Error stack:", error.stack);
    }
  };

  // Uruchom pobieranie od razu po wejściu na stronę
  useEffect(() => {
    fetchMoods();
  }, []);

  // 2. FUNKCJA WYSYŁAJĄCA DANE (POST)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      moodLevel: parseInt(moodLevel),
      note: note
    };
    
    console.log('[POST] Starting POST request to:', API_URL);
    console.log('[POST] Payload:', payload);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[POST] Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });

      if (response.ok) {
        console.log('[POST] Success! Clearing form and refreshing list');
        setNote('');
        fetchMoods();
      } else {
        console.error('[POST] Response not OK:', response.status);
      }
    } catch (error) {
      console.error("[POST] Error submitting the data:", error);
      console.error("[POST] Error message:", error.message);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Segoe UI, Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#333' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>My Mood Tracker</h1>

      {/* SEKCJA A: FORMULARZ DODAWANIA */}
      <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>How are you feeling today?</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mood Level (1-5):</label>
          <input 
            type="number" 
            min="1" 
            max="5" 
            value={moodLevel} 
            onChange={(e) => setMoodLevel(e.target.value)}
            style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Note / Comment:</label>
          <textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            placeholder="What happened today that affected your mood?"
            style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#047e10', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          Submit Mood Entry
        </button>
      </form>

      {/* SEKCJA B: WYŚWIETLANIE HISTORII */}
      <div>
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>History of Entries</h3>
        {moods.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center' }}>No entries yet. Add your first mood entry above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {moods.map((mood) => (
              <div key={mood.id} style={{ borderLeft: '5px solid #2ecc71', background: '#fff', padding: '15px', borderRadius: '0 8px 8px 0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Rating: {mood.moodLevel}/5</span>
                  <small style={{ color: '#95a5a6' }}>{new Date(mood.createdAt).toLocaleString()}</small>
                </div>
                <p style={{ margin: 0, color: '#555', fontStyle: mood.note ? 'normal' : 'italic' }}>
                  {mood.note || "No notes."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;