import * as React from "react";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link as RemixLink,
  useActionData,
  useSearchParams,
} from "@remix-run/react";

import { createUserSession, getUserId } from "~/session.server";
import { verifyLogin } from "~/models/user.server";
import { validateEmail } from "~/utils";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

export let loader: LoaderFunction = async ({ request }) => {
  let userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
  };
}

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData();
  let email = formData.get("email");
  let password = formData.get("password");
  let redirectTo = formData.get("redirectTo");

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string") {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  let user = await verifyLogin(email, password);

  if (!user) {
    return json<ActionData>(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

export let meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

export default function LoginPage() {
  let [searchParams] = useSearchParams();
  let redirectTo = searchParams.get("redirectTo") || "/";
  let actionData = useActionData() as ActionData;
  let emailRef = React.useRef<HTMLInputElement>(null);
  let passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="mt-12 px-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <Form className="mt-6" method="post">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>

        <div className="mt-2">
          <input
            className="w-full rounded border border-gray-300 py-1.5 px-2.5"
            ref={emailRef}
            id="email"
            required
            autoFocus={true}
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={actionData?.errors?.email ? true : undefined}
            aria-describedby="email-error"
          />

          {actionData?.errors?.email && (
            <div
              className="mt-2 flex items-center gap-2 rounded bg-red-50 px-3.5 py-2.5 text-sm text-red-500"
              id="email-error"
            >
              <ExclamationTriangleIcon />
              <p>{actionData.errors.email}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>

          <div className="mt-2">
            <input
              id="password"
              ref={passwordRef}
              className="w-full rounded border border-gray-300 py-1.5 px-2.5"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
            />

            {actionData?.errors?.password && (
              <div
                className="mt-2 flex items-center gap-2 rounded bg-red-50 px-3.5 py-2.5 text-sm text-red-500"
                id="password-error"
              >
                <ExclamationTriangleIcon />
                <p>{actionData.errors.password}</p>
              </div>
            )}
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="mt-5">
          <button
            className="w-full rounded bg-blue-500 py-1.5 font-medium text-white"
            type="submit"
          >
            Log in
          </button>
        </div>

        <div className="mt-16 text-sm text-gray-500">
          Don't have an account?{" "}
          <RemixLink
            className="font-medium text-blue-500 underline decoration-blue-200 underline-offset-2"
            to={{
              pathname: "/join",
              search: searchParams.toString(),
            }}
          >
            Sign up
          </RemixLink>
        </div>
      </Form>
    </div>
  );
}
