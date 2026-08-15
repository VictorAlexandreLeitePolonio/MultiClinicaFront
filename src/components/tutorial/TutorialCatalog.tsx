"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";
import { tutorialRegistry } from "@/lib/tutorials/tutorial.registry";
import { isTutorialCompleted } from "@/lib/tutorials/tutorial.storage";
import type { ModuleTutorial } from "@/lib/tutorials/tutorial.types";

interface TutorialCatalogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tutorial: ModuleTutorial) => void;
}

export function TutorialCatalog({ open, onClose, onSelect }: TutorialCatalogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[999998] bg-black/40" />
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
          <Dialog.Content className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.42)] dark:border-slate-700 dark:bg-slate-900">
            <Dialog.Title className="text-lg font-bold text-secondary dark:text-slate-50">
              Tutoriais
            </Dialog.Title>
            <div className="mt-4 space-y-3">
              {tutorialRegistry.map((tutorial) => {
                const completed = isTutorialCompleted(tutorial.id);
                return (
                  <div
                    key={tutorial.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-semibold text-secondary dark:text-slate-50">
                        {tutorial.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        {completed ? "Tutorial concluído." : "Conheça este módulo."}
                      </p>
                    </div>
                    <Button fullWidth={false} onClick={() => onSelect(tutorial)}>
                      {completed ? "Rever" : "Iniciar"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
