import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { SparklesIcon } from '@/constants';
import { analyzeSessionNotes } from '@/services/geminiService';
import type { Session, SuggestedTag, Tag } from '@/types';
import { SESSION_TYPES } from '@/types';
import { getLocalDateTimeString } from '@/utils/formatters';

interface SessionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: Omit<Session, 'id'>, files: File[]) => Promise<void>;
}

const renderProgressBar = (relevance: number) => {
    const width = Math.round(relevance * 100);
    return (
      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-slate-500" style={{ width: `${width}%` }}></div>
      </div>
    );
};

const typeLabels: Record<typeof SESSION_TYPES[number], string> = {
    individual: 'Individual',
    couple: 'Casal',
    family: 'Família',
    group: 'Grupal'
};

export const SessionEditorModal: React.FC<SessionEditorModalProps> = ({ isOpen, onClose, onSave }) => {
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(50);
  const [sessionDate, setSessionDate] = useState(getLocalDateTimeString());
  const [sessionType, setSessionType] = useState<typeof SESSION_TYPES[number]>('individual');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ notes?: string, duration?: string }>({});
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]);
  const [approvedTags, setApprovedTags] = useState<Tag[]>([]);
  const [view, setView] = useState<'editor' | 'review'>('editor');

  useEffect(() => {
    if (!isOpen) {
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
    } else {
      setSessionDate(getLocalDateTimeString());
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
    setApprovedTags(tags.filter(t => t.relevance > 0.6));
    setIsAnalyzing(false);
    setView('review');
  };

  const toggleTagApproval = (tag: Tag) => {
    setApprovedTags(prev => 
      prev.find(t => t.id === tag.id) 
        ? prev.filter(t => t.id !== tag.id)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
        // A CORREÇÃO ESTÁ AQUI: Adicionamos o 'paymentStatus' com o valor padrão.
        await onSave({ 
            notes, 
            duration,
            sessionType,
            tags: approvedTags,
            attachments: [],
            date: new Date(sessionDate).toISOString(),
            paymentStatus: 'pending', // <-- Adicionado valor padrão
        }, attachments);
    } catch (error) {
        console.error("Error saving session:", error);
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setAttachments(prev => prev.filter(file => file !== fileToRemove));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={view === 'editor' ? "Registrar Sessão Terapêutica" : "Revisar Tags Sugeridas"}>
      {view === 'editor' && (
        <div className="space-y-4">
            <div>
              <label htmlFor="sessionDate" className="block text-sm font-medium text-slate-700">Data e Hora da Sessão</label>
              <input
                type="datetime-local"
                id="sessionDate"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-slate-700">Duração (minutos)</label>
                  <input
                    type="number"
                    id="duration"
                    value={duration}
                    onChange={(e) => {
                        setDuration(Number(e.target.value));
                        if(errors.duration) setErrors(p => ({...p, duration: undefined}));
                    }}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.duration ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'}`}
                  />
                  {errors.duration && <p className="text-sm text-red-600 mt-1">{errors.duration}</p>}
                </div>
                 <div>
                  <label htmlFor="sessionType" className="block text-sm font-medium text-slate-700">Tipo de Atendimento</label>
                  <select id="sessionType" value={sessionType} onChange={e => setSessionType(e.target.value as typeof SESSION_TYPES[number])} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm">
                    {SESSION_TYPES.map(type => (
                       <option key={type} value={type}>{typeLabels[type]}</option>
                    ))}
                  </select>
                </div>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Anotações da Sessão</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => {
                    setNotes(e.target.value);
                    if(errors.notes) setErrors(p => ({...p, notes: undefined}));
                }}
                rows={8}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.notes ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'}`}
                placeholder="Utilize este espaço para anotações livres, seguindo templates como SOAP ou BPS se desejar..."
              />
              {errors.notes && <p className="text-sm text-red-600 mt-1">{errors.notes}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Anexar Arquivos</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-slate-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-slate-500">
                              <span>Carregar arquivos</span>
                              <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} />
                          </label>
                          <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-slate-500">PNG, JPG, PDF, etc.</p>
                  </div>
              </div>
              {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-slate-800">Arquivos selecionados:</h4>
                      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-md max-h-28 overflow-y-auto">
                          {attachments.map((file, index) => (
                              <li key={index} className="px-3 py-2 flex items-center justify-between text-sm bg-white">
                                  <span className="text-slate-700 truncate flex-1 mr-4">{file.name}</span>
                                  <button type="button" onClick={() => removeFile(file)} className="text-red-600 hover:text-red-800 font-bold">&times;</button>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
              <Button type="button" onClick={handleAnalyze} isLoading={isAnalyzing}>
                <SparklesIcon className="mr-2 h-5 w-5"/>
                {isAnalyzing ? "Analisando..." : "Analisar Anotações"}
              </Button>
            </div>
        </div>
      )}

      {view === 'review' && (
         <div className="space-y-4">
            <p className="text-sm text-slate-600">A IA analisou as anotações e sugeriu as tags abaixo. Selecione as que são clinicamente relevantes para esta sessão.</p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Tags Sugeridas</h4>
              <ul className="space-y-2">
                {suggestedTags.map(tag => (
                  <li key={tag.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        id={`tag-${tag.id}`}
                        checked={!!approvedTags.find(t => t.id === tag.id)}
                        onChange={() => toggleTagApproval(tag)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-600 focus:ring-slate-500"
                      />
                      <label htmlFor={`tag-${tag.id}`} className="ml-3 text-sm text-slate-700">{tag.text}</label>
                    </div>
                    <div className="flex items-center space-x-2">
                       <span className="text-xs text-slate-500">{tag.relevance.toFixed(2)}</span>
                       {renderProgressBar(tag.relevance)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
             <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setView('editor')}>Voltar ao Editor</Button>
              <Button type="button" onClick={handleSave} isLoading={isSaving}>
                 {isSaving ? "Salvando..." : "Salvar Sessão"}
              </Button>
            </div>
         </div>
      )}
    </Modal>
  );
};