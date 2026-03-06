import axios, { AxiosInstance } from "axios";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

/* ============================================================
   CONFIG
============================================================ */

const API_BASE = process.env.MICRO_TX_GATEWAY_ENDPOINT;

if (!API_BASE) {
  console.warn(
    "MICRO_TX_GATEWAY_ENDPOINT is not set. Configure it in .env."
  );
}

/* ============================================================
   HTTP CLIENT
============================================================ */

async function createClient(): Promise<AxiosInstance> {
  const session = await getSession();

  if (!session?.user?.username) {
    throw new Error("Not authenticated");
  }

  return axios.create({
    baseURL: API_BASE,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function apiPost<T>(path: string, body?: any): Promise<T> {
  const client = await createClient();
  const res = await client.post(path, body);
  return res.data;
}

async function apiGet<T>(path: string): Promise<T> {
  const client = await createClient();
  const res = await client.get(path);
  return res.data;
}

/* ============================================================
   POLLING ENGINE
============================================================ */

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type WorkflowStatus = {
  status: "RUNNING" | "COMPLETED" | "FAILED";
};

async function executeWorkflow<TPayload>(
  workflowName: string,
  payload: TPayload,
  options?: {
    priority?: number;
    intervalMs?: number;
    maxAttempts?: number;
  }
): Promise<NextResponse<{ok: boolean, result: WorkflowStatus}>> {
  const {
    priority = 0,
    intervalMs = 2000,
    maxAttempts = 90,
  } = options || {};

  // 1️⃣ Start workflow
  const initResponse = await apiPost<{ id: string }>(
    `/${workflowName}?priority=${priority}`,
    payload
  );

  const workflowId = initResponse;
  console.log("------- workflowId ", workflowId);
  if (!workflowId) {
    throw new Error("Workflow ID not returned from init call");
  }

  // 2️⃣ Poll using /{id}
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(intervalMs);

    const statusResponse = await apiGet<WorkflowStatus>(
      `/${workflowId}`
    );

    if (
      statusResponse.status === "COMPLETED" ||
      statusResponse.status === "FAILED"
    ) {
      if(statusResponse.status === "COMPLETED") {
        return NextResponse.json({ok: true, result: statusResponse}, {status: 200});
      }
      else {
        return NextResponse.json({ok: true, result: statusResponse}, {status: 500});
      }
    }
  }

  throw new Error("Workflow polling timeout exceeded");
}

/* ============================================================
   TRANSACTION SERVICE (DOMAIN LAYER)
============================================================ */

export const microTxTransactionService = {
  loanIssuance: (payload: any) =>
    executeWorkflow("Loan_Issuance", payload),

  loadRenewal: (payload: any) =>
    executeWorkflow("Loan_Renewal", payload),

  loanRedemption: (payload: any) =>
    executeWorkflow("Loan_Redemption", payload),
};