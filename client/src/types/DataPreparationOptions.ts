export interface DataPreparationOptions {
  punctuationToRemove: string;
  punctuationToReplace: string;
  tagsToRemove: string;
  wordsToRemove: string;
  elanOptions: ElanOptions;
}

export interface ElanOptions {
  selectionMechanism: ElanSelectionMechanism;
  selectionValue: string;
}

export type ElanSelectionMechanism = 'tier_name' | 'tier_type' | 'tier_order';
