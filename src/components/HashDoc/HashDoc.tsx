// src/components/FileUploader/Hashdoc.tsx
import { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabaseService } from "@/lib/supabase/services";
import { FileRecord } from "@/lib/supabase/types";
import { UploadSection } from "./UploadSection";
import { FileList } from "./FileList";
import {
  FileText,
  ArrowUpFromLine,
  RefreshCw,
  FileUp,
  Trash2,
} from "lucide-react";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFilePoster from "filepond-plugin-file-poster";
import { registerPlugin } from "react-filepond";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFilePoster);

const FileUploader: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewFileId, setPreviewFileId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  // Simulate upload progress
  useEffect(() => {
    if (!uploading || hashing) return;

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 95 ? prev : prev + 5));
    }, 200);

    return () => clearInterval(interval);
  }, [uploading, hashing]);

  // Fetch files from Supabase
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const fetchedFiles = await supabaseService.fetchFiles();
      setUploadedFiles(fetchedFiles);
    } catch (err) {
      toast.error("Failed to load files", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  }, []);

  // Handle file upload with hashing and duplicate checking
  const handleConfirmUpload = useCallback(async () => {
    if (files.length === 0) {
      toast.warning("No file selected", {
        description: "Please select a PDF to upload.",
        icon: <FileUp className="h-5 w-5" />,
      });
      return;
    }

    setHashing(true);
    const file = files[0].file as File;

    try {
      const { isDuplicate } = await supabaseService.uploadFile(file);
      setHashing(false);
      setUploading(true);
      setUploadProgress(100);

      // Delay to show completion before resetting
      setTimeout(() => {
        toast.success("Upload successful!", {
          description: `${file.name} added${
            isDuplicate ? " (Duplicate)" : ""
          }.`,
          icon: <FileUp className="h-5 w-5" />,
        });
        setFiles([]);
        loadFiles();
        setActiveTab("library");
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setHashing(false);
      setUploading(false);
    }
  }, [files, loadFiles]);

  // Delete a file with confirmation
  const handleDelete = useCallback(
    async (fileId: number, filename: string) => {
      if (!confirm(`Delete ${filename}? This action cannot be undone.`)) return;

      try {
        await supabaseService.deleteFile(fileId, filename);
        toast.success("File deleted!", {
          description: `${filename} removed.`,
          icon: <Trash2 className="h-5 w-5" />,
        });
        setPreviewFileId(null);
        loadFiles();
      } catch (err) {
        toast.error("Delete failed", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
    [loadFiles]
  );

  // Toggle file preview
  const togglePreview = useCallback((fileId: number) => {
    setPreviewFileId((prev) => (prev === fileId ? null : fileId));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-800 flex items-center justify-center sm:p-6">
      <Card className="w-full max-w-4xl bg-gray-800/90 backdrop-blur-lg border border-gray-700 shadow-2xl overflow-hidden transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-gray-800 via-blue-900 to-cyan-500 text-white p-6 sm:p-8 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/10 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">HashDoc</CardTitle>
                <CardDescription className="text-cyan-100/80 mt-1">
                  File storage management with hash-based duplicate detection
                </CardDescription>
              </div>
            </div>
            <Badge className="self-start sm:self-auto bg-cyan-900/50 text-cyan-100 hover:bg-cyan-800/60 transition-all border border-cyan-800/50">
              {uploadedFiles.length} Document
              {uploadedFiles.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-2 pt-6 sm:px-6">
            <TabsList className="grid w-full grid-cols-2 mb-2 p-1 bg-gray-700/50">
              <TabsTrigger
                value="upload"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 text-cyan-700 data-[state=active]:text-cyan-300 data-[state=active]:shadow-sm data-[state=active]:shadow-gray-500/40"
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="library"
                className="flex items-center gap-2 data-[state=active]:bg-gray-700 text-cyan-700 data-[state=active]:text-cyan-300 data-[state=active]:shadow-sm data-[state=active]:shadow-gray-500/40"
              >
                <FileText className="h-4 w-4" />
                Library
                {uploadedFiles.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 bg-cyan-800/50 text-blue-200 border border-blue-800/50"
                  >
                    {uploadedFiles.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-2 sm:p-6">
            <TabsContent value="upload" className="mt-0 space-y-6">
              <UploadSection
                files={files}
                setFiles={setFiles}
                uploading={uploading}
                hashing={hashing}
                uploadProgress={uploadProgress}
                handleConfirmUpload={handleConfirmUpload}
              />
            </TabsContent>

            <TabsContent value="library" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-lg font-medium text-cyan-100 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-cyan-300" />
                    Your Documents
                  </h3>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={loadFiles}
                    disabled={loading}
                    className="text-xs border-gray-600 bg-gray-700 text-cyan-100 hover:bg-gray-600 hover:text-white"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 mr-1 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>
                <Separator className="bg-gray-700" />
                <FileList
                  uploadedFiles={uploadedFiles}
                  loading={loading}
                  previewFileId={previewFileId}
                  togglePreview={togglePreview}
                  handleDelete={handleDelete}
                  setActiveTab={setActiveTab}
                />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
};

export default FileUploader;
