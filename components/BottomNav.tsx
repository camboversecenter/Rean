import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, MessageCircle, User, GraduationCap, Users } from './Icons';

const NAV_ITEMS = [
  { label: 'ទំព័រដើម', path: '/', icon: Home },
  { label: 'សាលារៀន', path: '/schools', icon: GraduationCap },
  { label: 'សហគមន៍', path: '/community', icon: Users }, // Community Feed
  { label: 'វគ្គសិក្សា', path: '/explore', icon: Compass },
  { label: 'សុភាទន្សាយ', path: '/chat', icon: MessageCircle },
];

const BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <item.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
