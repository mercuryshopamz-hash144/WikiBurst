import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, onSnapshot, where, orderBy, limit } from 'firebase/firestore';
import { useStore, Library } from '../store/useStore';

let isSyncing = false;

export async function syncUserProfile() {
  if (!auth.currentUser) return;
  const uid = auth.currentUser.uid;
  const userRef = doc(db, 'users', uid);
  
  try {
    isSyncing = true;
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      useStore.setState({
        xp: data.xp,
        level: data.level,
        streak: data.streak,
        isPremium: data.isPremium,
        wisdomShards: data.wisdomShards,
        prestigePoints: data.prestigePoints,
        userName: data.userName || useStore.getState().userName
      });
    } else {
      // Create user
      const state = useStore.getState();
      await setDoc(userRef, {
        uid,
        userName: state.userName || auth.currentUser.displayName || 'Traveler',
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        isPremium: state.isPremium,
        wisdomShards: state.wisdomShards,
        prestigePoints: state.prestigePoints
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  } finally {
    isSyncing = false;
  }
}

export async function saveUserProfile() {
  if (!auth.currentUser || isSyncing) return;
  const uid = auth.currentUser.uid;
  const state = useStore.getState();
  
  try {
    await updateDoc(doc(db, 'users', uid), {
      userName: state.userName,
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      isPremium: state.isPremium,
      wisdomShards: state.wisdomShards,
      prestigePoints: state.prestigePoints
    });
  } catch (error) {
     console.error('Failed to save profile', error);
  }
}

// Subscribe to state changes and debounce save
let saveTimeout: any;
useStore.subscribe((state, prevState) => {
  if (
    state.xp !== prevState.xp ||
    state.level !== prevState.level ||
    state.streak !== prevState.streak ||
    state.isPremium !== prevState.isPremium ||
    state.wisdomShards !== prevState.wisdomShards ||
    state.prestigePoints !== prevState.prestigePoints
  ) {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveUserProfile(), 2000);
  }
});

export function subscribeToLibraries() {
  const q = query(collection(db, 'libraries'), limit(100)); // basic limitation for now
  
  return onSnapshot(q, (snapshot) => {
    const libs: Library[] = [];
    snapshot.forEach(doc => {
      const data = doc.data() as Omit<Library, 'id'>;
      libs.push({ id: doc.id, ...data });
    });
    // For now we map them over the store's libraries
    if (libs.length > 0) {
      useStore.setState({ libraries: libs });
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'libraries');
  });
}

export async function createGlobalLibrary(libData: Omit<Library, 'id'>) {
    if (!auth.currentUser) return;
    try {
        const libRef = doc(collection(db, 'libraries'));
        const newLib = { ...libData, ownerId: auth.currentUser.uid };
        await setDoc(libRef, newLib);
        return libRef.id;
    } catch(err) {
        handleFirestoreError(err, OperationType.CREATE, 'libraries');
    }
}
