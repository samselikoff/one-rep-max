import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { logout } from "~/session.server";
import { redirect } from "@remix-run/node";

export let action: ActionFunction = async ({ request }) => {
  return logout(request);
};

export let loader: LoaderFunction = async () => {
  return redirect("/");
};
