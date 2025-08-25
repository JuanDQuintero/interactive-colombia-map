import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const setAdminRole = async (userId: string, isAdmin: boolean) => {
    try {
        await setDoc(doc(db, 'users', userId), {
            isAdmin,
            lastUpdated: new Date()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error setting admin role:", error);
        return false;
    }
};