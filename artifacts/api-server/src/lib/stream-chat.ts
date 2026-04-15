import { StreamChat } from "stream-chat";
import { logger } from "./logger";

const STREAM_API_KEY = process.env["STREAM_API_KEY"];
const STREAM_API_SECRET = process.env["STREAM_API_SECRET"];

function getClient(): StreamChat {
  if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    throw new Error(
      "STREAM_API_KEY and STREAM_API_SECRET must be set to use the consultation feature.",
    );
  }
  return StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
}

export function isStreamConfigured(): boolean {
  return !!(STREAM_API_KEY && STREAM_API_SECRET);
}

export async function generateUserToken(userId: string, email: string): Promise<string> {
  const client = getClient();
  await client.upsertUser({ id: userId, name: email, role: "user" });
  return client.createToken(userId);
}

export async function createConsultationChannel(
  contractId: string,
  contractName: string,
  userId: string,
): Promise<{ channelId: string; channelType: string }> {
  const client = getClient();
  const channelId = `consult-${contractId}`;

  const channel = client.channel("messaging", channelId, {
    name: `استشارة — ${contractName}`,
    members: [userId],
    created_by: { id: userId },
    contract_id: contractId,
  });

  await channel.create();

  logger.info({ channelId, contractId, userId }, "Stream consultation channel created");

  return { channelId, channelType: "messaging" };
}

export async function forwardToN8nP2(
  message: string,
  contractId: string,
  contractName: string,
  userId: string,
  channelId: string,
): Promise<void> {
  const N8NP2_WEBHOOK_URL = process.env["N8NP2_WEBHOOK_URL"];
  if (!N8NP2_WEBHOOK_URL) {
    logger.warn({ contractId }, "N8NP2_WEBHOOK_URL not set — skipping n8np2 dispatch");
    return;
  }

  await fetch(N8NP2_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      contractId,
      contractName,
      userId,
      channelId,
      channelType: "messaging",
    }),
    signal: AbortSignal.timeout(15000),
  });

  logger.info({ contractId, channelId }, "Message forwarded to n8np2 webhook");
}
