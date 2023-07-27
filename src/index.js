import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// css
import './index.css';
import './utils/svgs.css';

// context provider
import { AppContextProvider } from './contextProvider/ContextProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>
);
