export default function Custom500() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">500 - Server Error</h1>
      <p className="mb-6">Sorry, something went wrong on our server.</p>
      <a href="/" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
        Return Home
      </a>
    </div>
  );
}
