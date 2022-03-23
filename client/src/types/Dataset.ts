import {DocumentData} from 'firebase/firestore/lite';
import {DataPreparationOptions} from './DataPreparationOptions';

export interface Dataset extends DocumentData {
  name: string;
  files: string[];
  options: DataPreparationOptions;
  processed: boolean;
  userId: string;
}
