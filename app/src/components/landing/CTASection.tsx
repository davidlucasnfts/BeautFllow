import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router";

const benefits = [
  "Teste grátis por 14 dias",
  "Sem cartão de crédito",
  "Setup em menos de 5 minutos",
  "Suporte humano no WhatsApp",
];

export function CTASection() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="rounded-2xl bg-primary px-8 py-14 md:px-16 md:py-16 text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
            Pronto para organizar seu salão?
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
            Junte-se a mais de 200 salões que já economizam tempo, reduzem faltas e faturam mais com o BeautyFlow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/login">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 font-semibold"
              >
                Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                <CheckCircle className="h-3.5 w-3.5" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
