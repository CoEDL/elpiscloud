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
import {Dataset} from 'types/Dataset';

export async function getDatasets(user: User) {
  const collectionRef = collection(firestore, `users/${user!.uid}/datasets`);
  const datasetQuery = query(collectionRef, orderBy('name'));
  const querySnapshot = await getDocs(datasetQuery);
  const datasets = querySnapshot.docs.map(snapshot => snapshot.data());
  return datasets as Dataset[];
}

export async function uploadDataset(user: User, dataset: Dataset) {
  const docRef = doc(firestore, `users/${user.uid}/datasets/${dataset.name}`);
  const docSnap = await getDoc(docRef);

  // Check we're not overwriting anything
  if (docSnap.exists()) {
    throw new Error('A dataset with this name already exists!');
  }
  await setDoc(docRef, dataset);
}

export async function deleteDataset(user: User, datasetName: string) {
  const docRef = doc(firestore, `users/${user?.uid}/datasets/${datasetName}`);
  await deleteDoc(docRef);
}
