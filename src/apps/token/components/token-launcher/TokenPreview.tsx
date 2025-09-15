import React from 'react';
import { FormData, GRADUATION_THRESHOLD } from './utils';

import styles from './styles.module.scss';

interface TokenPreviewProps {
  formData: FormData;
  selectedIconFile: File | null;
}

export const TokenPreview = ({ formData, selectedIconFile }: TokenPreviewProps) => {
  const hasData = formData.name && formData.symbol && formData.initialBuyAmount && selectedIconFile;

  return (
    <div className={styles.TokenPreview}>
      <div className={styles.PreviewHeader}>
        <div className={styles.PreviewTitle}>Token Preview</div>
        {hasData && selectedIconFile && (
          <div className={styles.PreviewHeaderIcon}>
            <img src={URL.createObjectURL(selectedIconFile)} alt='Token icon' className={styles.PreviewIconImage} />
          </div>
        )}
      </div>
      <div className={styles.PreviewContent}>
        {hasData ? (
          <>
            <div className={styles.PreviewRow}>
              <span className={styles.PreviewLabel}>Name:</span>
              <span className={styles.PreviewValue}>{formData.name}</span>
            </div>
            <div className={styles.PreviewRow}>
              <span className={styles.PreviewLabel}>Symbol:</span>
              <span className={styles.PreviewValue}>{formData.symbol}</span>
            </div>
            <div className={styles.PreviewRow}>
              <span className={styles.PreviewLabel}>Initial Liquidity:</span>
              <span className={styles.PreviewValue}>{formData.initialBuyAmount} MEOW</span>
            </div>
            {formData.description && (
              <div className={styles.PreviewRow}>
                <span className={styles.PreviewLabel}>Description:</span>
                <span className={styles.PreviewValue}>{formData.description}</span>
              </div>
            )}
            <div className={styles.PreviewRow}>
              <span className={styles.PreviewLabel}>Graduation Threshold:</span>
              <span className={styles.PreviewValue}>{GRADUATION_THRESHOLD}</span>
            </div>
          </>
        ) : (
          <div className={styles.PreviewEmpty}>
            <div className={styles.PreviewEmptyText}>Fill in the form above to see your token preview</div>
          </div>
        )}
      </div>
    </div>
  );
};
