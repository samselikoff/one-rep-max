import { Link } from "remix";
import { useOptionalUser } from "~/utils";

export default function Index() {
  let user = useOptionalUser();

  return (
    <div>
      {user ? (
        <div className="flex items-center justify-between px-4 mt-8">
          <h1 className="text-2xl font-semibold">Entries</h1>
          <Link
            className="px-2 py-1 text-sm border-2 rounded"
            to="/entries/new"
          >
            + New entry
          </Link>
        </div>
      ) : (
        <div className="flex justify-center px-8 mt-40 space-x-4">
          <Link
            className="block w-1/2 py-2 font-medium text-center text-white bg-gray-600"
            to="/join"
          >
            Sign up
          </Link>
          <Link
            className="block w-1/2 py-2 font-medium text-center text-white bg-gray-600"
            to="/login"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}
