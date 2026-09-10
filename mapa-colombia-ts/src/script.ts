import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Reemplaza con tu UID real
const yourUID = 'F82Ykfj8StMcQMqPU0KVsnpq13k1';
await setDoc(doc(db, 'users', yourUID), {
    isAdmin: true
}, { merge: true });
