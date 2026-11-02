import { Suspense } from "react";
import { PlanPage } from "./components/PlanPage";

export default function Page() {
  return (
    <Suspense>
      <PlanPage />
    </Suspense>
  );
}
