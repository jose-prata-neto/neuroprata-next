import { SparklesIcon } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { analyzeSessionNotes } from '@/actions/geminiService';
import type { SuggestedTag, Tag } from '@/interfaces';
import { SESSION_TYPES } from '@/interfaces';
import type { Session } from '@/server/db/schema';
import { getLocalDateTimeString } from '@/utils/formatters';
import Button from './Button';
import Modal from './Modal';

interface SessionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<Session, 'id'>, files: File[]) => Promise<void>;
}

const renderProgressBar = (relevance: number) => {
  const width = Math.round(relevance * 100);
  return (
    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
      <div className="h-full bg-slate-500" style={{ width: `${width}%` }} />
    </div>
  );
};

const typeLabels: Record<(typeof SESSION_TYPES)[number], string> = {
  individual: 'Individual',
  couple: 'Casal',
  family: 'Família',
  group: 'Grupal',
};

export const SessionEditorModal: React.FC<SessionEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(50);
  const [sessionDate, setSessionDate] = useState(getLocalDateTimeString());
  const [sessionType, setSessionType] =
    useState<(typeof SESSION_TYPES)[number]>('individual');
  const [attachments, setAttachments] = useState<File[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ notes?: string; duration?: string }>(
    {}
  );
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]);
  const [approvedTags, setApprovedTags] = useState<Tag[]>([]);
  const [view, setView] = useState<'editor' | 'review'>('editor');

  useEffect(() => {
    if (isOpen) {
      setSessionDate(getLocalDateTimeString());
    } else {
      setTimeout(() => {
        setNotes('');
        setDuration(50);
        setSessionType('individual');
        setSessionDate(getLocalDateTimeString());
        setAttachments([]);
        setIsAnalyzing(false);
        setSuggestedTags([]);
        setApprovedTags([]);
        setView('editor');
        setErrors({});
        setIsSaving(false);
      }, 300);
    }
  }, [isOpen]);

  const validateEditorView = () => {
    const newErrors: { notes?: string; duration?: string } = {};
    if (!notes.trim()) {
      newErrors.notes = 'As anotações são obrigatórias para a análise.';
    }
    if (duration <= 0) {
      newErrors.duration = 'A duração deve ser um número positivo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateEditorView()) return;

    setIsAnalyzing(true);
    const tags = await analyzeSessionNotes(notes);
    setSuggestedTags(tags);
    setApprovedTags(tags.filter((t) => t.relevance > 0.6));
    setIsAnalyzing(false);
    setView('review');
  };

  const toggleTagApproval = (tag: Tag) => {
    setApprovedTags((prev) =>
      prev.find((t) => t.id === tag.id)
        ? prev.filter((t) => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // A CORREÇÃO ESTÁ AQUI: Adicionamos o 'paymentStatus' com o valor padrão.
      await onSave(
        {
          notes,
          duration,
          sessionType,
          tags: approvedTags,
          attachments: [],
          date: new Date(sessionDate).toISOString(),
          paymentStatus: 'pending', // <-- Adicionado valor padrão
        },
        attachments
      );
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [
        ...prev,
        ...Array.from(e.target.files as FileList),
      ]);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setAttachments((prev) => prev.filter((file) => file !== fileToRemove));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        view === 'editor'
          ? 'Registrar Sessão Terapêutica'
          : 'Revisar Tags Sugeridas'
      }
    >
      {view === 'editor' && (
        <div className="space-y-4">
          <div>
            <label
              className="block font-medium text-slate-700 text-sm"
              htmlFor="sessionDate"
            >
              Data e Hora da Sessão
            </label>
            <input
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              id="sessionDate"
              onChange={(e) => setSessionDate(e.target.value)}
              type="datetime-local"
              value={sessionDate}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block font-medium text-slate-700 text-sm"
                htmlFor="duration"
              >
                Duração (minutos)
              </label>
              <input
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.duration
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
                }`}
                id="duration"
                onChange={(e) => {
                  setDuration(Number(e.target.value));
                  if (errors.duration)
                    setErrors((p) => ({ ...p, duration: undefined }));
                }}
                type="number"
                value={duration}
              />
              {errors.duration && (
                <p className="mt-1 text-red-600 text-sm">{errors.duration}</p>
              )}
            </div>
            <div>
              <label
                className="block font-medium text-slate-700 text-sm"
                htmlFor="sessionType"
              >
                Tipo de Atendimento
              </label>
              <select
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
                id="sessionType"
                onChange={(e) =>
                  setSessionType(
                    e.target.value as (typeof SESSION_TYPES)[number]
                  )
                }
                value={sessionType}
              >
                {SESSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {typeLabels[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              className="block font-medium text-slate-700 text-sm"
              htmlFor="notes"
            >
              Anotações da Sessão
            </label>
            <textarea
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.notes
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
              }`}
              id="notes"
              onChange={(e) => {
                setNotes(e.target.value);
                if (errors.notes)
                  setErrors((p) => ({ ...p, notes: undefined }));
              }}
              placeholder="Utilize este espaço para anotações livres, seguindo templates como SOAP ou BPS se desejar..."
              rows={8}
              value={notes}
            />
            {errors.notes && (
              <p className="mt-1 text-red-600 text-sm">{errors.notes}</p>
            )}
          </div>
          <div>
            <label className="block font-medium text-slate-700 text-sm">
              Anexar Arquivos
            </label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-slate-300 border-dashed px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <svg
                  aria-hidden="true"
                  className="mx-auto h-12 w-12 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                <div className="flex text-slate-600 text-sm">
                  <label
                    className="relative cursor-pointer rounded-md bg-white font-medium text-slate-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-500 focus-within:ring-offset-2 hover:text-slate-500"
                    htmlFor="file-upload"
                  >
                    <span>Carregar arquivos</span>
                    <input
                      className="sr-only"
                      id="file-upload"
                      multiple
                      name="file-upload"
                      onChange={handleFileChange}
                      type="file"
                    />
                  </label>
                  <p className="pl-1">ou arraste e solte</p>
                </div>
                <p className="text-slate-500 text-xs">PNG, JPG, PDF, etc.</p>
              </div>
            </div>
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-slate-800 text-sm">
                  Arquivos selecionados:
                </h4>
                <ul className="max-h-28 divide-y divide-slate-200 overflow-y-auto rounded-md border border-slate-200">
                  {attachments.map((file, index) => (
                    <li
                      className="flex items-center justify-between bg-white px-3 py-2 text-sm"
                      key={index}
                    >
                      <span className="mr-4 flex-1 truncate text-slate-700">
                        {file.name}
                      </span>
                      <button
                        className="font-bold text-red-600 hover:text-red-800"
                        onClick={() => removeFile(file)}
                        type="button"
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={onClose} type="button" variant="secondary">
              Cancelar
            </Button>
            <Button
              isLoading={isAnalyzing}
              onClick={handleAnalyze}
              type="button"
            >
              <SparklesIcon className="mr-2 h-5 w-5" />
              {isAnalyzing ? 'Analisando...' : 'Analisar Anotações'}
            </Button>
          </div>
        </div>
      )}

      {view === 'review' && (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            A IA analisou as anotações e sugeriu as tags abaixo. Selecione as
            que são clinicamente relevantes para esta sessão.
          </p>
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-800 text-sm">
              Tags Sugeridas
            </h4>
            <ul className="space-y-2">
              {suggestedTags.map((tag) => (
                <li className="flex items-center justify-between" key={tag.id}>
                  <div className="flex items-center">
                    <input
                      checked={!!approvedTags.find((t) => t.id === tag.id)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                      id={`tag-${tag.id}`}
                      onChange={() => toggleTagApproval(tag)}
                      type="checkbox"
                    />
                    <label
                      className="ml-3 text-slate-700 text-sm"
                      htmlFor={`tag-${tag.id}`}
                    >
                      {tag.text}
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-xs">
                      {tag.relevance.toFixed(2)}
                    </span>
                    {renderProgressBar(tag.relevance)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setView('editor')}
              type="button"
              variant="ghost"
            >
              Voltar ao Editor
            </Button>
            <Button isLoading={isSaving} onClick={handleSave} type="button">
              {isSaving ? 'Salvando...' : 'Salvar Sessão'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
