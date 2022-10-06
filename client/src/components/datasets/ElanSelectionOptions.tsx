import {
  ElanOptions,
  ElanSelectionMechanism,
} from 'types/DataPreparationOptions';

type ElanSelectionProps = {
  options?: ElanOptions;
  save(elanOptions: ElanOptions): void;
};

const DEFAULT_OPTIONS: ElanOptions = {
  selectionMechanism: 'tier_name',
  selectionValue: '',
};

export default function ElanSelectionOptions({
  options = DEFAULT_OPTIONS,
  save,
}: ElanSelectionProps) {
  return (
    <div className="rounded-md border p-6">
      <p className="text-lg font-bold">Elan Options</p>

      <div className="mt-4 ml-4 grid grid-cols-3 items-center gap-4">
        <label htmlFor="selection" className="form-label">
          Selection Mechanism
        </label>
        <select
          className="textbox col-span-2"
          name="selection"
          id="selection"
          value={options.selectionMechanism ?? 'tier_name'}
          onChange={e =>
            save({
              ...options,
              selectionMechanism: e.target.value as ElanSelectionMechanism,
            })
          }
        >
          {['tier_name', 'tier_type', 'tier_order'].map(selectionType => (
            <option key={selectionType} value={selectionType}>
              {selectionType}
            </option>
          ))}
        </select>

        <label htmlFor="selectionValue" className="form-label">
          {options.selectionMechanism.split('_').join(' ') + '*'}
        </label>
        <input
          className="textbox col-span-2"
          type="text"
          name="selectionValue"
          id="selectionValue"
          value={options.selectionValue}
          onChange={e =>
            save({
              ...options,
              selectionValue: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
