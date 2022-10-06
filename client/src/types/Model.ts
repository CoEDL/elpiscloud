import {TrainingOptions} from './TrainingOptions';

export type Model = {
  modelName: string;
  datasetName: string;
  options: TrainingOptions;
  userId: string;
  status: ModelTrainingStatus;
  baseModel?: string;
  samplingRate?: number;
};

export type ModelTrainingStatus = 'waiting' | 'training' | 'finished' | 'error';
