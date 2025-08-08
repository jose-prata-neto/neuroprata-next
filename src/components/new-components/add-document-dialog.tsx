"use client";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import type { Document } from "@/interfaces";
import { useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { FilePlus2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { DocumentFormValues, documentFormSchema } from "@/models/document-form";

interface AddDocumentModalProps {
  onSave: (
    document: Omit<Document, "id" | "uploadedAt" | "url">,
    file: File
  ) => void;
}

export function AddDocumentDialog({ onSave }: AddDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      type: "report",
      file: undefined,
    },
  });

  function onSubmit(data: DocumentFormValues) {
    const file = data.file[0];
    onSave({ name: data.name, type: data.type }, file);
    setIsOpen(false);
    form.reset();
  }

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: FileList) => void
  ) {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(files);
      const currentName = form.getValues("name");
      if (!currentName.trim()) {
        const fileName = files[0].name.split(".").slice(0, -1).join(".");
        form.setValue("name", fileName);
      }
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Documento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Arquivo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      {...field}
                      value=""
                      onChange={(e) => handleFileChange(e, onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent side="top">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="report">Relatório</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
