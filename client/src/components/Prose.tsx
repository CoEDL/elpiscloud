import React, {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function Prose({children}: Props) {
  return <div className="prose max-w-none lg:prose-xl">{children}</div>;
}
