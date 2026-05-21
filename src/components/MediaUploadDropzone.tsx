import { useRef } from "react";

interface MediaUploadDropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
}

export function MediaUploadDropzone({ onFiles, disabled, accept }: MediaUploadDropzoneProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="ml-dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {
      e.preventDefault();
      if (disabled) return;
      onFiles(Array.from(e.dataTransfer.files));
    }}>
      <input
        ref={ref}
        className="ml-hidden-input"
        type="file"
        multiple
        disabled={disabled}
        accept={accept}
        onChange={(e) => onFiles(Array.from(e.currentTarget.files ?? []))}
      />
      <p>Drag and drop files here, or</p>
      <button type="button" className="ml-btn" onClick={() => ref.current?.click()} disabled={disabled}>
        Choose Files
      </button>
    </div>
  );
}
