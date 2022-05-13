import {useAuth} from 'contexts/auth';
import Link from 'next/link';
import React from 'react';

export default function ProfileIndicator() {
  const {user} = useAuth();

  if (!user) {
    return (
      <Link href="/signIn">
        <button className="rounded-md bg-slate-200 px-4 py-2 font-bold text-slate-900">
          Sign in
        </button>
      </Link>
    );
  }
  return (
    <Link href="/profile">
      <button className="rounded-md bg-slate-200 px-4 py-2 font-bold text-slate-900">
        Profile
      </button>
    </Link>
  );
}
