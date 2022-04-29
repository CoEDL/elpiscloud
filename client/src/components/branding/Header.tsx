import React from 'react';
import Link from 'next/link';
import ProfileIndicator from 'components/ProfileIndicator';

const Header = () => (
  <div className="h-16 bg-gray-800">
    <nav className="container flex h-full items-center text-white">
      {/* Left Menu */}
      <ul className="flex flex-1 divide-x divide-gray-500">
        {links.map(({name, link}) => (
          <Link key={name} href={link}>
            <li className="cursor-pointer px-4 font-semibold first:pl-0">
              {name}
            </li>
          </Link>
        ))}
      </ul>
      {/* Right menu */}
      <ProfileIndicator />
    </nav>
  </div>
);

const links = [
  {
    name: 'Elpiscloud',
    link: '/',
  },
  {
    name: 'Files',
    link: '/files',
  },
  {
    name: 'Datasets',
    link: '/datasets',
  },
  {
    name: 'Models',
    link: '/models',
  },
  {
    name: 'Transcribe',
    link: '/transcribe',
  },
];

export default Header;
