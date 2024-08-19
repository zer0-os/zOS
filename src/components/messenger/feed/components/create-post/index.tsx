import { useEffect, useRef, useState } from 'react';

import { Button, IconButton } from '@zero-tech/zui/components';
import { IconCamera1, IconPlus, IconMicrophone2 } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

export const CreatePost = () => {
  const [value, setValue] = useState('');

  const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className={styles.Create}>
      <PostInput value={value} onChange={handleOnChange} />
      <hr />
      <div className={styles.Actions}>
        <div className={styles.Media}>
          <IconButton Icon={IconPlus} onClick={() => {}} />
          <IconButton Icon={IconCamera1} onClick={() => {}} />
          <IconButton Icon={IconMicrophone2} onClick={() => {}} />
        </div>
        <Button className={styles.Button}>Create</Button>
      </div>
    </div>
  );
};

interface PostInputProps {
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value: string;
}

const PostInput = ({ onChange, value }: PostInputProps) => {
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
      placeholder='Write a post'
      ref={ref}
      rows={2}
      value={value}
    />
  );
};
