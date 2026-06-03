import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, FileSpreadsheet, UploadCloud } from "lucide-react";

export default function FileDropZone({ onParse }) {
  const [hover, setHover] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (file) => {
      if (!file) return;
      setFileName(file.name);
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const errMsg = onParse?.(String(reader.result || ""), file.name);
        if (errMsg) setError(errMsg);
      };
      reader.onerror = () => setError("The file could not be read.");
      reader.readAsText(file);
    },
    [onParse]
  );

  return (
    <div
      data-testid="csv-dropzone"
      onDragOver={(event) => {
        event.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(event) => {
        event.preventDefault();
        setHover(false);
        handleFiles(event.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className="relative cursor-pointer overflow-hidden rounded-[30px] border border-dashed border-[color:var(--line-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(248,251,250,0.88)_100%)] px-6 py-11 transition-colors"
    >
      <motion.div
        animate={{ y: hover ? -6 : 0, scale: hover ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={`absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(23,183,156,0.14),transparent_48%)] transition-opacity duration-300 ${
          hover ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative flex flex-col items-center justify-center text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[22px] ${
            error ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-[color:var(--brand)]"
          }`}
        >
          {error ? <AlertTriangle className="h-8 w-8" /> : <UploadCloud className="h-8 w-8" />}
        </div>
        <div className="mt-5 font-display text-[1.55rem] font-semibold tracking-[-0.04em] text-[color:var(--text)]">
          {error ? "Import could not be completed" : fileName ? "File uploaded" : "Drop a CSV here or click to upload"}
        </div>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted)]">
          {error ? (
            <span className="font-medium text-rose-600">{error}</span>
          ) : fileName ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-soft">
              <FileSpreadsheet className="h-4 w-4 text-[color:var(--brand)]" />
              <span className="font-mono text-xs text-slate-700">{fileName}</span>
            </span>
          ) : (
            "Supported headers: name, stellar_address, amount, department. Excel-style semicolon separators are supported too."
          )}
        </p>
      </div>

      <input
        ref={inputRef}
        data-testid="csv-file-input"
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files?.[0])}
      />
    </div>
  );
}
