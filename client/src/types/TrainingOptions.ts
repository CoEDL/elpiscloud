export interface TrainingOptions {
  wordDelimiterToken: string;
  epochs: number;
  minDuration: number;
  maxDuration: number;
  learningRate: number;
  batchSize: number;
  debugWithSubset: boolean;
  debugSubsetOptions: DebugSubsetOptions;
}

export interface DebugSubsetOptions {
  trainingSetSize: number;
  validationSetSize: number;
}
