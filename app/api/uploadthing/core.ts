import { getSession } from "@/lib/session";
import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { getServerSession } from "next-auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      // optional auth
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");

      return { userId: session.user?.username || "Authorized User" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
  
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
