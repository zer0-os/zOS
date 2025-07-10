import { MatrixAvatar } from '../../../../components/matrix-avatar';

import styles from './search-result.module.scss';

interface SearchResultProps {
  address: string;
  name: string;
  image: string;
  onClick: () => void;
}

export const SearchResult = ({ address, name, image, onClick }: SearchResultProps) => {
  return (
    <div className={styles.searchResult} onClick={onClick}>
      <div className={styles.searchResultImage}>
        <MatrixAvatar size='regular' imageURL={image} />
      </div>

      <div className={styles.searchResultDetails}>
        <div className={styles.searchResultName}>{name}</div>
        <div className={styles.searchResultAddress}>{address}</div>
      </div>
    </div>
  );
};
