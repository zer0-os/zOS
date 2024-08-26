import { useEffect, useRef, useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Button } from '@zero-tech/zui/components';

import { Key } from '../../../../../lib/keyboard-search';

import styles from './styles.module.scss';

interface CreatePostProps {
  avatarUrl?: string;
  isSubmitting?: boolean;

  onSubmit: (message: string) => void;
}

export const CreatePost = ({ avatarUrl, isSubmitting, onSubmit }: CreatePostProps) => {
  const [value, setValue] = useState('');
  const isDisabled = !value.trim() || isSubmitting;

  const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.shiftKey && event.key === Key.Enter) {
      event.preventDefault();
      handleOnSubmit();
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
      <div className={styles.Avatar}>
        <Avatar imageURL={avatarUrl} size={'regular'} />
      </div>
      <div className={styles.Create}>
        <div className={styles.Input}>
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                className={styles.Loading}
                initial={{ width: 0, opacity: 1 }}
                animate={{ width: '60%', opacity: 1 }}
                exit={{ width: '100%', opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>
          <PostInput value={value} onChange={handleOnChange} onKeyDown={handleKeyDown} />
          <hr />
        </div>
        <div className={styles.Actions}>
          <div className={styles.Media}></div>
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
