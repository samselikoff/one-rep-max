// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { prisma } from "~/db.server";

export async function loader({ request }) {
  let host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host");

  try {
    // if we can connect to the database and make a simple query
    // and make a HEAD request to ourselves, then we're good.
    await Promise.all([
      prisma.user.count(),
      fetch(`http://${host}`, { method: "HEAD" }).then((r) => {
        if (!r.ok) return Promise.reject(r);
      }),
    ]);
    return new Response("OK");
  } catch (error) {
    console.log("healthcheck ❌", { error });
    return new Response("ERROR", { status: 500 });
  }
}
