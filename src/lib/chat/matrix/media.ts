import encrypt from 'matrix-encrypt-attachment';
import { getAttachmentUrl } from '../../api/attachment';

/**
 * Read the file as an ArrayBuffer.
 * @param {File} file The file to read
 * @return {Promise} A promise that resolves with an ArrayBuffer when the file
 *   is read.
 */
export function readFileAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (e): void {
      resolve(e.target?.result as ArrayBuffer);
    };
    reader.onerror = function (e): void {
      reject(e);
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get the dimensions of an image file.
 * @param {File} file The image file to read.
 * @return {Promise} A promise that resolves with an object containing
 *   the width and height of the image when it is loaded.
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Unable to determine image dimensions.'));
    };
    img.src = URL.createObjectURL(file);
  });
}

export class UploadCanceledError extends Error {}

// https://github.com/matrix-org/matrix-react-sdk/blob/develop/src/ContentMessages.ts#L339
export async function encryptFile(file: File): Promise<{ info: encrypt.IEncryptedFile; file?: File }> {
  const abortController = new AbortController();

  // If the room is encrypted then encrypt the file before uploading it.
  // First read the file into memory.
  const data = await readFileAsArrayBuffer(file);
  if (abortController.signal.aborted) throw new UploadCanceledError('Error occurred while reading file');

  // Then encrypt the file.
  const encryptResult = await encrypt.encryptAttachment(data);
  if (abortController.signal.aborted) throw new UploadCanceledError('Error occurred while encrypting file');

  // Pass the encrypted data as a Blob to the uploader.
  const blob = new Blob([encryptResult.data]);
  const encryptedFile = new File([blob], file.name, { type: file.type });

  return {
    info: encryptResult.info,
    file: encryptedFile,
  };
}

// https://github.com/matrix-org/matrix-react-sdk/blob/develop/src/utils/DecryptFile.ts#L50
export async function decryptFile(encryptedFile, mimetype): Promise<Blob> {
  const signedUrl = await getAttachmentUrl({ key: encryptedFile.url });

  // Download the encrypted file as an array buffer.
  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`Error occurred while downloading file ${encryptedFile.url}: ${await response.text()}`);
  }
  const responseData: ArrayBuffer = await response.arrayBuffer();

  try {
    // Decrypt the array buffer using the information taken from the event content.
    const dataArray = await encrypt.decryptAttachment(responseData, encryptedFile);
    // Turn the array into a Blob and give it the correct MIME-type.
    return new Blob([dataArray], { type: mimetype });
  } catch (e) {
    throw new Error(`Error occurred while decrypting file ${encryptedFile.url}: ${e}`);
  }
}
