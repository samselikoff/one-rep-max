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

import tailwindStylesheetUrl from "./styles/tailwind.css";
import { getUser } from "./session.server";
import { useOptionalUser } from "./utils";

export function links() {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "manifest", href: "/site.webmanifest" },
  ];
}

export function meta() {
  return {
    charset: "utf-8",
    title: "One Rep Max",
    viewport:
      "width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  };
}

export async function loader({ request }) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  let user = useOptionalUser();

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <header className="bg-gray-800 px-4 pt-safe-top text-white">
          <div className="flex h-[72px] items-center justify-between">
            <h1 className="text-3xl font-bold">
              <Link to=".">One Rep Max</Link>
            </h1>
            {user && (
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="bg-gray-600 px-4 py-2 text-blue-100 hover:bg-gray-500 active:bg-gray-600"
                >
                  Logout
                </button>
              </Form>
            )}
          </div>
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
