import React, {useEffect, useState} from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  AuthError,
} from 'firebase/auth';
import {auth} from 'lib/auth';
import {useRouter} from 'next/router';
import {useAuth} from 'contexts/auth';
import LoadingIndicator from 'components/LoadingIndicator';

const signIn = () => {
  const router = useRouter();
  const {user} = useAuth();

  useEffect(() => {
    if (user) {
      router.back();
    }
  });

  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const methodText = (signIn: boolean) => (signIn ? 'Sign in' : 'Sign up');
  const switchPrefix = isSignIn ? "Don't" : 'Already';

  const onChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setState({...state, [field]: event.target.value});

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const authFunc = isSignIn
      ? signInWithEmailAndPassword
      : createUserWithEmailAndPassword;
    try {
      await authFunc(auth, state.email, state.password);
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
    }
    setLoading(false);
  };

  const inputErrorStyle = error !== '' ? 'border-red-400' : '';

  return (
    <div className="relative m-8 mx-auto max-w-3xl rounded-2xl bg-gray-100 p-8 shadow-lg">
      <h1 className="title">{methodText(isSignIn)}</h1>
      <p className="text-gray-400">
        {`${switchPrefix} have an account? `}
        <span
          className="cursor-pointer text-blue-600"
          onClick={() => setIsSignIn(!isSignIn)}
        >
          {methodText(!isSignIn)}
        </span>
      </p>

      {/* Loading Indicator */}
      {loading && <LoadingIndicator />}

      <form className="cols-2 mt-4 flex flex-col" onSubmit={onSubmit}>
        {/* Email */}
        <div className="mt-4 flex flex-col space-y-1">
          <label
            className="text-sm font-semibold tracking-wide text-gray-600"
            htmlFor="email"
          >
            Email:
          </label>
          <input
            className={`h-12 rounded-md ${inputErrorStyle}`}
            type="email"
            name="email"
            id="email"
            value={state.email}
            onChange={onChange('email')}
          />
        </div>

        {/* Password */}
        <div className="mt-4 flex flex-col space-y-1">
          <label
            className="text-sm font-semibold tracking-wide text-gray-600"
            htmlFor="password"
          >
            Password:
          </label>
          <input
            className={`h-12 rounded-md ${inputErrorStyle}`}
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="password"
            value={state.password}
            onChange={onChange('password')}
          />
        </div>

        {/* Show password checkbox */}
        <div className="mt-2 flex items-center space-x-2">
          <label
            className="text-sm tracking-wide text-gray-600"
            htmlFor="showPassword"
          >
            Show password
          </label>
          <input
            className="rounded-sm"
            type="checkbox"
            id="showPassword"
            value={showPassword ? 'checked' : ''}
            onChange={() => setShowPassword(!showPassword)}
          />
        </div>

        {isSignIn && (
          <p className="mt-6 text-blue-600">Forgot your password?</p>
        )}

        <button className="button mt-8" type="submit">
          {methodText(isSignIn)}
        </button>
      </form>
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </div>
  );
};

export default signIn;
