"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  loading = false,
}) {
  const confirmStyles = {
    danger: "bg-red-600 text-white hover:bg-red-700",
    primary: "bg-primary text-white hover:opacity-90",
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 glass-card rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-primary">
              {title}
            </Dialog.Title>
            <Dialog.Close className="text-white/40 hover:text-primary">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-6 text-sm leading-6 text-white/60">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            <Dialog.Close className="px-4 py-2 text-sm font-medium rounded-lg bg-background text-primary border border-white/5 hover:bg-white/[0.06]">
              {cancelLabel}
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 ${confirmStyles[variant] || confirmStyles.primary}`}
            >
              {loading ? `${confirmLabel}...` : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
