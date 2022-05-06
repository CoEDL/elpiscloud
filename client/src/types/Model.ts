import {Dataset} from './Dataset';
import {TrainingOptions} from './TrainingOptions';

export type Model = {
  name: string;
  options: TrainingOptions;
  dataset: Dataset;
  userId: string;
  trainingStatus: ModelTrainingStatus;
  logPath?: string;
};

export type ModelTrainingStatus = 'training' | 'finished' | 'error';
