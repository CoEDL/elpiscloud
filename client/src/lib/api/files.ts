import {User} from 'firebase/auth';
import {collection, getDocs, orderBy, query} from 'firebase/firestore/lite';
import {firestore} from 'lib/firestore';
import {urls} from 'lib/urls';
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

/**
 *
 *
 * @param user
 * @param filenames
 * @returns
 */
export async function getFilesFromDataset(user: User, datasetName: string) {
  const getDataset = async () => {
    const collectionRef = collection(
      firestore,
      `users/${user!.uid}/datasets/${datasetName}`
    );
    const datasetQuery = query(collectionRef, orderBy('name'));
    const querySnapshot = await getDocs(datasetQuery);
    return querySnapshot.docs.map(snapshot => snapshot.data()) as Dataset[];
  };

  const [dataset] = await getDataset();

  const filePromises = Array.from(dataset.fileNames).map(filename => {
    const collectionRef = collection(
      firestore,
      `users/${user!.uid}/files/${filename}`
    );
    const datasetQuery = query(collectionRef);
    const querySnapshotPromise = getDocs(datasetQuery); // Async call
    return querySnapshotPromise;
  });

  const returnedFiles = new Array<UserFile>();
  Promise.all(filePromises).then(querySnapshots => {
    querySnapshots.forEach(snapshot => {
      returnedFiles.push(
        ...(snapshot.docs.map(snapshot => snapshot.data()) as UserFile[])
      );
    });
  });

  return returnedFiles;
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
