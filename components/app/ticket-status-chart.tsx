"use client";

import { useMemo, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function money(v: number) {
  return `₱${v.toLocaleString()}`;
}

function shortTicket(id: string) {
  if (!id) return "";
  return id.length > 8 ? id.slice(0, 6) + "…" : id;
}

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
];

/* Hovered slice renderer */

function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8} // 👈 expands slice
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  );
}

export function TicketStatusChart({ tickets }: any) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const data = useMemo(() => {
    return tickets.map((t: any) => {
      const principal = t.tokenMetadata?.principalAmount ?? 0;

      const interest =
        (principal *
          t.tokenMetadata?.interestRate *
          t.tokenMetadata?.totalTermsInMonths) /
        1200;

      return {
        name: shortTicket(t.tokenMetadata?.pawnTicketId),
        value: principal + interest,
      };
    });
  }, [tickets]);

  const total = data.reduce((a: any, b: any) => a + b.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Distribution</CardTitle>
      </CardHeader>

      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
               isAnimationActive={true}
              animationDuration={1500}
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((entry: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip formatter={(v: number) => money(v)} />

            {/* <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              formatter={(v) => `Ticket ${v}`}
            /> */}

            {/* Center value */}

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-medium fill-gray-700"
            >
              {money(total)}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
