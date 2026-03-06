"use client";

import { motion, Variants } from "framer-motion";

import { TicketStatusChart } from "./ticket-status-chart"
import { BalancePerTicketChart } from "./balance-per-ticket-chart";
import { MaturityTimeline } from "./maturity-timeline";
import { PawnTicketToken } from "@/lib/pawn/types";

export function PawnorDashboardGraphs({ tickets }: {tickets: PawnTicketToken[]}) {

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.35,
      },
    },
  };

  const item: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // modern UI easing
    },
  },
};
 
  tickets = tickets.filter(ticket => ticket.status !== "Redeemed" && ticket.status !== "Closed");

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 w-full lg:grid-cols-3 items-start"
    >

      {/* Balance */}

      <motion.div variants={item}>
        <BalancePerTicketChart tickets={tickets} />
      </motion.div>

      {/* Maturity */}

      <motion.div variants={item}>
        <MaturityTimeline tickets={tickets} />
      </motion.div>

       {/* Donut */}

      <motion.div variants={item}>
        <TicketStatusChart tickets={tickets} />
      </motion.div>

    </motion.div>
  );
}