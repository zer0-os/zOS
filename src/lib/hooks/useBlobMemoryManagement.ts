import { useEffect, useState, useRef } from 'react';
import { useMatrixImage } from './useMatrixImage';
import { isFileUploadedToMatrix } from '../chat/matrix/media';

interface UseBlobUrlMemoryManagementOptions {
  rootMargin?: string;
  threshold?: number;
  isThumbnail?: boolean;
}

/**
 * A hook that tracks image visibility in the viewport
 * - Monitors when images enter and exit the viewport
 * - Works with existing blob URLs created elsewhere in the application
 * - Handles Matrix URLs through the useMatrixImage hook
 *
 * @param url The image URL (can be a regular URL, data URL, blob URL, or Matrix URL)
 * @param options Configuration options
 * @returns The element ref to attach to your component and the URL to use
 */
export function useBlobUrlMemoryManagement<T extends HTMLElement = HTMLDivElement>(
  url: string | undefined,
  options: UseBlobUrlMemoryManagementOptions = {}
) {
  const { rootMargin = '100px', threshold = 0.1, isThumbnail = false } = options;

  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [isUrlRevoked, setIsUrlRevoked] = useState(false);
  const originalUrlRef = useRef<string | undefined>(url);

  useEffect(() => {
    originalUrlRef.current = url;
  }, [url]);

  // Check if this is a Matrix URL
  const isMatrixUrl = url ? isFileUploadedToMatrix(url) : false;

  // Use the Matrix image hook for Matrix URLs
  const {
    data: matrixUrl,
    isLoading: isMatrixLoading,
    refreshImage,
  } = useMatrixImage(isMatrixUrl ? url : undefined, {
    isThumbnail,
  });

  // The URL we'll actually use - either the Matrix URL or the original URL
  const effectiveUrl = isMatrixUrl ? matrixUrl : url;

  useEffect(() => {
    console.log(`xxxx [Memory Management] URL changed to ${url?.substring(0, 30)}...`);
    setIsUrlRevoked(false);
  }, [url]);

  useEffect(() => {
    if (isInView && isUrlRevoked) {
      console.log(`xxxx [Memory Management] URL was revoked, refreshing image for ${url?.substring(0, 30)}...`);
      refreshImage();
      setIsUrlRevoked(false);
    }
  }, [
    isInView,
    isUrlRevoked,
    url,
    refreshImage,
  ]);

  // Set up intersection observer to detect when element is in view
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Clean up previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;

      const isVisible = entry.isIntersecting;
      console.log(
        `xxxx [Memory Management] Element visibility changed: ${
          isVisible ? 'visible' : 'hidden'
        } for ${effectiveUrl?.substring(0, 30)}...`
      );

      // Only update state if it's different to avoid unnecessary re-renders
      if (isVisible !== isInView) {
        console.log(`xxxx [Memory Management] Updating isInView state to ${isVisible}...`);
        setIsInView(isVisible);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      rootMargin,
      threshold,
    });

    observerRef.current.observe(element);
    console.log(`xxxx [Memory Management] Started observing element for ${effectiveUrl?.substring(0, 30)}...`);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log(`xxxx [Memory Management] Stopped observing element for ${effectiveUrl?.substring(0, 30)}...`);
      }
    };
  }, [
    rootMargin,
    threshold,
    effectiveUrl,
    isInView,
  ]);

  // Handle URL revocation with a delay when element goes out of view
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only handle blob URLs
    if (!effectiveUrl || !effectiveUrl.startsWith('blob:')) {
      return;
    }

    // If element is not in view, set a timeout to revoke the URL
    if (!isInView) {
      console.log(`xxxx [Memory Management] Setting timeout to revoke URL for ${effectiveUrl?.substring(0, 30)}...`);

      timeoutRef.current = window.setTimeout(() => {
        console.log(`xxxx [Memory Management] Revoking blob URL: ${effectiveUrl?.substring(0, 30)}...`);
        URL.revokeObjectURL(effectiveUrl);
        setIsUrlRevoked(true);
        timeoutRef.current = null;
      }, 5000); // 5 second delay before revoking
    }

    // Clean up timeout on unmount
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [effectiveUrl, isInView]);

  return {
    elementRef,
    displayUrl: effectiveUrl,
    isLoading: isMatrixUrl && isMatrixLoading,
    isInView,
    isUrlRevoked,
  };
}
