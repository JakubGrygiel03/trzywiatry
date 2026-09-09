/** MailerLite subscriber helper — no-ops until MAILERLITE_API_KEY is set. */
export async function addSubscriber(email: string, source: string) {
  const key = process.env.MAILERLITE_API_KEY;
  if (!key) {
    return { ok: true, demo: true as const, email, source };
  }

  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      groups: [],
      fields: { source },
    }),
  });

  return { ok: response.ok, demo: false as const };
}
