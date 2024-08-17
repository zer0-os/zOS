import { useState } from 'react';

import { Button, IconButton } from '@zero-tech/zui/components';
import { IconCamera1, IconMicrophone2, IconPlus } from '@zero-tech/zui/icons';
import { Input } from '@zero-tech/zui/components/Input/Input';

import styles from './styles.module.scss';

export const CreatePost = () => {
  const [value, setValue] = useState('');

  return (
    <div className={styles.Create}>
      <Input className={styles.Input} placeholder='Write a post' value={value} onChange={setValue} />
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
