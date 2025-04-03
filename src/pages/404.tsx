export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6">Sorry, the page you are looking for does not exist.</p>
      <a href="/" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">
        Return Home
      </a>
    </div>
  );
}
