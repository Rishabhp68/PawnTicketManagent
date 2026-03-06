"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function daysRemaining(date: string) {
  const diff = new Date(date).getTime() - new Date().getTime();

  return Math.max(0, Math.floor(diff / 86400000));
}

function getColor(days: number) {
  if (days <= 10) return "#ef4444"; // red
  if (days <= 30) return "#f59e0b"; // amber
  return "#10b981"; // green
}

function formatTicket(id: string) {
  return id.length > 8 ? id.slice(0, 8) + "…" : id;
}

export function MaturityTimeline({ tickets }: any) {
  const data = tickets
    .map((t: any) => {
      const start = new Date(t.tokenMetadata.loanStartDate);
      const months = t.tokenMetadata.totalTermsInMonths;

      const maturity = new Date(start);
      maturity.setMonth(start.getMonth() + months);

      return {
        ticket: t.tokenMetadata.pawnTicketId,
        days: daysRemaining(maturity.toISOString()),
      };
    })
    .sort((a: any, b: any) => a.days - b.days); // most urgent first

  return (
    <Card>
      <CardHeader>
        <CardTitle>Days Until Maturity</CardTitle>
      </CardHeader>

      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            barCategoryGap={18}
            margin={{ left: 0, right: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              opacity={0.15}
            />

            <XAxis type="number" />

            <YAxis
              type="category"
              dataKey="ticket"
              width={70}
              fontSize={12}
              tickFormatter={formatTicket}
            />

            <Tooltip formatter={(v: number) => `${v} days`} />

            <Bar
              dataKey="days"
              radius={[0, 6, 6, 0]}
              barSize={18}
              /* load animation */
               isAnimationActive={true}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
              /* hover effect */
              activeBar={{
                stroke: "#31572C",
                strokeWidth: 1,
              }}
            >
              {data.map((entry: any, index: any) => (
                <Cell key={index} fill={getColor(entry.days)} />
              ))}

              {/* <LabelList
                dataKey="days"
                position="right"
                formatter={(v: number) => `${v} days`}
                fontSize={11}
                fill="#374151"
              /> */}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
