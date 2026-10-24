import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { loggedIn } from "@/lib/guard";
import { hasUploadToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Large videos go straight from the browser / the daily task to Vercel Blob (no 4.5 MB body limit).
// Dashboard users are allowed by cookie; the daily task passes UPLOAD_TOKEN as clientPayload.
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const out = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await loggedIn()) && !hasUploadToken(clientPayload)) throw new Error("unauthorized");
        return { allowedContentTypes: ["video/mp4", "video/quicktime"], maximumSizeInBytes: 300 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(out);
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
