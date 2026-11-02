import { Suspense } from "react";
import { ConfirmSignup } from "./components/ConfirmSignup";

export default function ConfirmSignupPage() {
  return (
    <Suspense>
      <ConfirmSignup />
    </Suspense>
  );
}
