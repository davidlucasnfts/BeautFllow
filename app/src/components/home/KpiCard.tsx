import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function Sparkline({
  data,
  color = "currentColor",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 64;
  const height = 22;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconClassName,
  trend,
  trendValue,
  isLoading,
  sparklineData,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconClassName?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isLoading: boolean;
  sparklineData?: number[];
}) {
  return (
    <Card className="flex h-full flex-col gap-2 py-4 sm:gap-6 sm:py-6">
      <CardContent className="flex flex-1 flex-col p-4 pt-2 sm:p-6 sm:pt-3">
        {/* header manual (sem CardHeader do shadcn) — altura fixa de 2 linhas
            de titulo para os numeros dos 4 cards ficarem na mesma altura */}
        <div className="flex min-h-[28px] items-start justify-between gap-2">
          <p className="text-sm font-medium leading-none text-muted-foreground">
            {title}
          </p>
          <Icon
            className={`h-4 w-4 shrink-0 ${iconClassName ?? "text-muted-foreground"}`}
          />
        </div>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-20" />
        ) : (
          <div className="mt-2 flex flex-wrap items-end justify-between gap-x-2 gap-y-1.5">
            <div className="min-w-0">
              <div className="text-xl font-bold whitespace-nowrap sm:text-2xl">
                {value}
              </div>
              {trend && trendValue && (
                <div
                  className={`mt-4 flex items-center gap-1 text-xs whitespace-nowrap ${
                    trend === "up"
                      ? "text-emerald-600"
                      : trend === "down"
                        ? "text-rose-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : trend === "down" ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : null}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
            {sparklineData && <Sparkline data={sparklineData} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
