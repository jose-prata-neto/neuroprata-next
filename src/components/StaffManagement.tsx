import { UserCircle } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { User } from '@/interfaces';
import Button from './Button';

interface StaffManagementProps {
  currentUser: User;
  allUsers: User[];
  onLinkStaff: (
    staffEmail: string
  ) => Promise<{ success: boolean; error?: string }>;
  onUnlinkStaff: (staffId: string) => void;
}

const StaffManagement: React.FC<StaffManagementProps> = ({
  currentUser,
  allUsers,
  onLinkStaff,
  onUnlinkStaff,
}) => {
  const [staffEmail, setStaffEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const linkedStaffMember = useMemo(() => {
    const linkedId = currentUser.linkedUserIds?.[0];
    if (!linkedId) return null;
    return allUsers.find((u) => u.id === linkedId);
  }, [currentUser, allUsers]);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const result = await onLinkStaff(staffEmail);

    if (result.success) {
      setSuccessMessage('Funcionário vinculado com sucesso!');
      setStaffEmail('');
    } else {
      setError(result.error || 'Ocorreu um erro desconhecido.');
    }
    setIsLoading(false);
  };

  const handleUnlink = () => {
    if (linkedStaffMember) {
      onUnlinkStaff(linkedStaffMember.id);
      setSuccessMessage('Funcionário desvinculado com sucesso!');
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-2xl">
        <h2 className="mb-2 font-bold text-3xl text-slate-800">
          Gerenciar Equipe
        </h2>
        <p className="mb-8 text-slate-600">
          Vincule um funcionário à sua conta para permitir que ele gerencie seus
          pacientes.
        </p>

        {linkedStaffMember ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-slate-800 text-xl">
              Funcionário Vinculado
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <UserCircle className="h-10 w-10 text-slate-500" />
                <div>
                  <p className="font-semibold text-slate-800">
                    {linkedStaffMember.name}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {linkedStaffMember.email}
                  </p>
                </div>
              </div>
              <Button onClick={handleUnlink} variant="secondary">
                Desvincular
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={handleLink}
          >
            <h3 className="mb-4 font-bold text-slate-800 text-xl">
              Vincular Novo Funcionário
            </h3>
            <p className="mb-4 text-slate-600 text-sm">
              Digite o e-mail do funcionário que você deseja vincular. A conta
              do funcionário já deve ter sido criada no sistema.
            </p>
            <div className="flex items-start space-x-2">
              <div className="flex-grow">
                <label className="sr-only" htmlFor="staff-email">
                  Email do Funcionário
                </label>
                <input
                  className="block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
                  id="staff-email"
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="email@do-funcionario.com"
                  required
                  type="email"
                  value={staffEmail}
                />
              </div>
              <Button isLoading={isLoading} type="submit">
                {isLoading ? 'Vinculando...' : 'Vincular'}
              </Button>
            </div>
            {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          </form>
        )}

        {successMessage && (
          <p className="mt-4 text-center text-green-600 text-sm">
            {successMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
