"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-zinc-900 to-black">
      <div className="w-full max-w-md flex flex-col gap-6 items-center text-center">
        <h1 className="text-4xl font-bold text-amber-500">404</h1>
        <h2 className="text-2xl font-medium text-zinc-100">Page Not Found</h2>
        <p className="text-zinc-400">
          The page you were looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-4 px-6 py-2 bg-amber-500 text-zinc-900 font-medium rounded-md hover:bg-amber-400 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
