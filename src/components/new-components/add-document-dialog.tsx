'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Document } from '@/interfaces';
import {
  type DocumentFormValues,
  documentFormSchema,
} from '@/models/document-form';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface AddDocumentModalProps {
  children: React.ReactNode;
  onSave: (
    document: Omit<Document, 'id' | 'uploadedAt' | 'url'>,
    file: File
  ) => void;
}

export function AddDocumentDialog({ onSave, children }: AddDocumentModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: '',
      type: 'report',
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
      const currentName = form.getValues('name');
      if (!currentName.trim()) {
        const fileName = files[0].name.split('.').slice(0, -1).join('.');
        form.setValue('name', fileName);
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
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do documento e selecione o arquivo para upload.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
                      onChange={(e) => handleFileChange(e, onChange)}
                      value=""
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
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
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
