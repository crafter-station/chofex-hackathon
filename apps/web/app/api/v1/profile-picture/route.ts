import { jsonSuccess, withApiHandler } from "@/lib/registration/http";
import { pictureUploadDependencies } from "@/lib/registration/picture-upload-adapters";
import { handlePictureUpload } from "@/lib/registration/picture-upload";

export const runtime = "nodejs";

const respond = (request: Request): Promise<Response> =>
  withApiHandler(request, async (requestId) =>
    jsonSuccess(
      requestId,
      await handlePictureUpload(request, pictureUploadDependencies),
    ),
  );

export const POST = respond;
export const PUT = respond;
