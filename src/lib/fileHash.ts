import CryptoJS from "crypto-js";

export async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const start = performance.now(); // Start Performance timing

        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) throw new Error("Failed to read file content");

        const wordArray = CryptoJS.lib.WordArray.create(
          arrayBuffer as ArrayBuffer
        );
        const hash = CryptoJS.SHA256(wordArray).toString();

        const end = performance.now(); // End timing
        console.log(`Hashing took: ${(end - start).toFixed(2)} ms`);
        resolve(hash);
      } catch (error) {
        reject(
          error instanceof Error ? error : new Error("Unknown hashing error")
        );
      }
    };

    reader.onerror = () => reject(new Error("File reading failed"));
    reader.readAsArrayBuffer(file);
  });
}
