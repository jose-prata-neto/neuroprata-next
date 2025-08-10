'use client';
import { useState } from 'react';
import { analyzeSessionNotes } from '@/actions/geminiService';
import type { SuggestedTag, Tag } from '@/interfaces';
import type { Session, SessionType } from '@/server/db/schema';
import { getLocalDateTimeString } from '@/utils/formatters';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface SessionEditorDialogProps {
  onSave: (session: Omit<Session, 'id'>, files: File[]) => Promise<void>;
}

const typeLabels: Record<SessionType, string> = {
  INDIVIDUAL: 'Individual',
  COUPLE: 'Casal',
  FAMILY: 'Família',
  GROUP: 'Grupal',
};

type Errors = {
  notes?: string;
  duration?: string;
};

type Views = 'editor' | 'review';

export function AddEvolutionDialog({ onSave }: SessionEditorDialogProps) {
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState<number>(50);
  const [sessionDate, setSessionDate] = useState(getLocalDateTimeString());
  const [sessionType, setSessionType] = useState<SessionType>('INDIVIDUAL');
  const [attachments, setAttachments] = useState<File[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Errors | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [view, setView] = useState<Views>('editor');

  function validate() {
    const newErrors: Errors = {};

    if (!notes.trim()) {
      newErrors.notes = 'Notas são obrigatórias.';
    }
    if (duration <= 0) {
      newErrors.duration = 'Duração deve ser maior que zero.';
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleAnalyze() {
    if (!validate()) return;

    setIsAnalyzing(true);
    const tags = await analyzeSessionNotes(notes);
    setSuggestedTags(tags);
    setSelectedTags(tags.filter((t) => t.relevance > 0.6));
    setIsAnalyzing(false);
    setView('review');
  }

  function toggleTagApproval(tag: Tag) {
    setSelectedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  }

  async function handleSave() {
    setIsSaving(true);
  }
}
