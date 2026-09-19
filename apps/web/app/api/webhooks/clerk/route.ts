import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

import { enqueueFunnelReminder } from "@/lib/funnel-reminders/enqueue";

export const runtime = "nodejs";

export const POST = async (request: NextRequest): Promise<Response> => {
  let event: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  if (event.type !== "session.created") {
    return Response.json({ received: true });
  }

  const user = event.data.user;
  if (!user) {
    const clerk = await clerkClient();
    const resource = await clerk.users.getUser(event.data.user_id);
    const primaryEmail = resource.emailAddresses.find(
      (email) => email.id === resource.primaryEmailAddressId,
    );
    if (!primaryEmail) {
      return Response.json({ received: true, scheduled: false });
    }
    await enqueueFunnelReminder({
      clerkUserId: resource.id,
      stage: "registration",
      recipient: {
        email: primaryEmail.emailAddress.trim().toLowerCase(),
        firstName: resource.firstName ?? "",
      },
    });
    return Response.json({ received: true });
  }

  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user?.primary_email_address_id,
  );
  if (!primaryEmail) {
    return Response.json({ received: true, scheduled: false });
  }
  await enqueueFunnelReminder({
    clerkUserId: user.id,
    stage: "registration",
    recipient: {
      email: primaryEmail.email_address.trim().toLowerCase(),
      firstName: user.first_name ?? "",
    },
  });
  return Response.json({ received: true });
};
