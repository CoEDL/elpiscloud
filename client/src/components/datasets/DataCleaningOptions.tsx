import {DataPreparationOptions} from 'types/DataPreparationOptions';

type CleaningProps = {
  options: DataPreparationOptions;
  setOptions(options: DataPreparationOptions): void;
};

export default function CleaningOptions({options, setOptions}: CleaningProps) {
  const inputs = [
    {
      title: 'Punctuation to remove',
      option: 'punctuationToRemove',
      value: options.punctuationToRemove,
    },
    {
      title: 'Punctuation to explode',
      option: 'punctuationToExplode',
      value: options.punctuationToExplode,
    },
  ];
  return (
    <div className="rounded-md border p-6">
      <p className="text-lg font-bold">Data Cleaning</p>

      <div className="mt-4 ml-4 grid grid-cols-3 items-center gap-4">
        {inputs.map(({title, option, value}) => (
          <>
            <label
              key={`label${option}`}
              htmlFor={option}
              className="form-label"
            >
              {title}
            </label>
            <input
              key={`input${option}`}
              className="textbox col-span-2"
              type="text"
              name={option}
              id={option}
              value={value}
              onChange={e => setOptions({...options, [option]: e.target.value})}
            />
          </>
        ))}
      </div>
    </div>
  );
}
