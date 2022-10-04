import {DataPreparationOptions} from './DataPreparationOptions';

export interface Dataset {
  name: string;
  files: string[];
  options: DataPreparationOptions;
  processed: boolean;
  userId: string;
}
