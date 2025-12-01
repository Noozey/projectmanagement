import { cn } from "@/lib/utils";
import { SlotManager } from "@frsty/slot-fill";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "../ui/button";
import { InputWithIcon } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { PagePagination } from "./page-pagination";
import { AutoResizeDiv } from "../auto-resize-div";
import { AnimatePresence } from "motion/react";
import { Spinner } from "../ui/spinner";
import { createContext, useContext } from "react";

type PageCtxType = {
  isRefreshing: boolean;
  onRefresh: () => void;
  totalItems: number;
};
export const PageContext = createContext<PageCtxType | null>(null);

export function usePageContext() {
  const ctx = useContext(PageContext);
  if (!ctx) {
    throw new Error(
      "usePageContext must be used within a PageContext.Provider",
    );
  }
  return ctx;
}

const PageSlots = new SlotManager([
  "Title",
  "Description",
  "Actions",
  "Toolbar",
  "Content",
  "Footer",
]);

type PageProps = Pick<
  React.ComponentProps<"div">,
  "className" | "children" | "ref"
> & {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  totalItems?: number;
};

function Page({
  className,
  isRefreshing = false,
  onRefresh = () => {},
  totalItems = 0,
  children,
  ...props
}: PageProps) {
  const { Title, Description, Actions, Content, Footer, Toolbar, rest } =
    PageSlots.useSlots(children);

  return (
    <PageContext.Provider
      value={{
        isRefreshing,
        onRefresh,
        totalItems,
      }}
    >
      <div
        className={cn(
          "container mx-auto flex flex-col gap-4 overflow-y-hidden px-2 pt-6",
          className,
        )}
        {...props}
      >
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between gap-8">
          {/* TITLE & DESCRIPTION  */}
          <div>
            <h1 className="text-2xl font-semibold">{Title}</h1>
            <h1 className="text-muted-foreground text-sm">{Description}</h1>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-4">{Actions}</div>
        </div>

        {/* TOOLBAR */}
        <div className="flex-end flex items-end justify-between gap-4">
          {Toolbar}
        </div>

        {/* CONTENT */}
        <ScrollArea className="w-full flex-1 overflow-y-auto rounded-lg py-2 pr-4">
          <AutoResizeDiv className="w-full">
            <section className="flex flex-col gap-4">{Content}</section>
          </AutoResizeDiv>
        </ScrollArea>

        {/* FOOTER */}
        <footer className="flex w-full items-center justify-between pb-3">
          {Footer}
        </footer>
        {rest}
      </div>
    </PageContext.Provider>
  );
}

type PageRefreshControlProps = Props<"button"> & {
  isFetching?: boolean;
  onRefresh?: () => void;
};

function PageRefreshButton({
  className,
  children,
  disabled,
  ...props
}: PageRefreshControlProps) {
  const { isRefreshing, onRefresh } = usePageContext();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isRefreshing ?? disabled}
      onClick={onRefresh}
      className={cn("-mb-2 text-xs hover:bg-transparent!", className)}
      {...props}
    >
      <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
      Refresh
    </Button>
  );
}

type PageSearchBarProps = Props<"input">;
export function PageSearchBar(props: PageSearchBarProps) {
  const navigate = useNavigate();
  const { search = "" } = useSearch({ strict: false });
  const { isRefreshing } = usePageContext();
  return (
    <div className="relative">
      <InputWithIcon
        startDecoration={<Search className="size-4" />}
        className={cn("max-w-50 text-sm", props.className)}
        value={search}
        onChange={(e) =>
          navigate({
            // @ts-expect-error We know we'll have search param
            search: { search: e.target.value },
          })
        }
        {...props}
      />
      <AnimatePresence>
        <span className="absolute top-1/2 right-2 -translate-y-1/2">
          {isRefreshing && search !== "" && <Spinner />}{" "}
        </span>
      </AnimatePresence>
    </div>
  );
}

Page.Pagination = PagePagination;
Page.RefreshButton = PageRefreshButton;
Page.Search = PageSearchBar;

Page.Title = PageSlots.createFill("Title");
Page.Description = PageSlots.createFill("Description");
Page.Actions = PageSlots.createFill("Actions");
Page.Toolbar = PageSlots.createFill("Toolbar");
Page.Content = PageSlots.createFill("Content");
Page.Footer = PageSlots.createFill("Footer");

export { Page };
