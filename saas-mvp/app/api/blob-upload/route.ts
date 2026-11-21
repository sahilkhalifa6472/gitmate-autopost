import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { loggedIn } from "@/lib/guard";

export const dynamic = "force-dynamic";

// videos go straight from the browser to Vercel Blob (no 4.5 MB body limit)
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const out = await handleUpload({
      body, request: req,
      onBeforeGenerateToken: async () => {
        if (!(await loggedIn())) throw new Error("unauthorized");
        return { allowedContentTypes: ["video/mp4", "video/quicktime"], maximumSizeInBytes: 300 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(out);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
