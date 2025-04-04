import { supabase } from "./client";
import { FileRecord } from "./types";
import { calculateFileHash } from "@/lib/fileHash";

export const supabaseService = {
  async fetchFiles(): Promise<FileRecord[]> {
    try {
      console.log("Fetching files from Supabase...");
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(`Failed to fetch files: ${error.message}`);

      const signedFiles = await Promise.all(
        (data || []).map(async (file) => {
          const { data: signedData, error: signedError } =
            await supabase.storage
              .from("uploads")
              .createSignedUrl(file.filename, 31536000); // 1 year
          if (signedError) return { ...file, signedUrl: "#" };
          return { ...file, signedUrl: signedData.signedUrl };
        })
      );
      return signedFiles;
    } catch (err) {
      console.error("Unexpected error in fetchFiles:", err);
      throw err;
    }
  },

  async uploadFile(
    file: File
  ): Promise<{ hash: string; isDuplicate: boolean }> {
    const filePath = file.name;
    try {
      // Calculate hash before uploading
      const hash = await calculateFileHash(file);
      console.log(`Calculated hash for ${filePath}: ${hash}`);

      // Check for existing hash
      const { data: existingFiles, error: checkError } = await supabase
        .from("files")
        .select("id")
        .eq("hash", hash)
        .limit(1);
      if (checkError)
        throw new Error(`Hash check failed: ${checkError.message}`);
      const isDuplicate = !!existingFiles?.length;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Insert file record with hash and duplicate status
      const { error: dbError } = await supabase.from("files").insert({
        filename: filePath,
        size: file.size,
        hash,
        is_duplicate: isDuplicate,
      });
      if (dbError) {
        await supabase.storage.from("uploads").remove([filePath]);
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      return { hash, isDuplicate };
    } catch (err) {
      console.error("Unexpected error in uploadFile:", err);
      throw err;
    }
  },

  async deleteFile(fileId: number, filename: string): Promise<void> {
    try {
      const { error: storageError } = await supabase.storage
        .from("uploads")
        .remove([filename]);
      if (storageError)
        throw new Error(`Storage delete failed: ${storageError.message}`);

      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", fileId);
      if (dbError)
        throw new Error(`Database delete failed: ${dbError.message}`);
    } catch (err) {
      console.error("Unexpected error in deleteFile:", err);
      throw err;
    }
  },
};
