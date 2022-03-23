import {
  Form,
  json,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import type { LinksFunction, MetaFunction, LoaderFunction } from "remix";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { useOptionalUser } from "./utils";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    user: await getUser(request),
  });
};

export default function App() {
  const user = useOptionalUser();

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <header className="flex h-[72px] items-center justify-between bg-gray-800 px-4 text-white">
          <h1 className="text-3xl font-bold">
            <Link to=".">One Rep Max</Link>
          </h1>

          {user && (
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-blue-100 bg-gray-600 hover:bg-gray-500 active:bg-gray-600"
              >
                Logout
              </button>
            </Form>
          )}
        </header>

        <main>
          <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
