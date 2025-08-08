"use client";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogPortal,
} from "../ui/dialog";
import { Button } from "../ui/button";
import type { Document, DocumentType } from "@/interfaces";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { FilePlus2 } from "lucide-react";

interface AddDocumentModalProps {
  onSave: (
    document: Omit<Document, "id" | "uploadedAt" | "url">,
    file: File
  ) => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function AddDocumentDialog({ onSave }: AddDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState<string>("");
  const [type, setType] = useState<DocumentType>("report");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setType("report");
      setFile(null);
      setError(null);
    }
  }, [isOpen]);

  function validate() {
    if (!name?.trim() || !file) {
      setError("Nome do documento e arquivo são obrigatórios.");
      return false;
    }
    return true;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validate() && file) {
      onSave({ name, type }, file);
      setIsOpen(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
        setError(`O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB.`);
        setFile(null);
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.split(".").slice(0, -1).join("."));
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="absolute bototm-5 left-5"
          variant="outline"
          onClick={() => setIsOpen(true)}
        >
          <FilePlus2 />
          Adicionar Documento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do documento e selecione o arquivo para upload.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Label>Nome do Documento</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Label>Arquivo</Label>
          <Input type="file" onChange={handleFileChange} />
          <Label>Tipo de Documento</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as DocumentType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue className="w-full" placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="image">Imagem</SelectItem>
              <SelectItem value="report">Relatório</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
