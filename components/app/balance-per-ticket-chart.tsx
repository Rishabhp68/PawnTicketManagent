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
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

function money(v: number) {
  return `₱${v.toLocaleString()}`;
}

/* Wrap long ticket ids */

function formatTicket(ticket: string) {
  if (!ticket) return "";
  return ticket.length > 10 ? ticket.slice(0, 8) + "..." : ticket;
}

export function BalancePerTicketChart({ tickets }: any) {
  const data = tickets.map((t: any) => ({
    ticket: t.tokenMetadata?.pawnTicketId,
    balance:
      t.tokenMetadata?.principalAmount +
      (t.tokenMetadata?.principalAmount *
        t.tokenMetadata?.interestRate *
        t.tokenMetadata?.totalTermsInMonths) /
        1200,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Outstanding Balance</CardTitle>
      </CardHeader>

      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} barCategoryGap={30}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.15}
            />

            <XAxis
              dataKey="ticket"
              tickFormatter={formatTicket}
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
            />

            <YAxis tickFormatter={(v) => `₱${v}`} tick={{ fontSize: 12 }} />

            <Tooltip formatter={(v: number) => money(v)} />

            <Bar
              dataKey="balance"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
              barSize={24} // 👈 max bar width
              /* load animation */
               isAnimationActive={true}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
              /* hover effect */
              activeBar={{
                stroke: "#4338ca",
                strokeWidth: 1,
              }}
            >
              <LabelList
                dataKey="balance"
                position="top"
                formatter={(v: number) => (v > 50 ? `₱${v.toFixed(0)}` : "")}
                fill="#374151"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
