export const agentApplicationPrompt = (applicationUrl: string) =>
  `Help me apply to the Chofex Hackathon in Lima using the Chofex CLI.

First install the Chofex Hackathon skill:
npx skills add https://github.com/crafter-station/chofex-hackathon --skill chofex-hackathon -g -y

Then use the chofex-hackathon skill to apply on my behalf through ${applicationUrl}. Ask me for every answer, never invent personal information or consent, show me the completed application, and get my explicit approval immediately before submitting it. I will complete browser authentication myself. After applying, check my status and explain my next steps.`;
