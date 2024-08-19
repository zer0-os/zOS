import { useState } from 'react';

import { Button, IconButton } from '@zero-tech/zui/components';
import { IconCamera1, IconMicrophone2, IconPlus } from '@zero-tech/zui/icons';

import styles from './styles.module.scss';

export const CreatePost = () => {
  const [value, setValue] = useState('');

  const handleOnChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  return (
    <div className={styles.Create}>
      <textarea className={styles.Input} placeholder='Write a post' value={value} onChange={handleOnChange} />
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
