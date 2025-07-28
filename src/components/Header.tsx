
import React from 'react';
import type { User } from '@/types';
import Button from './Button';
import { NeuronIcon } from '@/constants';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <NeuronIcon className="h-8 w-8 text-slate-800" />
            <span className="ml-3 text-2xl font-bold text-slate-800">NeuroPrata</span>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600">
                    Bem-vindo(a), <span className="font-bold">{user.name.split(' ')[0]}</span>
                </span>
                <Button onClick={onLogout} variant="secondary" size="sm">
                    Sair
                </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
