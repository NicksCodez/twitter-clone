// firebase imports
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyA5dlgjWZrLUudTHEPSVHIRZMR7eKmkmyM',
  authDomain: 'twitter-clone-6ebd5.firebaseapp.com',
  projectId: 'twitter-clone-6ebd5',
  storageBucket: 'twitter-clone-6ebd5.appspot.com',
  messagingSenderId: '944643551159',
  appId: '1:944643551159:web:ef91b7ba830425d8e64232',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
