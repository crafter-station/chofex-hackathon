import { badgeEmailFrom, badgeEmailReplyTo } from "./config";
import { escapeXml } from "./image";

export interface BadgeReadyEmailInput {
  readonly applicationId: string;
  readonly email: string;
  readonly firstName: string;
  readonly badgeUrl: string;
}

export const sendBadgeReadyEmail = async (
  input: BadgeReadyEmailInput,
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const safeFirstName = escapeXml(input.firstName);
  const safeBadgeUrl = escapeXml(input.badgeUrl);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
      "idempotency-key": `participant-badge/${input.applicationId}`,
    },
    body: JSON.stringify({
      from: badgeEmailFrom,
      to: [input.email],
      reply_to: badgeEmailReplyTo,
      subject: "Your Hack the Andes badge is ready",
      text: `Hi ${input.firstName},\n\nYour Hack the Andes badge is ready: ${input.badgeUrl}\n`,
      html: `<p>Hi ${safeFirstName},</p><p>Your Hack the Andes badge is ready.</p><p><a href="${safeBadgeUrl}">View your badge</a></p>`,
    }),
  });
  if (response.ok) return;
  const body = (await response.json().catch(() => undefined)) as
    | { readonly message?: string }
    | undefined;
  throw new Error(body?.message ?? `Resend returned HTTP ${response.status}`);
};
