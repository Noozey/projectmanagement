import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useId } from "react";

import { Label } from "@/components/ui/label";
import {
  Pagination as Pagination_Shad,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { usePageContext } from ".";

const PAGE_SIZES = [10, 15, 20, 25];

export function PagePagination() {
  const id = useId();
  const navigate = useNavigate();

  const { page = 1, pageSize = 10 } = useSearch({ strict: false });
  const { totalItems } = usePageContext();

  function onPageSizeChange(size: string) {
    navigate({
      // Reset to first page on page size change
      // @ts-expect-error We know we'll have page and pageSize params
      search: { page: 1, pageSize: Number(size) },
      replace: true,
    });
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const fromItems = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const toItems = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex w-full items-center justify-between gap-8">
      {/* Results per page */}
      <div className="flex items-center gap-3">
        <Label htmlFor={id}>Items per page</Label>
        <Select
          defaultValue="10"
          value={String(pageSize)}
          onValueChange={onPageSizeChange}
        >
          <SelectTrigger id={id} className="w-fit whitespace-nowrap">
            <SelectValue placeholder="Select number of results" />
          </SelectTrigger>
          <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
            {PAGE_SIZES.map((size) => (
              <SelectItem value={String(size)}>{size}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page number information */}
      <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
        <p
          className="text-muted-foreground text-sm whitespace-nowrap"
          aria-live="polite"
        >
          Showing{" "}
          <span className="text-foreground">
            {fromItems} - {toItems}
          </span>{" "}
          of <span className="text-foreground">{totalItems}</span>
        </p>
      </div>

      {/* Pagination */}
      <div>
        <Pagination_Shad>
          <PaginationContent>
            {/* First page button */}
            <PaginationItem>
              <PaginationLink
                // @ts-expect-error We know we'll have page and pageSize params
                search={{ page: 1, pageSize }}
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                aria-label="Go to first page"
                aria-disabled={page === 1 ? true : undefined}
                role={page === 1 ? "link" : undefined}
              >
                <ChevronFirstIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>

            {/* Previous page button */}
            <PaginationItem>
              <PaginationLink
                // @ts-expect-error We know we'll have page and pageSize params
                search={{ page: Math.max(page - 1, 1), pageSize }}
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                aria-label="Go to previous page"
                aria-disabled={page === 1 ? true : undefined}
                role={page === 1 ? "link" : undefined}
              >
                <ChevronLeftIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>

            {/* Next page button */}
            <PaginationItem>
              <PaginationLink
                // @ts-expect-error We know we'll have page and pageSize params
                search={{ page: Math.min(totalPages, page + 1), pageSize }}
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                aria-label="Go to next page"
                aria-disabled={page === totalPages ? true : undefined}
                role={page === totalPages ? "link" : undefined}
              >
                <ChevronRightIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>

            {/* Last page button */}
            <PaginationItem>
              <PaginationLink
                // @ts-expect-error We know we'll have page and pageSize params
                search={{ page: totalPages, pageSize }}
                className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                aria-label="Go to last page"
                aria-disabled={page === totalPages ? true : undefined}
                role={page === totalPages ? "link" : undefined}
              >
                <ChevronLastIcon size={16} aria-hidden="true" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination_Shad>
      </div>
    </div>
  );
}
