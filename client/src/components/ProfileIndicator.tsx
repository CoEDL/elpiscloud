import {useAuth} from 'contexts/auth';
import Link from 'next/link';
import React from 'react';
import {Button} from 'semantic-ui-react';

export default function ProfileIndicator() {
  const {user} = useAuth();

  if (!user) {
    return (
      <Link href="/signIn">
        <Button>Sign in</Button>
      </Link>
    );
  }
  return (
    <Link href="/profile">
      <Button>Profile</Button>
    </Link>
  );
}
