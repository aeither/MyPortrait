export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-zinc-900 to-black">
      <div className="w-full max-w-md flex flex-col gap-6 items-center text-center">
        <h1 className="text-4xl font-bold text-amber-500">My Portrait</h1>
        <p className="text-zinc-400">
          Generate AI portraits using Studio Ghibli-inspired style
        </p>
        <div className="mt-8 flex flex-col gap-4 w-full">
          <a
            href="/portrait"
            className="w-full px-6 py-3 bg-amber-500 text-zinc-900 font-medium rounded-md hover:bg-amber-400 transition-colors text-center"
          >
            Generate Your Portrait
          </a>
        </div>
      </div>
    </div>
  );
}
