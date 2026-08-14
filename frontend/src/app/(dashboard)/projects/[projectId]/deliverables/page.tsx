"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FolderArchive, 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  HardDrive, 
  ArrowLeft, 
  Loader2, 
  X,
  FileSpreadsheet,
  FileDown,
  CheckCircle2,
  AlertCircle,
  File,
  Sparkles
} from "lucide-react";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface Deliverable {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: string;
  version: number;
  createdAt: string;
  uploader?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function DeliverablesPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [storageUsedMb, setStorageUsedMb] = useState(0);
  const [storageQuotaMb, setStorageQuotaMb] = useState(500);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal & state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [delivType, setDelivType] = useState("DELIVERABLE");
  const [version, setVersion] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchDeliverables();
  }, [projectId]);

  const fetchDeliverables = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/deliverables`);
      setDeliverables(res.data.deliverables || []);
      setStorageUsedMb(res.data.storageUsedMb || 0);
      setStorageQuotaMb(res.data.storageQuotaMb || 500);
    } catch (error) {
      console.error("Failed to fetch deliverables:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadError("");
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError(lang === "fr" ? "Veuillez sélectionner un fichier physique à téléverser." : "Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", delivType);
      formData.append("version", version.toString());

      const res = await api.post(`/projects/${projectId}/deliverables`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDeliverables((prev) => [res.data, ...prev]);
      const addedMb = selectedFile.size / (1024 * 1024);
      setStorageUsedMb((prev) => prev + addedMb);

      setUploadSuccess(lang === "fr" ? "Fichier téléversé avec succès !" : "File successfully uploaded!");
      setTimeout(() => {
        setIsUploadOpen(false);
        setSelectedFile(null);
        setUploadSuccess("");
      }, 1200);
    } catch (error: any) {
      setUploadError(error.response?.data?.message || (lang === "fr" ? "Erreur lors du téléversement." : "Upload failed."));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (delivId: string) => {
    if (!confirm(lang === "fr" ? "Êtes-vous sûr de vouloir supprimer définitivement ce livrable ?" : "Are you sure you want to delete this deliverable?")) return;

    try {
      await api.delete(`/projects/${projectId}/deliverables/${delivId}`);
      const target = deliverables.find((d) => d.id === delivId);
      if (target) {
        const freedMb = target.fileSize / (1024 * 1024);
        setStorageUsedMb((prev) => Math.max(0, prev - freedMb));
      }
      setDeliverables((prev) => prev.filter((d) => d.id !== delivId));
    } catch (error) {
      console.error("Failed to delete deliverable:", error);
    }
  };

  const handleDownload = async (deliv: Deliverable) => {
    try {
      const token = localStorage.getItem("accessToken");
      const downloadUrl = `http://localhost:4000/api/projects/${projectId}/deliverables/${deliv.id}/download`;
      
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = deliv.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download file:", error);
      alert(lang === "fr" ? "Erreur lors du téléchargement du fichier." : "Error downloading file.");
    }
  };

  // Quota percentage and color
  const usedPercentage = Math.min(100, Math.round((storageUsedMb / storageQuotaMb) * 100)) || 0;
  const isNearLimit = usedPercentage >= 75 && usedPercentage < 90;
  const isOverLimit = usedPercentage >= 90;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/projects/${projectId}/board`)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#182234] transition-all border border-[#233148]"
            title={lang === "fr" ? "Retour au tableau" : "Back to board"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
              <FolderArchive className="w-5 h-5 text-cyan-400" />
              <span>{t.deliverables_title}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {t.deliverables_subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              const csv = "FileName,Type,Version,SizeMb,Uploader,Date\n" +
                deliverables.map(d => `"${d.fileName}",${d.type},v${d.version},${(d.fileSize / (1024*1024)).toFixed(2)},"${d.uploader?.firstName || 'Unknown'}",${d.createdAt}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `Deliverables_Project.csv`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-2 border-[#2b3a55] bg-[#141b2b] text-slate-200 hover:bg-[#1e293b]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            {t.export_excel}
          </Button>

          <Button
            onClick={() => window.print()}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-2 border-[#2b3a55] bg-[#141b2b] text-slate-200 hover:bg-[#1e293b]"
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            {t.export_pdf}
          </Button>

          <Button
            onClick={() => setIsUploadOpen(true)}
            size="sm"
            className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
          >
            <Upload className="w-4 h-4" /> {t.upload_payload}
          </Button>
        </div>
      </div>

      {/* Storage Quota Card */}
      <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>{t.storage_quota}</span>
          </div>
          <div className="font-semibold text-slate-300">
            <span className="text-emerald-400 font-bold">{storageUsedMb.toFixed(2)} MB</span> / {storageQuotaMb} MB ({usedPercentage}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-[#1c2638] overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOverLimit
                ? "bg-rose-500"
                : isNearLimit
                ? "bg-amber-400"
                : "bg-gradient-to-r from-emerald-500 to-cyan-400"
            }`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        {/* Warning Badge if near or over limit */}
        {isOverLimit ? (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            <span>{lang === "fr" ? "Alerte : Le quota de stockage du projet est saturé (>90%). Veuillez purger des fichiers." : "Alert: Storage quota near saturation (>90%). Please remove unused files."}</span>
          </div>
        ) : isNearLimit ? (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4" />
            <span>{lang === "fr" ? "Attention : Le stockage dépasse 75% de sa capacité allouée." : "Warning: Storage exceeds 75% of allocated capacity."}</span>
          </div>
        ) : null}
      </div>

      {/* Deliverables Table */}
      <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] text-slate-400 uppercase bg-[#162032] border-b border-[#232f44]">
            <tr>
              <th className="px-6 py-4">{lang === "fr" ? "Fichier / Livrable" : "File / Deliverable"}</th>
              <th className="px-6 py-4">{lang === "fr" ? "Type" : "Type"}</th>
              <th className="px-6 py-4">{lang === "fr" ? "Version" : "Version"}</th>
              <th className="px-6 py-4">{lang === "fr" ? "Taille" : "Size"}</th>
              <th className="px-6 py-4">{lang === "fr" ? "Opérateur" : "Uploader"}</th>
              <th className="px-6 py-4">{lang === "fr" ? "Date" : "Date"}</th>
              <th className="px-6 py-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2a3e]">
            {deliverables.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  {lang === "fr" ? "Aucun livrable ni rapport déposé pour ce projet." : "No deliverables or reports uploaded for this project."}
                </td>
              </tr>
            ) : (
              deliverables.map((deliv) => {
                const sizeMb = (deliv.fileSize / (1024 * 1024)).toFixed(2);
                return (
                  <tr key={deliv.id} className="hover:bg-[#162032]/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-xs">{deliv.fileName}</span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        deliv.type === 'REPORT' 
                          ? 'bg-amber-950/50 text-amber-400 border-amber-800/50' 
                          : 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50'
                      }`}>
                        {deliv.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-300">
                      v{deliv.version}.0
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {sizeMb} MB
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      {deliv.uploader ? `${deliv.uploader.firstName} ${deliv.uploader.lastName}` : "-"}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(deliv.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(deliv)}
                          className="h-8 w-8 p-0 rounded-lg border-[#2b3a55] bg-[#141b2b] hover:bg-[#1e293b] text-cyan-400"
                          title={lang === "fr" ? "Télécharger le fichier réel" : "Download real file"}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(deliv.id)}
                          className="h-8 w-8 p-0 rounded-lg border-[#2b3a55] bg-[#141b2b] hover:bg-rose-950/50 text-rose-400"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Real File Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-lg rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>{lang === "fr" ? "TÉLÉVERSER UN LIVRABLE / RAPPORT" : "UPLOAD DELIVERABLE / REPORT"}</span>
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop File Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-emerald-500 bg-emerald-500/10"
                    : selectedFile
                    ? "border-cyan-500/60 bg-cyan-950/20"
                    : "border-[#2b3a55] hover:border-emerald-500/50 bg-[#162032]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <File className="w-8 h-8 text-cyan-400 animate-bounce" />
                    <span className="font-bold text-slate-100 text-sm">{selectedFile.name}</span>
                    <span className="text-slate-400 text-xs">({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="font-semibold text-slate-200">
                      {lang === "fr" ? "Glissez-déposez votre fichier ici, ou cliquez pour parcourir" : "Drag and drop your file here, or click to browse"}
                    </span>
                    <span className="text-slate-500 text-[11px]">PDF, Word, Excel, ZIP, Images (Max 100 MB)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="delivType" className="text-slate-300 font-semibold">{lang === "fr" ? "TYPE DE LIVRABLE" : "TYPE"}</Label>
                  <select
                    id="delivType"
                    value={delivType}
                    onChange={(e) => setDelivType(e.target.value)}
                    className="w-full rounded-xl border border-[#2b3a55] bg-[#162032] p-2.5 text-xs text-slate-100 font-medium focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="DELIVERABLE">{lang === "fr" ? "Livrable de mission (Code, Bundle)" : "Deliverable"}</option>
                    <option value="REPORT">{lang === "fr" ? "Rapport d'audit / Synthèse" : "Report"}</option>
                    <option value="SPECIFICATION">{lang === "fr" ? "Spécification technique" : "Specification"}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="version" className="text-slate-300 font-semibold">{lang === "fr" ? "NUMÉRO DE VERSION" : "VERSION"}</Label>
                  <Input
                    id="version"
                    type="number"
                    min={1}
                    value={version}
                    onChange={(e) => setVersion(parseInt(e.target.value) || 1)}
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              {uploadError && (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-rose-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3 text-emerald-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232e42]">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} className="rounded-xl border-[#2b3a55] bg-[#162032] hover:bg-[#1e293b] text-slate-300">
                  {t.cancel}
                </Button>
                <Button type="submit" disabled={isUploading || !selectedFile} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                  {isUploading ? (lang === "fr" ? "Téléversement..." : "Uploading...") : (lang === "fr" ? "Téléverser le fichier" : "Upload File")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
