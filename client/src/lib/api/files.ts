import {User} from 'firebase/auth';
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
} from 'firebase/firestore/lite';
import {firestore} from 'lib/firestore';
import {urls} from 'lib/urls';
import {UserFile} from 'types/UserFile';

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

/**
 * For a given user, it uploads tags for a given file to Firestore.
 *
 * @param user The user whose files are being updated.
 * @param file The file being updated.
 * @param tags The list of new tags for this file.
 */
export async function updateDocumentTags(
  user: User,
  file: string,
  tags: string[]
) {
  const documentReference = doc(firestore, `users/${user!.uid}/files/${file}`);
  await updateDoc(documentReference, 'tags', tags);
}
