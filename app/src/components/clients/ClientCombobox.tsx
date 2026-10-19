import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

export type ClientOption = {
  id: number;
  name: string;
  phone?: string | null;
};

/**
 * Select de cliente com pesquisa — substitui o dropdown simples quando a
 * lista fica grande (digitar "mar" filtra Maria, Marcos...).
 * Mesmo contrato do Select antigo: value/onChange em string.
 */
export function ClientCombobox({
  clients,
  value,
  onChange,
  onCreate,
  placeholder = "Selecione",
  disabled,
}: {
  clients: ClientOption[] | undefined;
  value: string;
  onChange: (clientId: string) => void;
  onCreate?: (name: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = clients?.find(c => String(c.id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[60] w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Buscar cliente..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {clients?.map(c => (
                <CommandItem
                  key={c.id}
                  value={`${c.name} ${c.phone ?? ""}`}
                  onSelect={() => {
                    onChange(String(c.id));
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === String(c.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{c.name}</span>
                  {c.phone && (
                    <span className="ml-2 truncate text-xs opacity-60">
                      {c.phone}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {onCreate && search.trim() && (
            <div className="border-t p-1">
              <button
                type="button"
                onClick={() => {
                  onCreate(search.trim());
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm text-primary hover:bg-primary/5"
              >
                <span>＋</span>
                Cadastrar "{search.trim()}"
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
