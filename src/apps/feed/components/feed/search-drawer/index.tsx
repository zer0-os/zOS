import { useState, useRef, useEffect } from 'react';
import { IconButton, Input } from '@zero-tech/zui/components';
import { IconSearchMd } from '@zero-tech/zui/icons';
import { MatrixAvatar } from '../../../../../components/matrix-avatar';
import { ProfileLinkNavigation } from '../../../../../components/profile-link-navigation';
import styles from './styles.module.scss';

interface SearchDrawerProps {
  searchResults: any[];
  isSearching: boolean;
  searchValue: string;
  onSearch: (value: string) => void;
}

export const SearchDrawer = ({ searchResults, isSearching, searchValue, onSearch }: SearchDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSearch]);

  const handleSearchChange = (value: string) => {
    onSearch(value);
  };

  const handleToggleDrawer = () => {
    if (isOpen) {
      onSearch('');
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.Container} ref={containerRef}>
      <IconButton Icon={IconSearchMd} size={24} onClick={handleToggleDrawer} />
      <div className={`${styles.Drawer} ${isOpen ? styles.DrawerOpen : ''}`}>
        {isOpen && (
          <div className={styles.InputContainer}>
            <Input
              className={styles.Input}
              size={'small'}
              type={'search'}
              placeholder='Search users...'
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
        )}
      </div>
      {isOpen && searchValue && (isSearching || searchResults.length > 0) && (
        <div className={styles.SearchResults}>
          {isSearching ? (
            <div className={styles.SearchLoading}>Searching...</div>
          ) : (
            searchResults.map((user) => (
              <ProfileLinkNavigation
                key={user.id}
                primaryZid={user?.primaryZID}
                thirdWebAddress={user?.thirdWebWalletAddress}
              >
                <div className={styles.SearchResultItem}>
                  <MatrixAvatar size='small' imageURL={user.profileImage} />
                  <div className={styles.UserInfo}>
                    <span className={styles.UserName}>{user.name}</span>
                    {user?.primaryZID && <span className={styles.UserHandle}>{user.primaryZID}</span>}
                  </div>
                </div>
              </ProfileLinkNavigation>
            ))
          )}
        </div>
      )}
    </div>
  );
};
