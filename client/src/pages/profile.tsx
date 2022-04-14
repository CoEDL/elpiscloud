import {useAuth} from 'contexts/auth';
import {signOut} from 'lib/auth';
import {urls} from 'lib/urls';
import {useRouter} from 'next/router';
import React, {useEffect} from 'react';

export default function profile() {
  const router = useRouter();
  const {user} = useAuth();

  useEffect(() => {
    if (user === null) {
      router.push(urls.pages.home);
    }
  });

  return (
    <div className="mt-4">
      <h1 className="title">Profile</h1>

      <button className="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}
