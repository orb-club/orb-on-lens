"use client";

import { useState, useRef, useCallback } from "react";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const SUPPORTED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "image/avif", "image/heic", "image/bmp", "image/tiff",
  "video/mp4", "video/webm", "video/quicktime", "video/mpeg", "video/ogg",
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/webm", "audio/flac",
];

type UploadResult = {
  uri: string;
  gatewayUrl: string;
  storageKey: string;
};

export default function Home() {
  const [account, setAccount] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (f.size > MAX_FILE_SIZE) {
      return `File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max is 100 MB.`;
    }
    if (!SUPPORTED_TYPES.includes(f.type)) {
      return `Unsupported file type: ${f.type || "unknown"}`;
    }
    return null;
  }, []);

  const handleFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    setProgress(null);

    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const upload = useCallback(() => {
    if (!file || !account.trim()) return;

    setError(null);
    setResult(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("account", account.trim());

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setResult({
            uri: json.uri,
            gatewayUrl: json.gatewayUrl,
            storageKey: json.storageKey,
          });
          setProgress(100);
        } else {
          setError(json.message || "Upload failed");
          setProgress(null);
        }
      } catch {
        setError("Failed to parse response");
        setProgress(null);
      }
    });

    xhr.addEventListener("error", () => {
      setError("Network error during upload");
      setProgress(null);
    });

    xhr.open("POST", "/api/storage/upload");
    xhr.send(formData);
  }, [file, account]);

  const reset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setProgress(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <h1>Lens File Upload</h1>
      <p>Upload files to Lens Chain storage (Grove) with Lens account ACL.</p>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="account" style={{ display: "block", marginBottom: 4, fontWeight: 500 }}>
          Lens Account Address
        </label>
        <input
          id="account"
          type="text"
          placeholder="0x..."
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: 4,
            border: "1px solid #ccc",
            fontFamily: "monospace",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: `2px dashed ${isDragging ? "#0070f3" : "#ccc"}`,
          borderRadius: 8,
          padding: "2rem",
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "#f0f7ff" : "#fafafa",
          transition: "all 0.15s",
          marginBottom: "1rem",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={SUPPORTED_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {file ? (
          <div>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 4, marginBottom: 8 }}
              />
            )}
            <p style={{ margin: 0, fontWeight: 500 }}>{file.name}</p>
            <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
              {file.type} &middot; {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p style={{ margin: 0, fontSize: 16, color: "#666" }}>
              Drop a file here or click to select
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#999" }}>
              Images, video, audio &middot; Max 100 MB
            </p>
          </div>
        )}
      </div>

      {progress !== null && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ background: "#eee", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div
              style={{
                background: progress === 100 && result ? "#10b981" : "#0070f3",
                height: "100%",
                width: `${progress}%`,
                transition: "width 0.2s",
              }}
            />
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{progress}%</p>
        </div>
      )}

      {error && (
        <p style={{ color: "#e11d48", background: "#fef2f2", padding: "0.5rem 0.75rem", borderRadius: 4 }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={upload}
          disabled={!file || !account.trim() || (progress !== null && !result)}
          style={{
            padding: "0.5rem 1.25rem",
            borderRadius: 4,
            border: "none",
            background: !file || !account.trim() ? "#ccc" : "#0070f3",
            color: "#fff",
            cursor: !file || !account.trim() ? "default" : "pointer",
            fontWeight: 500,
          }}
        >
          Upload
        </button>
        {file && (
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: 4,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {result && (
        <div style={{ marginTop: "1.5rem", background: "#f0fdf4", padding: "1rem", borderRadius: 8 }}>
          <h3 style={{ margin: "0 0 0.5rem" }}>Upload Complete</h3>
          <div style={{ fontSize: 14, wordBreak: "break-all" }}>
            <p><strong>URI:</strong> {result.uri}</p>
            <p><strong>Gateway URL:</strong>{" "}
              <a href={result.gatewayUrl} target="_blank" rel="noopener noreferrer">
                {result.gatewayUrl}
              </a>
            </p>
            <p><strong>Storage Key:</strong> {result.storageKey}</p>
          </div>
        </div>
      )}
    </main>
  );
}
