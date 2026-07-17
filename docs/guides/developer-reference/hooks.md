# zOS Custom Hooks Reference

This reference documents all custom React hooks available in zOS. These hooks provide powerful abstractions for common patterns and are essential for building features efficiently.

## Table of Contents
- [useMatrixMedia](#usematrixmedia) - Handle Matrix media with encryption
- [useMatrixImage](#usematriximage) - Optimized image handling
- [useDebounce](#usedebounce) - Debounce values and callbacks
- [useLinkPreview](#uselinkpreview) - Generate link previews
- [useScrollPosition](#usescrollposition) - Track scroll position
- [usePrevious](#useprevious) - Access previous render values
- [useUserWallets](#useuserwallets) - Manage user Web3 wallets
- [useOwnedZids](#useownedzids) - Track user's Zer0 IDs

---

## useMatrixMedia

Handles Matrix media content with automatic encryption/decryption and caching.

### Import
```typescript
import { useMatrixMedia } from '@/lib/hooks/useMatrixMedia';
```

### Basic Usage
```typescript
function MediaDisplay({ media }) {
  const { data: mediaUrl, isPending, isError } = useMatrixMedia({
    url: media.url,
    type: MediaType.Image,
    name: media.name
  });

  if (isPending) return <LoadingSpinner />;
  if (isError) return <ErrorIcon />;
  
  return <img src={mediaUrl} alt={media.name} />;
}
```

### Advanced Usage - Encrypted Files
```typescript
function EncryptedDocument({ encryptedFile }) {
  const { data: fileUrl, isPending } = useMatrixMedia({
    file: {
      url: encryptedFile.url,
      key: encryptedFile.key,
      iv: encryptedFile.iv,
      hashes: encryptedFile.hashes
    },
    type: MediaType.File,
    mimetype: 'application/pdf'
  });

  return fileUrl ? (
    <a href={fileUrl} download>Download PDF</a>
  ) : (
    <span>Decrypting...</span>
  );
}
```

### Thumbnail Support
```typescript
function ImageThumbnail({ image }) {
  const { data: thumbnailUrl } = useMatrixMedia(
    { url: image.url, type: MediaType.Image },
    { isThumbnail: true }
  );
  
  return <img src={thumbnailUrl} className="thumbnail" />;
}
```

### TypeScript Interface
```typescript
interface UseMatrixMediaOptions {
  isThumbnail?: boolean;
}

interface Media {
  url?: string;
  file?: EncryptedFile;
  type: MediaType;
  name?: string;
  mimetype?: string;
  width?: number;
  height?: number;
}

function useMatrixMedia(
  media: Media | undefined,
  options?: UseMatrixMediaOptions
): {
  data: string | null;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
}
```

### Performance Tips
- Cached for 24 hours automatically
- Requests are deduplicated
- Use thumbnails for large images
- Handle loading states to prevent UI flicker

---

## useMatrixImage

Specialized hook for Matrix images with optimized handling.

### Import
```typescript
import { useMatrixImage } from '@/lib/hooks/useMatrixImage';
```

### Usage
```typescript
function UserAvatar({ user }) {
  const imageUrl = useMatrixImage(user.avatarUrl);
  
  return (
    <img 
      src={imageUrl || '/default-avatar.png'} 
      alt={user.name}
      className="avatar"
    />
  );
}
```

### With Size Options
```typescript
function ProfileBanner({ bannerUrl }) {
  const imageUrl = useMatrixImage(bannerUrl, {
    width: 1200,
    height: 400,
    method: 'scale'
  });
  
  return <div style={{ backgroundImage: `url(${imageUrl})` }} />;
}
```

### TypeScript Interface
```typescript
interface ImageOptions {
  width?: number;
  height?: number;
  method?: 'crop' | 'scale';
}

function useMatrixImage(
  mxcUrl: string | undefined,
  options?: ImageOptions
): string | null
```

---

## useDebounce

Debounces values or callbacks to limit update frequency.

### Import
```typescript
import { useDebounce } from '@/lib/hooks/useDebounce';
```

### Debounce Values
```typescript
function SearchInput() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  useEffect(() => {
    if (debouncedSearch) {
      // Perform search API call
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);
  
  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Debounce Callbacks
```typescript
function AutoSaveEditor({ onSave }) {
  const [content, setContent] = useState('');
  
  const debouncedSave = useDebounce(() => {
    onSave(content);
  }, 1000);
  
  const handleChange = (newContent) => {
    setContent(newContent);
    debouncedSave();
  };
  
  return <Editor value={content} onChange={handleChange} />;
}
```

### TypeScript Interface
```typescript
function useDebounce<T>(value: T, delay: number): T
```

---

## useLinkPreview

Generates rich link previews for URLs.

### Import
```typescript
import { useLinkPreview } from '@/lib/hooks/useLinkPreview';
```

### Usage
```typescript
function LinkCard({ url }) {
  const { preview, loading, error } = useLinkPreview(url);
  
  if (loading) return <SkeletonCard />;
  if (error || !preview) return <SimpleLink href={url} />;
  
  return (
    <div className="link-preview">
      <img src={preview.image} alt="" />
      <div>
        <h3>{preview.title}</h3>
        <p>{preview.description}</p>
        <span>{preview.site_name}</span>
      </div>
    </div>
  );
}
```

### TypeScript Interface
```typescript
interface LinkPreview {
  title: string;
  description: string;
  image: string;
  site_name: string;
  url: string;
}

function useLinkPreview(url: string): {
  preview: LinkPreview | null;
  loading: boolean;
  error: Error | null;
}
```

---

## useScrollPosition

Tracks scroll position with performance optimization.

### Import
```typescript
import { useScrollPosition } from '@/lib/hooks/useScrollPosition';
```

### Basic Usage
```typescript
function ScrollIndicator() {
  const { scrollY, scrollDirection } = useScrollPosition();
  
  return (
    <div className={`header ${scrollDirection === 'down' ? 'hidden' : ''}`}>
      <div className="progress" style={{ width: `${scrollY}%` }} />
    </div>
  );
}
```

### With Threshold
```typescript
function BackToTop() {
  const { scrollY } = useScrollPosition({ threshold: 100 });
  const showButton = scrollY > 300;
  
  return showButton ? (
    <button onClick={() => window.scrollTo(0, 0)}>
      Back to Top
    </button>
  ) : null;
}
```

### TypeScript Interface
```typescript
interface ScrollPositionOptions {
  threshold?: number;
  delay?: number;
}

function useScrollPosition(options?: ScrollPositionOptions): {
  scrollY: number;
  scrollX: number;
  scrollDirection: 'up' | 'down' | null;
}
```

---

## usePrevious

Access the previous value of a prop or state.

### Import
```typescript
import { usePrevious } from '@/lib/hooks/usePrevious';
```

### Usage
```typescript
function Counter({ count }) {
  const prevCount = usePrevious(count);
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount ?? 'N/A'}</p>
      <p>Change: {count - (prevCount ?? 0)}</p>
    </div>
  );
}
```

### Animation Example
```typescript
function AnimatedValue({ value }) {
  const prevValue = usePrevious(value);
  const isIncreasing = prevValue !== undefined && value > prevValue;
  
  return (
    <span className={isIncreasing ? 'pulse-green' : 'pulse-red'}>
      {value}
    </span>
  );
}
```

### TypeScript Interface
```typescript
function usePrevious<T>(value: T): T | undefined
```

---

## useUserWallets

Manages user's Web3 wallets and addresses.

### Import
```typescript
import { useUserWallets } from '@/lib/hooks/useUserWallets';
```

### Usage
```typescript
function WalletList() {
  const { wallets, loading, primaryWallet } = useUserWallets();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <h3>Your Wallets</h3>
      {wallets.map(wallet => (
        <WalletItem 
          key={wallet.address}
          wallet={wallet}
          isPrimary={wallet.address === primaryWallet?.address}
        />
      ))}
    </div>
  );
}
```

### TypeScript Interface
```typescript
interface Wallet {
  address: string;
  publicAddress: string;
  type: 'metamask' | 'walletconnect' | 'coinbase';
}

function useUserWallets(): {
  wallets: Wallet[];
  primaryWallet: Wallet | null;
  loading: boolean;
  error: Error | null;
}
```

---

## useOwnedZids

Tracks user's owned Zer0 IDs (zIDs).

### Import
```typescript
import { useOwnedZids } from '@/lib/hooks/useOwnedZids';
```

### Usage
```typescript
function ZidSelector() {
  const { zids, loading, activeZid, setActiveZid } = useOwnedZids();
  
  return (
    <select 
      value={activeZid?.id} 
      onChange={(e) => setActiveZid(e.target.value)}
      disabled={loading}
    >
      <option value="">Select a zID</option>
      {zids.map(zid => (
        <option key={zid.id} value={zid.id}>
          {zid.name} ({zid.domain})
        </option>
      ))}
    </select>
  );
}
```

### TypeScript Interface
```typescript
interface Zid {
  id: string;
  name: string;
  domain: string;
  owner: string;
}

function useOwnedZids(): {
  zids: Zid[];
  activeZid: Zid | null;
  setActiveZid: (id: string) => void;
  loading: boolean;
  error: Error | null;
}
```

---

## Best Practices

### 1. Handle Loading States
```typescript
const { data, isPending } = useHook();
if (isPending) return <LoadingComponent />;
```

### 2. Handle Errors Gracefully
```typescript
const { data, error } = useHook();
if (error) return <ErrorFallback error={error} />;
```

### 3. Use TypeScript
```typescript
// Leverage type inference
const result = useHook<ExpectedType>(params);
```

### 4. Memoize Dependencies
```typescript
const options = useMemo(() => ({
  width: 200,
  height: 200
}), []);

const result = useHook(url, options);
```

### 5. Clean Up Effects
```typescript
useEffect(() => {
  const cleanup = hookWithCleanup();
  return cleanup;
}, []);
```

## Performance Considerations

- **useDebounce**: Essential for search inputs and auto-save
- **useScrollPosition**: Throttled by default for performance
- **useMatrixMedia**: Caches results for 24 hours
- **useLinkPreview**: Caches preview data to avoid repeated fetches

## Integration Tips for Haven Protocol

These hooks provide patterns that will be valuable for Haven Protocol:
- **useMatrixMedia**: Handle encrypted artist media and NFT assets
- **useLinkPreview**: Rich previews for artist portfolios
- **useUserWallets**: Multi-wallet support for creators
- **useDebounce**: Optimize real-time features in creator tools

---

*This documentation is part of the zOS developer reference. For contribution guidelines, see the [Contribution Guide](/opusdocs/new-recruits/contribution-guide.md).*