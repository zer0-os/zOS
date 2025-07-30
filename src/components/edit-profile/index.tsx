import React, { useState, useMemo, useCallback, ReactNode } from 'react';

import { Alert, Input, Tooltip, SelectInput, LoadingIndicator, AlertProps } from '@zero-tech/zui/components';
import { ImageUpload } from '../../components/image-upload';
import { IconUpload2, IconHelpCircle, IconCheck } from '@zero-tech/zui/icons';
import { State as EditProfileState } from '../../store/edit-profile';
import { PanelHeader } from '../messenger/list/panel-header';
import { Button, Variant as ButtonVariant } from '@zero-tech/zui/components/Button';
import { ScrollbarContainer } from '../scrollbar-container';

import { bem } from '../../lib/bem';
import './styles.scss';
import { useMatrixImage } from '../../lib/hooks/useMatrixImage';

const c = bem('edit-profile');

export interface Properties {
  editProfileState: EditProfileState;
  errors: {
    image?: string;
    name?: string;
    general?: string;
  };
  currentDisplayName: string;
  currentPrimaryZID: string;
  currentProfileImage: string;
  ownedZIDs: string[];
  loadingZIDs: boolean;
  onEdit: (data: { name: string; image: File | null; primaryZID: string }) => void;
  onClose?: () => void;
}

export const EditProfile: React.FC<Properties> = ({
  editProfileState,
  errors,
  currentDisplayName,
  currentPrimaryZID,
  currentProfileImage,
  ownedZIDs,
  loadingZIDs,
  onEdit,
  onClose,
}) => {
  const [name, setName] = useState(currentDisplayName);
  const [primaryZID, setPrimaryZID] = useState(currentPrimaryZID);
  const [image, setImage] = useState<File | null>(null);
  const { data: imageUrl } = useMatrixImage(currentProfileImage);

  const handleEdit = useCallback(() => {
    onEdit({
      name: name,
      image: image,
      primaryZID: primaryZID === 'None (wallet address)' ? '' : primaryZID,
    });
  }, [
    name,
    image,
    primaryZID,
    onEdit,
  ]);

  const trackName = useCallback((value: string) => setName(value), []);
  const trackImage = useCallback((img: File | null) => setImage(img), []);
  const trackPrimaryZID = useCallback((value: string) => setPrimaryZID(value), []);

  const isValid = useMemo(() => name.trim().length > 0, [name]);

  const nameError = useMemo<{ variant: AlertProps['variant']; text: ReactNode } | null>(() => {
    if (!isValid) {
      return { variant: 'error', text: 'name cannot be empty' };
    }
    return null;
  }, [isValid]);

  const generalError = errors.general;
  const imageError = errors.image;
  const isLoading = editProfileState === EditProfileState.INPROGRESS;
  const changesSaved = editProfileState === EditProfileState.SUCCESS;

  const isDisabled = useMemo(() => {
    return (
      !!nameError || isLoading || (name === currentDisplayName && image === null && primaryZID === currentPrimaryZID)
    );
  }, [
    nameError,
    isLoading,
    name,
    currentDisplayName,
    image,
    primaryZID,
    currentPrimaryZID,
  ]);

  const renderImageUploadIcon = useCallback((): JSX.Element => <IconUpload2 isFilled={true} />, []);

  const renderZeroIDLabel = useCallback(
    (): JSX.Element => (
      <div className={c('primary-zid-lable')}>
        Primary ZERO ID
        <Tooltip content='Your primary ZERO ID is displayed with your username and other members can find you by searching for it.'>
          <div className={c('info-tooltip')}>
            <IconHelpCircle size={16} />
          </div>
        </Tooltip>
      </div>
    ),
    []
  );

  const renderOwnedZIDItem = useCallback((label: string, icon: JSX.Element | null = null) => {
    return (
      <div className={c('zid-menu-item-option')}>
        <div className={c('zid-menu-item-option-label')}>{label}</div> {icon}
      </div>
    );
  }, []);

  const getNoneOption = useCallback(() => {
    return {
      id: 'None (wallet address)',
      label: renderOwnedZIDItem('None (wallet address)'),
      onSelect: () => trackPrimaryZID('None (wallet address)'),
    };
  }, [renderOwnedZIDItem, trackPrimaryZID]);

  const renderLoadingState = useCallback(() => {
    return [
      {
        id: 'Fetching ZERO IDs',
        label: renderOwnedZIDItem(
          'Fetching ZERO IDs',
          <LoadingIndicator className={c('zid-menu-item-option-loading-spinner')} />
        ),
        onSelect: () => {},
      },
    ];
  }, [renderOwnedZIDItem]);

  const menuItems = useMemo(() => {
    if (loadingZIDs) {
      return renderLoadingState();
    }

    const options = [];
    if (currentPrimaryZID) {
      options.push({
        id: currentPrimaryZID,
        label: renderOwnedZIDItem(
          currentPrimaryZID,
          <IconCheck className={c('zid-menu-item-option-icon')} size={24} />
        ),
        onSelect: () => trackPrimaryZID(currentPrimaryZID),
      });
    }

    for (const zid of ownedZIDs) {
      if (zid === currentPrimaryZID) continue;

      options.push({
        id: zid,
        label: renderOwnedZIDItem(zid),
        onSelect: () => trackPrimaryZID(zid),
      });
    }

    if (currentPrimaryZID) {
      options.push(getNoneOption());
    }
    return options;
  }, [
    loadingZIDs,
    currentPrimaryZID,
    ownedZIDs,
    renderLoadingState,
    renderOwnedZIDItem,
    trackPrimaryZID,
    getNoneOption,
  ]);

  return (
    <div className={c('')}>
      <div className={c('header-container')}>
        <PanelHeader title='Edit Profile' onBack={onClose} />
      </div>

      <ScrollbarContainer variant='on-hover'>
        <div className={c('content-wrapper')}>
          <div className={c('body')}>
            <ImageUpload
              className={c('image-upload')}
              onChange={trackImage}
              icon={renderImageUploadIcon()}
              uploadText='Select or drag and drop'
              isError={Boolean(errors.image)}
              errorMessage={errors.image}
              imageSrc={imageUrl}
            />
            <Input
              label='Display Name'
              name='name'
              value={name}
              onChange={trackName}
              error={!!nameError}
              alert={nameError}
              className={c('body-input')}
            />
            <div className={c('select-input')}>
              {renderZeroIDLabel()}
              <SelectInput
                items={menuItems}
                label=''
                placeholder={currentPrimaryZID || 'None (wallet address)'}
                value={primaryZID || ''}
                itemSize='spacious'
                menuClassName={c('zid-select-menu')}
              />
            </div>
          </div>
          {imageError && (
            <Alert className={c('alert-small')} variant='error'>
              <div className={c('alert-text')}>{imageError}</div>
            </Alert>
          )}
          {generalError && (
            <Alert className={c('alert-small')} variant='error'>
              <div className={c('alert-text')}>{generalError}</div>
            </Alert>
          )}

          {changesSaved && (
            <Alert className={c('alert-small')} variant='success'>
              <div className={c('alert-text')}>Changes saved successfully</div>
            </Alert>
          )}

          <div className={c('footer')}>
            <Button
              isLoading={isLoading}
              isSubmit
              isDisabled={isDisabled}
              onPress={handleEdit}
              variant={ButtonVariant.Secondary}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </ScrollbarContainer>
    </div>
  );
};
