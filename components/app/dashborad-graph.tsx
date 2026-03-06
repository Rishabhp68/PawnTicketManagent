"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

type ChartData = {
  ticket: string;
  principal: number;
  interest: number;
  renew: number;
};

function money(v: number) {
  return `₱${v.toLocaleString()}`;
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload) return null;

  const p = payload[0]?.value ?? 0;
  const i = payload[1]?.value ?? 0;
  const r = payload[2]?.value ?? 0;

  const total = p + i + r;

  return (
    <div className="rounded-md border bg-background p-3 shadow text-sm">
      <div className="font-medium mb-1">{label}</div>
      <div>Principal: {money(p)}</div>
      <div>Interest: {money(i)}</div>
      {r > 0 && <div>Renew: {money(r)}</div>}
      <div className="mt-1 font-semibold">Total: {money(total)}</div>
    </div>
  );
}

export default function DashboardGraph({ data }: { data: ChartData[] }) {
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const ta = a.principal + a.interest + a.renew;
      const tb = b.principal + b.interest + b.renew;
      return tb - ta;
    });
  }, [data]);

  return (
    <Card>

      <CardHeader>
        <CardTitle>Loan Breakdown</CardTitle>
        <CardDescription>
          Principal, interest and renew values across tickets
        </CardDescription>
      </CardHeader>

      <CardContent className="h-[340px]">

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            barGap={6}
            barCategoryGap={40}
          >

            <defs>

              <linearGradient id="principal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#818cf8"/>
              </linearGradient>

              <linearGradient id="interest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b"/>
                <stop offset="100%" stopColor="#fbbf24"/>
              </linearGradient>

              <linearGradient id="renew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#34d399"/>
              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.15}
            />

            <XAxis
              dataKey="ticket"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              tickFormatter={(v) => `₱${v}`}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<TooltipBox />} />

            {/* PRINCIPAL */}

            <Bar
              dataKey="principal"
              stackId="loan"
              fill="url(#principal)"
              barSize={18}
              radius={[6,6,0,0]}
            >
              <LabelList
                dataKey="principal"
                position="insideTop"
                fontSize={11}
                fill="white"
              />
            </Bar>

            {/* INTEREST */}

            <Bar
              dataKey="interest"
              stackId="loan"
              fill="url(#interest)"
              barSize={18}
            >
              <LabelList
                dataKey="interest"
                position="insideTop"
                fontSize={11}
                fill="white"
              />
            </Bar>

            {/* RENEW */}

            <Bar
              dataKey="renew"
              stackId="loan"
              fill="url(#renew)"
              barSize={18}
            >
              <LabelList
                dataKey="renew"
                position="insideTop"
                fontSize={11}
                fill="white"
              />
            </Bar>

          </BarChart>
        </ResponsiveContainer>

      </CardContent>

    </Card>
  );
}