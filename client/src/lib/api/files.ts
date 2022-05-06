import {User} from 'firebase/auth';
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  getDoc,
} from 'firebase/firestore/lite';
import {firestore} from 'lib/firestore';
import {urls} from 'lib/urls';
import {getDataset} from 'lib/api/datasets';
import {UserFile} from 'types/UserFile';
import {Dataset} from 'types/Dataset';

/**
 * Generates signed upload urls for a supplied list of filenames and returns
 * them in a map.
 *
 * @param user The user for which to execute the query
 * @param fileNames A list of filenames
 * @returns A map of filenames to their respective signed urls.
 */
export async function getSignedUploadURLs(user: User, fileNames: String[]) {
  const data = {
    file_names: [...fileNames],
  };

  const token = await user!.getIdToken();
  const response = await fetch(urls.api.signFiles, {
    method: 'POST',
    mode: 'cors',
    headers: new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(data),
  });

  const result = await response.json();
  return new Map<string, string>(Object.entries(result));
}

export async function getFile(user: User, filename: string): Promise<UserFile> {
  const docRef = doc(firestore, `users/${user!.uid}/files/${filename}`);
  const file: UserFile = (await getDoc(docRef)).data() as UserFile;
  return file;
}

/**
 * Get all files from the given dataset for the given user
 *
 * @param user User whose files need to be retrieved
 * @returns A Promise that resolves to a list of UserFile objects
 */
export async function getFilesFromDataset(
  user: User,
  datasetName: string
): Promise<UserFile[]> {
  const dataset: Dataset = await getDataset(user, datasetName);
  return Promise.all(dataset.files.map(filename => getFile(user, filename)));
}

/**
 * Gets a list of UserFiles for a given user, corresponding to the Firestore
 * entries of the uploaded user files.
 *
 * @param user The user to query.
 * @returns A list of UserFiles
 */
export async function getUserFiles(user: User) {
  const collectionRef = collection(firestore, `users/${user!.uid}/files`);
  const datasetQuery = query(collectionRef, orderBy('fileName'));
  const querySnapshot = await getDocs(datasetQuery);
  const files = querySnapshot.docs.map(snapshot => snapshot.data());
  return files as UserFile[];
}
