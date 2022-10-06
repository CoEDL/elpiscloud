export interface DataPreparationOptions {
  punctuationToRemove: string;
  punctuationToExplode: string;
  textToRemove: string[];
  elanOptions?: ElanOptions;
}

export interface ElanOptions {
  selectionMechanism: ElanSelectionMechanism;
  selectionValue: string;
}

export type ElanSelectionMechanism = 'tier_name' | 'tier_type' | 'tier_order';
