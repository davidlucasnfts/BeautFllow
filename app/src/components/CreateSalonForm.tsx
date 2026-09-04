import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { segmentLabels, type SalonSegment } from "@contracts/segment-labels";
import { getSegmentServices } from "@contracts/segment-services";
import { getSegmentPalette } from "@contracts/segment-palettes";

const segments: SalonSegment[] = [
  "beauty_salon",
  "barbershop",
  "aesthetic_clinic",
];

export default function CreateSalonForm() {
  const [name, setName] = useState("");
  const [segment, setSegment] = useState<SalonSegment>("beauty_salon");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const palette = getSegmentPalette(segment);

  const createMutation = trpc.salon.create.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
    onError: err => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !slug.trim()) {
      setError("Preencha nome e identificador do seu negócio.");
      return;
    }

    const generatedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    createMutation.mutate({
      name: name.trim(),
      slug: generatedSlug,
      segment,
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: `${palette.primary}10` }}
    >
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl" style={{ color: palette.primary }}>
            Bem-vindo ao StudioFlow
          </CardTitle>
          <CardDescription>
            Configure o seu negócio para começar a usar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="segment">Qual o tipo do seu negócio?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {segments.map(seg => (
                  <button
                    key={seg}
                    type="button"
                    onClick={() => setSegment(seg)}
                    className="rounded-lg border p-4 text-left transition-colors"
                    style={
                      segment === seg
                        ? {
                            borderColor: palette.primary,
                            backgroundColor: `${palette.primary}10`,
                          }
                        : undefined
                    }
                  >
                    <div className="font-medium">
                      {segmentLabels[seg].segmentName}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do {segmentLabels[segment].segmentName.toLowerCase()}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Studio Cabelo & Cia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Identificador único (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="Ex: studio-cabelo"
                required
              />
              <p className="text-xs text-muted-foreground">
                Será usado na URL pública do seu agendamento.
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-1">Serviços sugeridos:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                {getSegmentServices(segment).map(service => (
                  <li key={service.name}>{service.name}</li>
                ))}
              </ul>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createMutation.isPending}
              style={{
                backgroundColor: palette.primary,
                color: "#ffffff",
              }}
            >
              {createMutation.isPending ? "Criando..." : "Criar meu negócio"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
