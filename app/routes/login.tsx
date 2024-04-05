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
import {
  Box,
  Button,
  Callout,
  Flex,
  Heading,
  Link,
  Text,
  TextField,
} from "@radix-ui/themes";
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
    <div className="mt-36 flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Heading mb="4">Sign in</Heading>

        <Form method="post">
          <label htmlFor="email">
            <Text size="2" weight="medium" mb="2">
              Email address
            </Text>
          </label>

          <Box mt="2">
            <TextField.Root
              ref={emailRef}
              id="email"
              required
              size="3"
              autoFocus={true}
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
            />

            {actionData?.errors?.email && (
              <Callout.Root size="1" color="red" mt="2" id="email-error">
                <Callout.Icon>
                  <ExclamationTriangleIcon />
                </Callout.Icon>
                <Callout.Text>{actionData.errors.email}</Callout.Text>
              </Callout.Root>
            )}
          </Box>

          <Box mt="2">
            <label htmlFor="password">
              <Text size="2" weight="medium" mb="2">
                Password
              </Text>
            </label>

            <Box mt="2">
              <TextField.Root
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                size="3"
                autoComplete="current-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />

              {actionData?.errors?.password && (
                <Callout.Root size="1" color="red" mt="2" id="password-error">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>{actionData.errors.password}</Callout.Text>
                </Callout.Root>
              )}
            </Box>
          </Box>

          <input type="hidden" name="redirectTo" value={redirectTo} />

          <Flex align="stretch" direction="column" mt="5">
            <Button size="3" type="submit">
              Log in
            </Button>
          </Flex>

          <Box mt="4">
            <Text size="2">
              <Text color="gray">Don't have an account? </Text>
              <Link asChild underline="always">
                <RemixLink
                  to={{
                    pathname: "/join",
                    search: searchParams.toString(),
                  }}
                >
                  Sign up
                </RemixLink>
              </Link>
            </Text>
          </Box>
        </Form>
      </div>
    </div>
  );
}
