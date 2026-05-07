import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Testimonial {
  name: string;
  role: string;
  salon: string;
  avatar: string;
  text: string;
  rating: number;
  metric: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Mariana Costa",
    role: "Proprietária",
    salon: "Studio Mariana",
    avatar: "MC",
    text: "Em 2 semanas reduzi meus faltosos de 18% para 4%. Os lembretes automáticos são um game changer.",
    rating: 5,
    metric: "-78% no-show",
  },
  {
    name: "João Pedro",
    role: "Gerente",
    salon: "Barbearia JP",
    avatar: "JP",
    text: "Consegui organizar 3 barbeiros no mesmo calendário sem confusão. Meus clientes adoram agendar pelo link.",
    rating: 5,
    metric: "+40 agendamentos/semana",
  },
  {
    name: "Luiza Andrade",
    role: "Esteticista",
    salon: "Spa Luiza",
    avatar: "LA",
    text: "A ficha digital com fotos antes/depois e consentimento LGPD me deu uma credibilidade enorme com as clientes.",
    rating: 5,
    metric: "100% compliance LGPD",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-6 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-sm font-medium text-primary mb-2">DEPOIMENTOS</p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
          Salões que já transformaram sua gestão
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Mais de 200 salões no Brasil usam o BeautyFlow para crescer com organização.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="relative rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <Quote className="absolute top-4 right-4 h-6 w-6 text-primary/10" />

            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            <p className="text-sm text-foreground/90 mb-6 leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Metric badge */}
            <div className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-4">
              {t.metric}
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/40">
              <Avatar className="h-10 w-10 bg-primary">
                <AvatarFallback className="text-white text-xs font-semibold">
                  {t.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.role} &middot; {t.salon}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
