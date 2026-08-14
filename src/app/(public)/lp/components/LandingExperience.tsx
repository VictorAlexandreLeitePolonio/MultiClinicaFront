"use client";

import { useState } from "react";
import { DEFAULT_LANDING_MODULE_ID, type LandingModuleId } from "./landingModules";
import { LandingFeatures } from "./LandingFeatures";
import { LandingHero } from "./LandingHero";

export function LandingExperience() {
  const [activeModuleId, setActiveModuleId] = useState<LandingModuleId>(
    DEFAULT_LANDING_MODULE_ID,
  );

  return (
    <>
      <LandingHero
        activeModuleId={activeModuleId}
        onModuleChange={setActiveModuleId}
      />
      <LandingFeatures
        activeModuleId={activeModuleId}
        onModuleChange={setActiveModuleId}
      />
    </>
  );
}
