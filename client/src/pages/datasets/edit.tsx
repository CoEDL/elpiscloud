import React from 'react';
import Link from 'next/link';

export default function edit() {
  return (
    <div>
      <div className="flex justify-end">
        <Link href="/datasets">
          <button className="button-secondary m-1">Back to Datasets</button>
        </Link>
      </div>
      Edit page
    </div>
  );
}
