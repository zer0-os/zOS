import { Input } from '@zero-tech/zui/components';
import { SearchResult } from '../components/search-result';
import { getHistory } from '../../../../lib/browser';
import { SendHeader } from '../components/send-header';
import { nextStage, reset, setRecipient } from '../../../../store/wallet';
import { useSearchRecipientsQuery } from '../../queries/useSearchRecipientsQuery';
import { useMemo, useState } from 'react';
import { isAddress } from 'ethers/lib/utils';
import { useDebounce } from '../../../../lib/hooks/useDebounce';
import { useDispatch } from 'react-redux';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { Recipient } from '../../types';

import styles from './wallet-user-search.module.scss';

const history = getHistory();

export const WalletUserSearch = () => {
  const [recipientQuery, setRecipientQuery] = useState('');
  const isAddressValid = useMemo(() => {
    return isAddress(recipientQuery);
  }, [recipientQuery]);
  const debouncedrecipientQuery = useDebounce(recipientQuery, 250);

  const dispatch = useDispatch();

  const { data: recipients } = useSearchRecipientsQuery(debouncedrecipientQuery);

  const handleResultClick = (recipient: Recipient) => {
    dispatch(setRecipient(recipient));
    dispatch(nextStage());
  };

  const handleBack = () => {
    dispatch(reset());
    history.push('/wallet');
  };

  return (
    <div className={styles.container}>
      <SendHeader title='Send' onBack={handleBack} />

      <div className={styles.content}>
        <div className={styles.inputContainer}>
          <Input
            type='text'
            placeholder='Name, ZNS, or Address'
            value={recipientQuery}
            onChange={setRecipientQuery}
            startEnhancer={<span>To:</span>}
            endEnhancer={<IconSearchMd size={16} />}
            autoFocus
          />
        </div>

        <div className={styles.resultsContainer}>
          <div className={styles.resultsHeader}>
            {(recipients?.length > 0 || isAddressValid) && <div className={styles.resultsHeaderLabel}>Results</div>}
            <div>
              {isAddressValid && recipients?.length === 0 && (
                <SearchResult
                  address={recipientQuery}
                  name=''
                  image=''
                  onClick={() =>
                    handleResultClick({
                      userId: '',
                      matrixId: '',
                      publicAddress: recipientQuery,
                      name: '',
                      profileImage: '',
                      primaryZid: null,
                    })
                  }
                />
              )}
              {recipients?.map((recipient) => (
                <SearchResult
                  key={recipient.userId}
                  address={recipient.publicAddress}
                  name={recipient.name}
                  image={recipient.profileImage}
                  onClick={() => {
                    handleResultClick(recipient);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
