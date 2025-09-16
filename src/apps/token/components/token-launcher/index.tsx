import { PanelBody } from '../../../../components/layout/panel';
import { Button } from '@zero-tech/zui/components/Button';
import { useState } from 'react';

import styles from './styles.module.scss';
import { validateFormData } from './utils';
import { TokenProcessingTransaction } from '../token-processing-transaction';
import { TokenSuccess } from '../token-success';
import { useTokenForm } from '../../hooks/useTokenForm';
import { useTokenSubmission } from '../../hooks/useTokenSubmission';
import { Header } from './Header';
import { InfoBox } from './InfoBox';
import { FormInputs } from './FormInputs';
import { TokenPreview } from './TokenPreview';

interface TokenLauncherProps {
  onBack: () => void;
  onViewToken: (tokenAddress: string) => void;
}

export const TokenLauncher = ({ onBack, onViewToken }: TokenLauncherProps) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTokenAddress, setSuccessTokenAddress] = useState<string | null>(null);

  const form = useTokenForm();
  const submission = useTokenSubmission({
    formData: form.formData,
    selectedIconFile: form.selectedIconFile,
    onTokenCreated: (tokenAddress: string) => {
      setSuccessTokenAddress(tokenAddress);
      setShowSuccess(true);
    },
    setFormError: form.setFormError,
    setIconError: form.setIconError,
    clearErrors: form.clearErrors,
  });

  const handleSubmit = async () => {
    const validationError = validateFormData(form.formData, form.selectedIconFile);
    if (validationError) {
      form.setFormError(validationError);
      return;
    }

    await submission.submit();
  };

  const handleBackToForm = () => {
    setShowSuccess(false);
    setSuccessTokenAddress(null);
  };

  if (submission.isSubmitting) {
    const title = submission.isApproving ? 'Approving transaction' : 'Creating your token';
    const subtitle = 'Just a moment...';

    return (
      <PanelBody className={styles.TokenLauncher}>
        <TokenProcessingTransaction title={title} subtitle={subtitle} />
      </PanelBody>
    );
  }

  if (showSuccess && successTokenAddress) {
    return (
      <PanelBody className={styles.TokenLauncher}>
        <TokenSuccess
          tokenAddress={successTokenAddress}
          onViewToken={() => onViewToken(successTokenAddress)}
          onBackToTokens={handleBackToForm}
        />
      </PanelBody>
    );
  }

  return (
    <PanelBody className={styles.TokenLauncher}>
      <div className={styles.Container}>
        <Header onBack={onBack} />
        <InfoBox />

        <div className={styles.Form}>
          <FormInputs
            formData={form.formData}
            selectedIconFile={form.selectedIconFile}
            iconUploadError={form.iconUploadError}
            isSubmitting={submission.isSubmitting}
            onInputChange={form.handleInputChange}
            onIconFileSelected={form.handleIconFileSelected}
          />

          {form.error && <div className={styles.ErrorMessage}>{form.error}</div>}

          <Button onPress={handleSubmit} disabled={submission.isSubmitting} className={styles.SubmitButton}>
            {submission.isSubmitting ? 'Creating Token...' : 'Launch Token'}
          </Button>
        </div>

        <div className={styles.TokenPreviewContainer}>
          <TokenPreview formData={form.formData} selectedIconFile={form.selectedIconFile} />
        </div>
      </div>
    </PanelBody>
  );
};
