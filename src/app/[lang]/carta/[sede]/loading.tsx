import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" className="page-container flex flex-col gap-6 py-16">
      <Skeleton className="h-12 w-2/3" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-72 w-full rounded-card" />
        ))}
      </div>
    </div>
  );
}
