import { useState, useCallback } from 'react';

interface CopyToClipboardReturn {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

/**
 * Custom hook for copying text to clipboard
 * @returns {Object} Object containing copied state and copyToClipboard function
 */
export const useCopyToClipboard = (): CopyToClipboardReturn => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }, []);

  return { copied, copyToClipboard };
};