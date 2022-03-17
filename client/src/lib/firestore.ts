import {app} from 'lib/firebase';
import {getFirestore} from 'firebase/firestore/lite';

export const firestore = getFirestore(app);
