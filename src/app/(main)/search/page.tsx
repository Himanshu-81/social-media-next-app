import TrendsSidebar from "@/components/TrendsSidebar";
import SearchResults from "./SearchResults";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  return {
    title: q ? `Search result for "${q}"` : "Search",
  };
}

// ✅ main page
export default async function Page({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h1 className="text-center text-2xl font-bold line-clamp-2 break-all">
            {q ? `Search result for "${q}"` : "Search"}
          </h1>
        </div>
        {q && <SearchResults query={q} />}
      </div>
      <TrendsSidebar />
    </main>
  );
}
