'use client';

import { FilePlus2, HeartPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { AddDocumentDialog } from './add-document-dialog';
import { AddEvolutionDialog } from './add-evolution-dialog';

export function DashboardHeader() {
  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b border-b--sidebar-border bg-sidebar p-4">
      <div>
        <h1 className="font-bold text-2xl">
          Neuro
          <span className="bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">
            prata
          </span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <AddDocumentDialog
          // biome-ignore lint/suspicious/noConsole: ignore for now
          onSave={(teste1, teste2) => console.log(teste1, teste2)}
        >
          <Button size="sm" variant="outline">
            <FilePlus2 />
            Adicionar Documento
          </Button>
        </AddDocumentDialog>
        <AddEvolutionDialog
          // biome-ignore lint/suspicious/noConsole: ignore for now
          onSave={(test1) => Promise.resolve(console.log(test1))}
        >
          <Button size="sm" variant="outline">
            <HeartPlus />
            Adicionar Evolução
          </Button>
        </AddEvolutionDialog>
        <div>
          <p>email goes here</p>
        </div>
      </div>
    </header>
  );
}
