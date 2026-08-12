import Link from "next/link";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
};

function pageHref(
  basePath: string,
  page: number,
  query: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }

  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function Pagination({
  basePath,
  page,
  totalPages,
  query = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, Math.max(page + 2, 5));
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors";

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Phân trang">
      <p className="text-sm text-gray-500">
        Trang {page} / {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        {page > 1 ? (
          <Link
            href={pageHref(basePath, page - 1, query)}
            className={`${linkClass} border-gray-300 bg-white hover:bg-gray-50`}
          >
            Trước
          </Link>
        ) : (
          <span className={`${linkClass} cursor-not-allowed border-gray-200 text-gray-300`}>
            Trước
          </span>
        )}

        {pages.map((item) => (
          <Link
            key={item}
            href={pageHref(basePath, item, query)}
            aria-current={item === page ? "page" : undefined}
            className={`${linkClass} ${
              item === page
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {item}
          </Link>
        ))}

        {page < totalPages ? (
          <Link
            href={pageHref(basePath, page + 1, query)}
            className={`${linkClass} border-gray-300 bg-white hover:bg-gray-50`}
          >
            Sau
          </Link>
        ) : (
          <span className={`${linkClass} cursor-not-allowed border-gray-200 text-gray-300`}>
            Sau
          </span>
        )}
      </div>
    </nav>
  );
}
