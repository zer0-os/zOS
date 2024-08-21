import { useEffect, useRef, useState } from 'react';

import { Avatar, Button, IconButton } from '@zero-tech/zui/components';
import { IconCamera1, IconPlus, IconMicrophone2 } from '@zero-tech/zui/icons';

import { Key } from '../../../../../lib/keyboard-search';

import styles from './styles.module.scss';

interface CreatePostProps {
  isSubmitting?: boolean;

  onSubmit: (message: string) => void;
}

export const CreatePost = ({ isSubmitting, onSubmit }: CreatePostProps) => {
  const [value, setValue] = useState('');
  const isDisabled = !value.trim() || isSubmitting;

  const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.shiftKey && event.key === Key.Enter && value.trim()) {
      event.preventDefault();
      onSubmit(value);
      setValue('');
    }
  };

  const handleOnSubmit = () => {
    if (value.trim()) {
      onSubmit(value);
      setValue('');
    }
  };

  return (
    <div className={styles.Container}>
      <Avatar size={'regular'} />
      <div className={styles.Create}>
        <PostInput value={value} onChange={handleOnChange} onKeyDown={handleKeyDown} />
        <hr />
        <div className={styles.Actions}>
          <div className={styles.Media}>
            <IconButton Icon={IconPlus} onClick={() => {}} />
            <IconButton Icon={IconCamera1} onClick={() => {}} />
            <IconButton Icon={IconMicrophone2} onClick={() => {}} />
          </div>
          <Button isDisabled={isDisabled} isLoading={isSubmitting} className={styles.Button} onPress={handleOnSubmit}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};

interface PostInputProps {
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  value: string;
}

const PostInput = ({ onChange, onKeyDown, value }: PostInputProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = `${ref.current.scrollHeight}px`;

      // Auto-resize on input
      ref.current.addEventListener('input', () => {
        ref.current.style.height = 'auto';
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      });
    }
  }, []);

  return (
    <textarea
      className={styles.Input}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder='Write a post'
      ref={ref}
      rows={2}
      value={value}
    />
  );
};
