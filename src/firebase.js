import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAsx_VRwI-RleQWUAzfcEZfcFkypl5xaLs",
  authDomain: "atletico-9030f.firebaseapp.com",
  databaseURL: "https://atletico-9030f-default-rtdb.firebaseio.com",
  projectId: "atletico-9030f",
  storageBucket: "atletico-9030f.firebasestorage.app",
  messagingSenderId: "290000210725",
  appId: "1:290000210725:web:17559f7caef706fde9a8cc"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
