'use client';

import { SparklesIcon } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import type { EvolutionFormValues } from '@/models/evolution-form';
import { Button } from '../ui/button';
import { DialogFooter } from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

const typeLabels = {
  INDIVIDUAL: 'Individual',
  COUPLE: 'Casal',
  FAMILY: 'Família',
  GROUP: 'Grupal',
} as const;

interface SessionEditorViewProps {
  form: UseFormReturn<EvolutionFormValues>;
  onSubmit: (data: EvolutionFormValues) => void;
  isAnalyzing: boolean;
  onCancel: () => void;
}

export function SessionEditorView({
  form,
  onSubmit,
  isAnalyzing,
  onCancel,
}: SessionEditorViewProps) {
  const attachments = form.watch('attachments');
  const attachmentFiles = attachments ? Array.from(attachments) : [];

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: FileList | undefined) => void
  ) {
    const files = e.target.files;
    if (files && files.length > 0) {
      onChange(files);
    } else {
      onChange(undefined);
    }
  }

  function removeFile(fileToRemove: File) {
    const currentFiles = form.getValues('attachments');
    if (currentFiles) {
      const fileArray = Array.from(currentFiles);
      const filteredFiles = fileArray.filter((file) => file !== fileToRemove);

      const dt = new DataTransfer();
      for (const file of filteredFiles) {
        dt.items.add(file as File);
      }
      form.setValue('attachments', dt.files.length > 0 ? dt.files : undefined);
    }
  }

  function handleFormSubmit(data: EvolutionFormValues) {
    onSubmit(data);
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleFormSubmit)}
      >
        <FormField
          control={form.control}
          name="sessionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora da Sessão</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sessionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Atendimento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([type, label]) => (
                      <SelectItem key={type} value={type}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anotações da Sessão</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Utilize este espaço para anotações livres, seguindo templates como SOAP ou BPS se desejar..."
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachments"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Anexar Arquivos</FormLabel>
              <FormControl>
                <div className="flex justify-center rounded-md border-2 border-muted-foreground/25 border-dashed px-6 py-10">
                  <div className="space-y-1 text-center">
                    <svg
                      aria-hidden="true"
                      className="mx-auto h-12 w-12 text-muted-foreground"
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
                    <div className="flex text-muted-foreground text-sm">
                      <Label
                        className="relative cursor-pointer rounded-md bg-background font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                        htmlFor="file-upload"
                      >
                        <span>Carregar arquivos</span>
                        <Input
                          {...field}
                          className="sr-only"
                          id="file-upload"
                          multiple
                          name="file-upload"
                          onChange={(e) => handleFileChange(e, onChange)}
                          type="file"
                          value=""
                        />
                      </Label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      PNG, JPG, PDF, etc.
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {attachmentFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="font-medium text-sm">
              Arquivos selecionados:
            </Label>
            <ul className="max-h-28 divide-y divide-border overflow-y-auto rounded-md border">
              {attachmentFiles.map((file, index) => (
                <li
                  className="flex items-center justify-between bg-background px-3 py-2 text-sm"
                  key={`${(file as File).name}-${index}`}
                >
                  <span className="mr-4 flex-1 truncate text-foreground">
                    {(file as File).name}
                  </span>
                  <Button
                    className="h-auto p-1 text-destructive hover:text-destructive/80"
                    onClick={() => removeFile(file as File)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onCancel} type="button" variant="secondary">
            Cancelar
          </Button>
          <Button disabled={isAnalyzing} type="submit">
            <SparklesIcon className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analisando...' : 'Analisar Anotações'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
