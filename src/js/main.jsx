
// src/js/main.jsx (Example)
import React from 'react';
import ReactDOM from 'react-dom/client';
import SimpleCounter from './components/SimpleCounter.jsx'; // Adjust path if needed
import '../styles/SimpleCounter.css'; // Ensure global styles like body are loaded

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SimpleCounter />
  </React.StrictMode>,
)