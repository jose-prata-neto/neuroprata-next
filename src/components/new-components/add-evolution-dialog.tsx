'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { analyzeSessionNotes } from '@/actions/geminiService';
import type { SuggestedTag, Tag } from '@/interfaces';
import {
  type EvolutionFormValues,
  evolutionFormSchema,
} from '@/models/evolution-form';
import type { Session } from '@/server/db/schema';
import { getLocalDateTimeString } from '@/utils/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { SessionEditorView } from './session-editor-view';
import { SessionTagsReviewView } from './session-tags-review-view';

interface AddEvolutionDialogProps {
  children: React.ReactNode;
  onSave: (session: Omit<Session, 'id'>, files: File[]) => Promise<void>;
}

type Views = 'editor' | 'review';

export function AddEvolutionDialog({
  onSave,
  children,
}: AddEvolutionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [view, setView] = useState<Views>('editor');

  const form = useForm<EvolutionFormValues>({
    resolver: zodResolver(evolutionFormSchema),
    defaultValues: {
      notes: '',
      duration: 50,
      sessionDate: getLocalDateTimeString(),
      sessionType: 'INDIVIDUAL',
    },
  });

  async function handleAnalyze(data: EvolutionFormValues) {
    setIsAnalyzing(true);

    try {
      const tags = await analyzeSessionNotes(data.notes);
      setSuggestedTags(tags);
      setSelectedTags(tags.filter((t) => t.relevance > 0.6));
      setView('review');
    } catch {
      toast('Erro ao analisar as anotações.');
    } finally {
      setIsAnalyzing(false);
    }
  }
  function toggleTagApproval(tag: Tag) {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  }

  async function handleSave() {
    const formData = form.getValues();

    setIsSaving(true);
    try {
      const session: Omit<Session, 'id'> = {
        notes: formData.notes,
        duration: formData.duration,
        sessionType: formData.sessionType,
        date: new Date(formData.sessionDate),
        status: 'SCHEDULED',
        createdAt: null,
        psychologistId: null,
        patientId: null,
      };

      const files = formData.attachments
        ? Array.from(formData.attachments)
        : [];
      await onSave(session, files);
      setIsOpen(false);
      resetForm();
    } catch {
      toast('Erro ao salvar a sessão.');
      setIsSaving(false);
    }
  }

  function resetForm() {
    setTimeout(() => {
      form.reset({
        notes: '',
        duration: 50,
        sessionDate: getLocalDateTimeString(),
        sessionType: 'INDIVIDUAL',
      });
      setIsAnalyzing(false);
      setSuggestedTags([]);
      setSelectedTags([]);
      setView('editor');
      setIsSaving(false);
    }, 300);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {view === 'editor'
              ? 'Registrar Sessão Terapêutica'
              : 'Revisar Tags Sugeridas'}
          </DialogTitle>
          <DialogDescription>
            {view === 'editor'
              ? 'Preencha os detalhes da sessão e anexe arquivos se necessário.'
              : 'A IA analisou as anotações e sugeriu as tags abaixo. Selecione as que são clinicamente relevantes para esta sessão.'}
          </DialogDescription>
        </DialogHeader>

        {view === 'editor' && (
          <SessionEditorView
            form={form}
            isAnalyzing={isAnalyzing}
            onCancel={() => setIsOpen(false)}
            onSubmit={handleAnalyze}
          />
        )}

        {view === 'review' && (
          <SessionTagsReviewView
            isSaving={isSaving}
            onBackToEditor={() => setView('editor')}
            onSave={handleSave}
            onToggleTag={toggleTagApproval}
            selectedTags={selectedTags}
            suggestedTags={suggestedTags}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
