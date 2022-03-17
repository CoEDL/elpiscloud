import {DocumentData} from 'firebase/firestore/lite';

export interface UserFile extends DocumentData {
  fileName: string;
  size: string;
  contentType: string;
  tags: string[];
  timeCreated: string;
  userId: string;
}
