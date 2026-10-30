import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadAttachment = async (path: string, file: File): Promise<string> => {
  if (storage && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (e) {
      console.warn('Falling back to local object URL:', e);
    }
  }
  // Safe browser fallback
  return URL.createObjectURL(file);
};
