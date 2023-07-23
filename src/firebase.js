// firebase imports

import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyA5dlgjWZrLUudTHEPSVHIRZMR7eKmkmyM',
  authDomain: 'twitter-clone-6ebd5.firebaseapp.com',
  projectId: 'twitter-clone-6ebd5',
  storageBucket: 'twitter-clone-6ebd5.appspot.com',
  messagingSenderId: '944643551159',
  appId: '1:944643551159:web:ef91b7ba830425d8e64232',
};

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// eslint-disable-next-line no-restricted-globals
if (location.hostname === 'localhost') {
  connectAuthEmulator(auth, 'http://localhost:9099', {
    disableWarnings: true,
  });
  connectFirestoreEmulator(firestore, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

export default app;
