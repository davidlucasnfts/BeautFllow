import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ServiceOption = {
  id: number;
  name: string;
  price: string | number;
  durationMinutes: number;
};

/**
 * Multi-select de serviços com pesquisa — usado para os serviços adicionais
 * do atendimento (ex.: escova + hidratação). O serviço principal é excluído
 * da lista via excludeIds.
 */
export function ServiceMultiSelect({
  services,
  selectedIds,
  onChange,
  excludeIds = [],
  placeholder = "Adicionar serviços...",
  disabled,
}: {
  services: ServiceOption[] | undefined;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeIds?: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const options = (services ?? []).filter(
    s => !excludeIds.includes(String(s.id))
  );
  const selected = (services ?? []).filter(s =>
    selectedIds.includes(String(s.id))
  );

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(v => v !== id)
        : [...selectedIds, id]
    );
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            <span className="truncate text-muted-foreground">
              {placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[60] w-[--radix-popover-trigger-width] p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Buscar serviço..." />
            <CommandList>
              <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map(s => (
                  <CommandItem
                    key={s.id}
                    value={s.name}
                    onSelect={() => toggle(String(s.id))}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        selectedIds.includes(String(s.id))
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="truncate">{s.name}</span>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      R$ {s.price}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(s => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
            >
              {s.name}
              <button
                type="button"
                aria-label={`Remover ${s.name}`}
                onClick={() => toggle(String(s.id))}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
