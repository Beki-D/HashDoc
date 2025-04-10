// src/components/FileUploader/UploadSection.tsx
import { FilePond } from "react-filepond";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUp, ArrowUpFromLine, Loader2 } from "lucide-react";

interface UploadSectionProps {
  files: any[];
  setFiles: (files: any[]) => void;
  uploading: boolean;
  uploadProgress: number;
  hashing: boolean;
  handleConfirmUpload: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  files,
  setFiles,
  uploading,
  uploadProgress,
  hashing,
  handleConfirmUpload,
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-700/40 backdrop-blur-sm p-4 rounded-xl border border-gray-600 shadow-sm">
        <h3 className="text-lg font-medium text-cyan-100 mb-4 flex items-center">
          <FileUp className="mr-2 h-5 w-5 text-cyan-300" />
          Upload a PDF/Image Doc
        </h3>

        <FilePond
          files={files}
          onupdatefiles={setFiles}
          allowMultiple={false}
          maxFiles={1}
          acceptedFileTypes={["application/pdf", "image/*"]}
          labelIdle='Drag & Drop your PDF/Image or <span class="filepond--label-action text-gray-700 font-bold">Browse</span>'
          className="rounded-xl filepond--panel-root bg-gray-700/50 border border-gray-600"
          credits={false}
        />

        {hashing && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-cyan-300">
              <span>Calculating hash...</span>
            </div>
            <Progress value={33} className="h-2 bg-gray-700" />{" "}
          </div>
        )}

        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-cyan-300">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 bg-gray-700" />
          </div>
        )}

        <Button
          onClick={handleConfirmUpload}
          disabled={files.length === 0 || uploading || hashing}
          className="w-full mt-4 bg-cyan-700 hover:bg-cyan-600 text-white font-medium h-12 rounded-lg transition-all shadow-lg shadow-cyan-700/30"
        >
          {hashing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Hashing...
            </>
          ) : uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ArrowUpFromLine className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
