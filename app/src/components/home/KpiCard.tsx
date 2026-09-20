import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const width = 80;
  const height = 28;
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon
          className={`h-4 w-4 ${iconClassName ?? "text-muted-foreground"}`}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-x-2">
            <div className="min-w-0">
              <div className="text-2xl font-bold whitespace-nowrap">
                {value}
              </div>
              {trend && trendValue && (
                <div
                  className={`flex items-center gap-1 text-xs mt-1 whitespace-nowrap ${
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
