import document from 'global/document';

/**
 * A utility for loading images with proper cleanup and error handling
 */

// Types
interface ImageLoadOptions {
  crossOrigin?: 'anonymous' | 'use-credentials';
  decoding?: 'sync' | 'async' | 'auto';
}

/**
 * Creates a hidden container for temporarily holding images during load
 */
function createImageContainer(): HTMLElement {
  const container = document.createElement('div');

  Object.assign(container.style, {
    position: 'absolute',
    width: '0',
    height: '0',
    visibility: 'hidden',
    overflow: 'hidden',
  });

  document.body.appendChild(container);
  return container;
}

// Singleton container instance
let imageContainer: HTMLElement | null = null;

/**
 * Loads an image from a URL and returns a promise that resolves with the loaded image element
 * @param src The image URL to load
 * @param options Optional loading configuration
 * @returns Promise resolving to the loaded HTMLImageElement
 */
export function loadImage(src: string, options: ImageLoadOptions = {}): Promise<HTMLImageElement> {
  // Create container on first use
  if (!imageContainer) {
    imageContainer = createImageContainer();
  }

  return new Promise((resolve, reject) => {
    const img = new Image();

    // Apply options if provided
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin;
    }
    if (options.decoding) {
      img.decoding = options.decoding;
    }

    img.onload = () => {
      imageContainer?.removeChild(img);
      resolve(img);
    };

    img.onerror = (_error) => {
      imageContainer?.removeChild(img);
      reject(new Error(`Failed to load image: ${src}`));
    };

    // Add to container and start loading
    imageContainer.appendChild(img);
    img.src = src;
  });
}
