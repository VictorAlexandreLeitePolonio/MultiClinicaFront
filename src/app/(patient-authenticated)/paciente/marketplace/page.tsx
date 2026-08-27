import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { MarketplacePageContent } from "./MarketplacePageContent";

export default function MarketplacePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <MarketplacePageContent />
    </Suspense>
  );
}
