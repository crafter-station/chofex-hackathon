import { brandColors, brandColorWithAlpha } from "@chofex/ui/lib/brand-theme";

export type ApplicationDecision = "accepted" | "rejected";

export interface DecisionEmailInput {
  readonly decision: ApplicationDecision;
  readonly firstName: string;
  readonly message?: string;
}

export interface DecisionEmail {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

const emailColors = {
  page: brandColors.light.paper,
  surface: brandColors.light.surface,
  border: brandColorWithAlpha(brandColors.light.ink, 0.18),
  text: brandColors.light.ink,
  muted: brandColors.light.muted,
  action: brandColors.light.action,
  status: brandColors.light.status,
  well: brandColorWithAlpha(brandColors.light.ink, 0.06),
  command: brandColors.dark.paper,
  commandText: brandColors.dark.ink,
  commandPrompt: brandColors.dark.action,
} as const;

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const decisionCopy = (decision: ApplicationDecision) => {
  if (decision === "accepted") {
    return {
      subject: "You’re in — welcome to Hack the Andes",
      preheader:
        "Your application was approved. Complete your attendance details to secure your place.",
      eyebrow: "APPLICATION APPROVED",
      heading: "You’re invited.",
      introduction:
        "We’re excited to offer you a place at Hack the Andes in Lima.",
      nextStep:
        "Complete your attendance details to secure your place. You can ask your coding agent to continue, or run:",
      command: "chofex confirm",
      closing: "We can’t wait to see what you build.",
    };
  }

  return {
    subject: "An update on your Hack the Andes application",
    preheader: "Thank you for applying to Hack the Andes.",
    eyebrow: "APPLICATION UPDATE",
    heading: "Thank you for applying.",
    introduction:
      "After careful review, we’re unable to offer you a place at Hack the Andes this time.",
    nextStep:
      "We appreciate the thought and effort you put into your application. You’re welcome to apply again with a new application.",
    command: "chofex register",
    closing: "We hope to see what you build next.",
  };
};

const textMessage = (message: string | undefined): ReadonlyArray<string> => {
  if (!message) return [];
  return ["", "A note from our review team:", message];
};

const htmlMessage = (message: string | undefined): string => {
  if (!message) return "";

  return `<tr><td style="padding:0 40px 28px"><div style="border-left:3px solid ${emailColors.status};padding:2px 0 2px 18px"><p style="margin:0 0 6px;color:${emailColors.muted};font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">A note from our review team</p><p style="margin:0;color:${emailColors.text};font-family:Arial,sans-serif;font-size:16px;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</p></div></td></tr>`;
};

export const buildDecisionEmail = ({
  decision,
  firstName,
  message,
}: DecisionEmailInput): DecisionEmail => {
  const copy = decisionCopy(decision);
  const safeFirstName = escapeHtml(firstName);
  const text = [
    `Hi ${firstName},`,
    "",
    copy.introduction,
    "",
    copy.nextStep,
    copy.command,
    ...textMessage(message),
    "",
    copy.closing,
    "",
    "— The Hack the Andes team",
  ].join("\n");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${copy.subject}</title></head><body style="margin:0;background:${emailColors.page};padding:0"><div style="display:none;max-height:0;overflow:hidden;opacity:0">${copy.preheader}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${emailColors.page}"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:${emailColors.surface};border:1px solid ${emailColors.border};overflow:hidden"><tr><td style="background:${emailColors.text};padding:24px 40px;color:${emailColors.page};font-family:Arial,sans-serif;font-size:18px;font-weight:700">▲&nbsp;&nbsp;Hack the Andes</td></tr><tr><td style="padding:40px 40px 20px"><p style="margin:0 0 16px;color:${emailColors.action};font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:.14em">${copy.eyebrow}</p><h1 style="margin:0 0 20px;color:${emailColors.text};font-family:Arial,sans-serif;font-size:36px;line-height:1.1;letter-spacing:-.03em;text-transform:uppercase">${copy.heading}</h1><p style="margin:0 0 16px;color:${emailColors.text};font-family:Arial,sans-serif;font-size:17px;line-height:1.6">Hi ${safeFirstName},</p><p style="margin:0;color:${emailColors.text};font-family:Arial,sans-serif;font-size:17px;line-height:1.6">${copy.introduction}</p></td></tr><tr><td style="padding:0 40px 28px"><div style="background:${emailColors.well};padding:20px"><p style="margin:0 0 14px;color:${emailColors.muted};font-family:Arial,sans-serif;font-size:15px;line-height:1.6">${copy.nextStep}</p><p style="margin:0;background:${emailColors.command};color:${emailColors.commandText};font-family:monospace;font-size:15px;padding:14px 16px"><span style="color:${emailColors.commandPrompt}">$</span>&nbsp; ${copy.command}</p></div></td></tr>${htmlMessage(message)}<tr><td style="padding:0 40px 40px"><p style="margin:0 0 24px;color:${emailColors.text};font-family:Arial,sans-serif;font-size:16px;line-height:1.6">${copy.closing}</p><p style="margin:0;color:${emailColors.muted};font-family:Arial,sans-serif;font-size:14px;line-height:1.6">— The Hack the Andes team</p></td></tr></table></td></tr></table></body></html>`;

  return { subject: copy.subject, text, html };
};
