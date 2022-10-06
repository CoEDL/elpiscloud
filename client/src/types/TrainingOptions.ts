export interface TrainingOptions {
  wordDelimiterToken: string;
  epochs: number;
  minDuration: number;
  maxDuration: number;
  learningRate: number;
  batchSize: number;
  testSize: number;
}
