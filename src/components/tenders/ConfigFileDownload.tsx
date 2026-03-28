"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface ConfigFileDownloadProps {
  filePath: string;
  className?: string;
  label?: string;
}

export function ConfigFileDownload({ filePath, className = "", label }: ConfigFileDownloadProps) {
  const [loading, setLoading] = useState(false);
  const fileName = label || filePath.split("/").pop() || "Konfiguration";

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("tender-config-files")
        .createSignedUrl(filePath, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err) {
      console.error("Download error:", err);
      alert("Datei konnte nicht heruntergeladen werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Download size={14} />
      )}
      <FileText size={14} />
      <span className="truncate max-w-[180px]">{fileName}</span>
    </button>
  );
}
