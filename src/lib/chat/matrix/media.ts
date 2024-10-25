import encrypt from 'matrix-encrypt-attachment';
import { getAttachmentUrl } from '../../api/attachment';
import { getAccessToken, mxcUrlToHttp } from '..';
import { encode } from 'blurhash';

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

/**
 * Get the pixel data of an image file.
 * @param {File} file The image file to read.
 * @return {Promise} A promise that resolves with an ImageData object containing
 *   the pixel data of the image when it is loaded.
 */
export function getImagePixelData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const imageData = event.target?.result;

      const img = new Image();
      img.src = imageData as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          resolve(imageData);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = (error) => {
        reject(error);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generate a Blurhash for an image file.
 * @param {File} file The image file to read.
 * @return {Promise} A promise that resolves with the Blurhash string when the image is processed.
 */
export async function generateBlurhash(file: File): Promise<string> {
  const imageData = await getImagePixelData(file);
  const blurhash = encode(imageData.data, imageData.width, imageData.height, 3, 2);
  return blurhash;
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

export function isFileUploadedToMatrix(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  return url.includes('_matrix/client/v1/media/download') || url.startsWith('mxc://');
}

// https://github.com/matrix-org/matrix-react-sdk/blob/develop/src/utils/DecryptFile.ts#L50
export async function decryptFile(encryptedFile, mimetype): Promise<Blob> {
  // Determine if the file is encrypted by checking for encryption-related fields
  const isEncrypted = !!(encryptedFile.key && encryptedFile.iv && encryptedFile.hashes?.sha256);

  const url = encryptedFile.url;
  let response;

  if (isFileUploadedToMatrix(url)) {
    response = await fetch(mxcUrlToHttp(url), {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });
  } else {
    const signedUrl = await getAttachmentUrl({ key: encryptedFile.url });
    response = await fetch(signedUrl);
  }

  if (!response.ok) {
    throw new Error(`Error occurred while downloading file ${encryptedFile.url}: ${await response.text()}`);
  }
  const responseData: ArrayBuffer = await response.arrayBuffer();

  if (isEncrypted) {
    try {
      // Decrypt the array buffer using the information taken from the event content
      const dataArray = await encrypt.decryptAttachment(responseData, encryptedFile);
      // Turn the array into a Blob and give it the correct MIME-type
      return new Blob([dataArray], { type: mimetype });
    } catch (e) {
      throw new Error(`Error occurred while decrypting file ${encryptedFile.url}: ${e}`);
    }
  } else {
    // For non-encrypted files, directly create a Blob from the downloaded data
    return new Blob([responseData], { type: mimetype });
  }
}
