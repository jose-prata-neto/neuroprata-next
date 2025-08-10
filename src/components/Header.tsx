import { Brain } from 'lucide-react';
import type React from 'react';
import type { User } from '@/server/db/schema';
import Button from './Button';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-slate-800" />
            <span className="ml-3 font-bold text-2xl text-slate-800">
              NeuroPrata
            </span>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="font-medium text-slate-600 text-sm">
                Bem-vindo(a),{' '}
                <span className="font-bold">{user.name.split(' ')[0]}</span>
              </span>
              <Button onClick={onLogout} size="sm" variant="secondary">
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
