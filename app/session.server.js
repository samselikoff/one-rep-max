import { createCookieSessionStorage, redirect } from "remix";
import invariant from "tiny-invariant";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

let USER_SESSION_KEY = "userId";

export async function getSession(request) {
  let cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request) {
  let session = await getSession(request);
  let userId = session.get(USER_SESSION_KEY);
  return userId;
}

export async function getUser(request) {
  let userId = await getUserId(request);
  if (userId === undefined) return null;

  let user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(
  request,
  redirectTo = new URL(request.url).pathname
) {
  let userId = await getUserId(request);
  if (!userId) {
    let searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request) {
  let userId = await requireUserId(request);

  let user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function createUserSession({ request, userId, redirectTo }) {
  let session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      }),
    },
  });
}

export async function logout(request) {
  let session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
