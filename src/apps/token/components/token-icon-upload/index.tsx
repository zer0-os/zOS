import React, { useState, useRef } from 'react';
import { IconUpload2, IconImage } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

interface TokenIconUploadProps {
  currentIconUrl?: string;
  selectedFile?: File | null;
  disabled?: boolean;
  error?: string;
  onFileSelected: (file: File) => void;
}

export const TokenIconUpload = ({
  onFileSelected,
  currentIconUrl,
  selectedFile,
  disabled,
  error,
}: TokenIconUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentIconUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when selectedFile changes
  React.useEffect(() => {
    if (selectedFile && !currentIconUrl) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else if (currentIconUrl) {
      setPreview(currentIconUrl);
    }
  }, [selectedFile, currentIconUrl]);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Pass file to parent component
    onFileSelected(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const getFileTypeIcon = () => {
    return <IconImage size={24} />;
  };

  return (
    <div className={styles.TokenIconUpload}>
      <div
        className={`${styles.UploadArea} ${dragActive ? styles.DragActive : ''} ${disabled ? styles.Disabled : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileInputChange}
          disabled={disabled}
          className={styles.FileInput}
        />

        {preview ? (
          <div className={styles.PreviewContainer}>
            <img src={preview} alt='Token icon preview' className={styles.Preview} />
            <div className={styles.Overlay}>
              <IconUpload2 size={20} />
              <span>Click to change</span>
            </div>
          </div>
        ) : (
          <div className={styles.Placeholder}>
            {getFileTypeIcon()}
            <div className={styles.PlaceholderText}>
              <div className={styles.PlaceholderTitle}>Upload Token Icon</div>
              <div className={styles.PlaceholderSubtitle}>Drag & drop or click to select</div>
              <div className={styles.PlaceholderSize}>Max 10MB</div>
            </div>
          </div>
        )}
      </div>

      {error && <div className={styles.Error}>{error}</div>}
    </div>
  );
};
