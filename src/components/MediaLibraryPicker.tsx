import clsx from "clsx";
import { useState } from "react";
import type { MediaLibraryPickerProps } from "../types";
import { MediaLibraryModal } from "./MediaLibraryModal";

export function MediaLibraryPicker({
  client,
  label = "Pick media",
  context,
  contextId,
  multiple,
  imagesOnly,
  allowedTypes,
  maxFileSizeMb,
  onPick,
  renderTrigger,
  className
}: MediaLibraryPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={clsx("ml-picker", className)}>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <button className="ml-btn" type="button" onClick={() => setOpen(true)}>{label}</button>
      )}
      <MediaLibraryModal
        open={open}
        onClose={() => setOpen(false)}
        client={client}
        {...(context ? { context } : {})}
        {...(contextId ? { contextId } : {})}
        {...(multiple !== undefined ? { multiple } : {})}
        {...(imagesOnly !== undefined ? { imagesOnly } : {})}
        {...(allowedTypes ? { allowedTypes } : {})}
        {...(maxFileSizeMb !== undefined ? { maxFileSizeMb } : {})}
        onPick={onPick}
      />
    </div>
  );
}
