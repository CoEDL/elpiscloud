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
  DocumentData,
} from 'firebase/firestore/lite';
import {firestore} from 'lib/firestore';
import {Dataset} from 'types/Dataset';

/**
 * Method to retrieve a dataset with a given filename belonging to a user
 *
 * @param user The user whose dataset needs to be obtained
 * @param datasetName The dataset that needs to be retrieved
 * @returns A Promise that resolves to an object of type Dataset
 */
export async function getDataset(
  user: User,
  datasetName: string
): Promise<Dataset> {
  const docRef = doc(firestore, `users/${user!.uid}/datasets/${datasetName}`);
  const docSnapShot = await getDoc(docRef);
  const returnedDocument: DocumentData = docSnapShot.data() as DocumentData;
  return returnedDocument as Dataset;
}

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
