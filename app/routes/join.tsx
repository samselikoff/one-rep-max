import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import * as React from "react";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { createUserSession, getUserId } from "~/session.server";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { createUser, getUserByEmail } from "~/models/user.server";
import { validateEmail } from "~/utils";

export let loader: LoaderFunction = async ({ request }) => {
  let userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

interface ActionData {
  errors: {
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

  let existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  let user = await createUser(email, password);

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

export let meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  let [searchParams] = useSearchParams();
  let redirectTo = searchParams.get("redirectTo") ?? undefined;
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
      <h1 className="text-2xl font-bold">Sign up</h1>

      <Form method="post" className="mt-6">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>

        <div className="mt-2">
          <input
            ref={emailRef}
            className="w-full rounded border border-gray-300 py-1.5 px-2.5"
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
              {actionData.errors.email}
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
              autoComplete="new-password"
            />

            {actionData?.errors?.password && (
              <div
                className="mt-2 flex items-center gap-2 rounded bg-red-50 px-3.5 py-2.5 text-sm text-red-500"
                id="password-error"
              >
                <ExclamationTriangleIcon />
                {actionData.errors.password}
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
            Create Account
          </button>
        </div>

        <div className="mt-16 text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            className="font-medium text-blue-500 underline decoration-blue-200 underline-offset-2"
            to={{
              pathname: "/login",
              search: searchParams.toString(),
            }}
          >
            Log in
          </Link>
        </div>
      </Form>
    </div>
  );
}
