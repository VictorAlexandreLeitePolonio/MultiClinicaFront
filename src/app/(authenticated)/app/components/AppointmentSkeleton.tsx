"use client";

import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/Skeleton";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

export function AppointmentSkeleton() {
  return (
    <motion.div 
      variants={fadeSlideUp}
      className="bg-white rounded-sm border-2 border-[#e2ebe6] p-4 flex justify-between items-center"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-sm" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-sm" />
    </motion.div>
  );
}

export function AppointmentSkeletonList() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3"
    >
      {[...Array(3)].map((_, i) => (
        <AppointmentSkeleton key={i} />
      ))}
    </motion.div>
  );
}
