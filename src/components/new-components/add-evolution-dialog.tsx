"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import {} from "../ui/input";
import {} from "../ui/label";
import { Button } from "../ui/button";
import type { Session, SESSION_TYPES, SuggestedTag, Tag } from "@/types";
import { useState } from "react";
import { getLocalDateTimeString } from "@/utils/formatters";
import { analyzeSessionNotes } from "@/services/geminiService";

interface SessionEditorDialogProps {
  onSave: (session: Omit<Session, "id">, files: File[]) => Promise<void>;
}

type SessionType = (typeof SESSION_TYPES)[number];

const typeLabels: Record<SessionType, string> = {
  individual: "Individual",
  couple: "Casal",
  family: "Família",
  group: "Grupal",
};

type Errors = {
  notes?: string;
  duration?: string;
};

type Views = "editor" | "review";

export function AddEvolutionDialog({ onSave }: SessionEditorDialogProps) {
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState<number>(50);
  const [sessionDate, setSessionDate] = useState(getLocalDateTimeString());
  const [sessionType, setSessionType] = useState<SessionType>("individual");
  const [attachments, setAttachments] = useState<File[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Errors | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<SuggestedTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [view, setView] = useState<Views>("editor");

  function validate() {
    const newErrors: Errors = {};

    if (!notes.trim()) {
      newErrors.notes = "Notas são obrigatórias.";
    }
    if (duration <= 0) {
      newErrors.duration = "Duração deve ser maior que zero.";
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
    setView("review");
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
