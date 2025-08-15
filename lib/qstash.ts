import { Client } from "@upstash/qstash";

export const client = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// Example publish usage
export async function publishExample() {
  await client.publish({
    url: "https://example.com",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
