import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search as SearchIcon, Play } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    date?: string;
    duration?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const dateFilter = params.date || null;
  const durationFilter = params.duration || null;
  const sortBy = params.sort || "relevance";

  const supabase = await createClient();

  let results: any[] = [];

  if (query) {
    const { data } = await supabase.rpc("search_videos", {
      search_query: query,
      upload_date_filter: dateFilter,
      duration_filter: durationFilter,
      sort_by: sortBy,
      limit_count: 20,
      offset_count: 0,
    });

    results = data || [];
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <form method="GET" className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search videos..."
              className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <button
            type="submit"
            className="h-12 rounded-lg bg-primary px-8 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Search
          </button>
        </form>

        {query && (
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Upload date:</label>
              <select
                name="date"
                value={dateFilter || ""}
                onChange={(e) => {
                  const form = e.currentTarget.form;
                  if (form) form.submit();
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any time</option>
                <option value="hour">Last hour</option>
                <option value="day">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Duration:</label>
              <select
                name="duration"
                value={durationFilter || ""}
                onChange={(e) => {
                  const form = e.currentTarget.form;
                  if (form) form.submit();
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Any duration</option>
                <option value="short">Under 4 minutes</option>
                <option value="medium">4 - 20 minutes</option>
                <option value="long">Over 20 minutes</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                name="sort"
                value={sortBy}
                onChange={(e) => {
                  const form = e.currentTarget.form;
                  if (form) form.submit();
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Upload date</option>
                <option value="views">View count</option>
              </select>
            </div>

            <input type="hidden" name="q" value={query} />
          </div>
        )}
      </div>

      {query ? (
        results.length > 0 ? (
          <div>
            <p className="mb-6 text-sm text-muted-foreground">
              Found {results.length} results for &quot;{query}&quot;
            </p>
            <div className="space-y-4">
              {results.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}`}
                  className="group flex gap-4 rounded-lg transition-colors hover:bg-secondary/50 p-2"
                >
                  <div className="relative aspect-video w-80 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    {video.poster_url ? (
                      <img
                        src={video.poster_url}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Play className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
                      {Math.floor(video.duration_seconds / 60)}:
                      {(video.duration_seconds % 60)
                        .toString()
                        .padStart(2, "0")}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{video.view_count.toLocaleString()} views</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(new Date(video.published_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {video.channel_name}
                    </p>
                    {video.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {video.description}
                      </p>
                    )}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {video.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-2 py-0.5 text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <SearchIcon className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No results found</p>
            <p className="text-sm text-muted-foreground">
              Try different keywords or filters
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <SearchIcon className="h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Search for videos</p>
          <p className="text-sm text-muted-foreground">
            Enter keywords to find videos
          </p>
        </div>
      )}
    </div>
  );
}
