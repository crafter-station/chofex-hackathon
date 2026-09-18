import { expect, test } from "bun:test";

test("shows one funnel status instead of separate application and challenge columns", async () => {
  const source = await Bun.file(
    new URL("./candidate-dashboard.tsx", import.meta.url),
  ).text();

  expect(source).toContain("candidate.funnelStatus");
  expect(source).toContain("<span>Status</span>");
  expect(source).not.toContain("<span>Challenge</span>");
  expect(source).toContain('label="Registration started"');
  expect(source).toContain('label="Registration completed"');
  expect(source).toContain('label="Challenge started"');
  expect(source).toContain('label="Challenge completed"');
  expect(source).toContain('label="Approved"');
  expect(source).toContain('label="Declined"');
  expect(source).toContain('label="Application state"');
});
