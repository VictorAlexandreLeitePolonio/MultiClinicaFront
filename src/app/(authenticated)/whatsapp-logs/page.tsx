"use client";

import { Suspense } from "react";
import { motion } from "motion/react";
import WhatsAppLogsList from "./components/WhatsAppLogsList";

function WhatsAppLogsPage() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        <WhatsAppLogsList />
      </motion.div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <WhatsAppLogsPage />
    </Suspense>
  );
}
