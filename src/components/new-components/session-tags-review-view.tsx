'use client';

import type { SuggestedTag, Tag } from '@/interfaces';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';

interface SessionTagsReviewViewProps {
  suggestedTags: SuggestedTag[];
  selectedTags: Tag[];
  onToggleTag: (tag: Tag) => void;
  isSaving: boolean;
  onSave: () => void;
  onBackToEditor: () => void;
}

export function SessionTagsReviewView({
  suggestedTags,
  selectedTags,
  onToggleTag,
  isSaving,
  onSave,
  onBackToEditor,
}: SessionTagsReviewViewProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        A IA analisou as anotações e sugeriu as tags abaixo. Selecione as que
        são clinicamente relevantes para esta sessão.
      </p>

      <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
        <h4 className="font-semibold text-sm">Tags Sugeridas</h4>
        <ul className="space-y-3">
          {suggestedTags.map((tag) => {
            const isSelected = selectedTags.some((t) => t.id === tag.id);
            const relevancePercentage = Math.round(tag.relevance * 100);

            return (
              <li className="flex items-center justify-between" key={tag.id}>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSelected}
                    id={`tag-${tag.id}`}
                    onCheckedChange={() => onToggleTag(tag)}
                  />
                  <Label
                    className="cursor-pointer font-normal text-sm"
                    htmlFor={`tag-${tag.id}`}
                  >
                    {tag.text}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground text-xs">
                    {tag.relevance.toFixed(2)}
                  </span>
                  <div className="w-20">
                    <Progress className="h-2" value={relevancePercentage} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <DialogFooter>
        <Button onClick={onBackToEditor} type="button" variant="ghost">
          Voltar ao Editor
        </Button>
        <Button disabled={isSaving} onClick={onSave} type="button">
          {isSaving ? 'Salvando...' : 'Salvar Sessão'}
        </Button>
      </DialogFooter>
    </div>
  );
}
