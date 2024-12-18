import React from 'react';
import { Modal } from '../modal';
import { bemClassName } from '../../lib/bem';
import { IconAlertCircle } from '@zero-tech/zui/icons';

import './styles.scss';

const cn = bemClassName('attachment-preview-modal');

const PREVIEWABLE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/json',
];

interface Props {
  attachment: {
    name: string;
    url: string;
    mimetype?: string;
  };
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<Props> = ({ attachment, onClose }) => {
  const fileType = attachment.mimetype;
  const canPreview = PREVIEWABLE_TYPES.includes(fileType);

  return (
    <Modal onClose={onClose} title={canPreview ? 'File Preview' : 'Download File'}>
      <div {...cn()}>
        {canPreview ? (
          <iframe src={attachment.url} {...cn('preview')} title={attachment.name} />
        ) : (
          <div {...cn('alert')}>
            <IconAlertCircle size={24} />
            <p>Preview not available for this file type</p>
          </div>
        )}
        <div {...cn('info')}>
          <p>{attachment.name}</p>
        </div>
      </div>
    </Modal>
  );
};
