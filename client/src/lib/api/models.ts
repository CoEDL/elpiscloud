import {User} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore/lite';
import {firestore} from 'lib/firestore';
import {Model} from 'types/Model';

export async function getModels(user: User) {
  const collectionRef = collection(firestore, `users/${user!.uid}/models`);
  const modelQuery = query(collectionRef, orderBy('name'));
  const querySnapshot = await getDocs(modelQuery);
  const models = querySnapshot.docs.map(snapshot => snapshot.data());
  return models as Model[];
}

export async function uploadModel(user: User, model: Model) {
  const docRef = doc(firestore, `users/${user.uid}/models/${model.name}`);
  const docSnap = await getDoc(docRef);

  // Check we're not overwriting anything
  if (docSnap.exists()) {
    throw new Error('A model with this name already exists!');
  }
  await setDoc(docRef, model);
}

export async function deleteModel(user: User, modelName: string) {
  const docRef = doc(firestore, `users/${user?.uid}/models/${modelName}`);
  await deleteDoc(docRef);
}
