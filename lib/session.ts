import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionUser = {
  username: string;
  password: string;
  orgId: string;
  userId: string;
  // derived at login
  userAccountId?: string;
  ftAccountId?: string;
  nftAccountId?: string;
  isMinter?: boolean;
};

export type AppSession = {
  user?: SessionUser;
};

const sessionOptions: SessionOptions = {
  cookieName: "ptm_session",
  password: process.env.SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AppSession>(cookieStore, sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return session.user;
}