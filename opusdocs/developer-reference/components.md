# zOS Component Library Reference

This reference documents the key React components in zOS. All components are TypeScript-based and follow modern React patterns.

## Avatar Component

**Location:** `/src/components/avatar/index.tsx`

A flexible avatar component that displays user profile images with fallback icons, status indicators, and badge support.

### TypeScript Interface

```typescript
export interface AvatarProps {
  imageURL?: string;
  size: 'extra small' | 'small' | 'regular' | 'medium';
  badgeContent?: string;
  statusType?: 'active' | 'idle' | 'busy' | 'offline' | 'unread';
  isActive?: boolean;
  isRaised?: boolean;
  tabIndex?: number;
  isGroup?: boolean;
}
```

### Basic Usage

```tsx
import { Avatar } from '@/components/avatar';

// Simple avatar with image
<Avatar
  size="regular"
  imageURL="https://example.com/avatar.jpg"
/>

// Avatar with status indicator
<Avatar
  size="regular"
  imageURL="https://example.com/avatar.jpg"
  statusType="active"
/>

// Group avatar with badge
<Avatar
  size="medium"
  isGroup={true}
  badgeContent="5"
/>
```

### Advanced Usage

```tsx
// Interactive avatar with all features
<Avatar
  size="regular"
  imageURL="https://example.com/avatar.jpg"
  statusType="active"
  badgeContent="3"
  isActive={true}
  isRaised={true}
  tabIndex={0}
/>

// Fallback avatar (no image provided)
<Avatar
  size="regular"
  statusType="offline"
  isGroup={false}
/>
```

### Features

- **Image Loading:** Graceful fallback to default icons when image fails to load
- **Status Indicators:** Visual status dots for online presence
- **Badges:** Notification badges for unread counts
- **Accessibility:** Proper tabIndex support for keyboard navigation
- **Group Support:** Special styling and icons for group avatars
- **Performance:** Memoized rendering for optimal performance

### Size Chart

| Size | Icon Size | Use Case |
|------|-----------|----------|
| extra small | 12px | Compact lists, mentions |
| small | 16px | Message threads, notifications |
| regular | 24px | Standard UI elements |
| medium | 16px | Profile cards, headers |

## Modal Component

**Location:** `/src/components/modal/index.tsx`

A flexible modal dialog component built on zUI with customizable actions and styling.

### TypeScript Interface

```typescript
export interface Properties {
  className?: string;
  children?: React.ReactNode;
  title: string;
  primaryText?: string;
  primaryVariant?: Variant;
  primaryColor?: Color;
  primaryDisabled?: boolean;
  secondaryText?: string;
  secondaryVariant?: Variant;
  secondaryColor?: Color;
  secondaryDisabled?: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onPrimary?: () => void;
  onSecondary?: () => void;
}

export enum Variant {
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum Color {
  Red = 'red',
  Greyscale = 'greyscale',
  Highlight = 'highlight',
}
```

### Basic Usage

```tsx
import { Modal } from '@/components/modal';

// Simple confirmation modal
<Modal
  title="Confirm Action"
  primaryText="Confirm"
  secondaryText="Cancel"
  onClose={handleClose}
  onPrimary={handleConfirm}
  onSecondary={handleClose}
>
  <p>Are you sure you want to perform this action?</p>
</Modal>
```

### Advanced Usage

```tsx
// Complex modal with custom styling and processing state
<Modal
  title="Delete Account"
  className="danger-modal"
  primaryText="Delete"
  primaryColor={Color.Red}
  primaryVariant={Variant.Primary}
  secondaryText="Cancel"
  secondaryColor={Color.Greyscale}
  isProcessing={isDeleting}
  primaryDisabled={!canDelete}
  onClose={handleClose}
  onPrimary={handleDelete}
  onSecondary={handleClose}
>
  <div className="warning-content">
    <h4>This action cannot be undone</h4>
    <p>All your data will be permanently deleted.</p>
    <input
      type="text"
      placeholder="Type 'DELETE' to confirm"
      onChange={handleConfirmationInput}
    />
  </div>
</Modal>
```

### Features

- **Automatic Focus Management:** Built on Radix UI for accessibility
- **Keyboard Navigation:** ESC to close, proper focus trapping
- **Loading States:** Built-in processing indicators
- **Flexible Actions:** Support for primary and secondary actions
- **Custom Styling:** Full className and variant support
- **Pointer Events Fix:** Handles Radix UI pointer event issues

### Common Patterns

```tsx
// Information modal (no actions)
<Modal title="Information" onClose={handleClose}>
  <p>This is an informational message.</p>
</Modal>

// Processing modal
<Modal
  title="Saving Changes"
  isProcessing={true}
  primaryDisabled={true}
  onClose={handleClose}
>
  <p>Please wait while we save your changes...</p>
</Modal>
```

## Button Components

### FollowButton Component

**Location:** `/src/components/follow-button/index.tsx`

An animated button for following/unfollowing users with loading states.

#### TypeScript Interface

```typescript
interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}
```

#### Usage

```tsx
import { FollowButton } from '@/components/follow-button';

// Basic follow button
<FollowButton targetUserId="user123" />

// With custom styling
<FollowButton
  targetUserId="user123"
  className="custom-follow-btn"
/>
```

#### Features

- **Smooth Animations:** Framer Motion transitions
- **Loading States:** Skeleton loading indicators
- **Hover Effects:** Scale animation on hover
- **State Management:** Integrated with follow/unfollow logic

### Wallet Button Component

**Location:** `/src/apps/wallet/components/button/button.tsx`

A general-purpose button component for wallet-related actions.

#### TypeScript Interface

```typescript
interface ButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}
```

#### Usage

```tsx
import { Button } from '@/apps/wallet/components/button/button';
import { IconWallet } from '@zero-tech/zui/icons';

// Basic button
<Button onClick={handleClick}>
  Connect Wallet
</Button>

// Button with icon
<Button
  onClick={handleConnect}
  icon={<IconWallet />}
  variant="primary"
>
  Connect Wallet
</Button>

// Disabled state
<Button
  onClick={handleClick}
  disabled={isConnecting}
  variant="secondary"
>
  {isConnecting ? 'Connecting...' : 'Connect'}
</Button>
```

## ProfileCard Component

**Location:** `/src/components/profile-card/index.tsx`

A comprehensive user profile card with avatar, follow actions, and user statistics.

### TypeScript Interface

```typescript
export interface ProfileCardProps {
  userId: string;
}
```

### Usage

```tsx
import { ProfileCard } from '@/components/profile-card';

// Basic profile card
<ProfileCard userId="user123" />
```

### Features

- **Matrix Avatar Integration:** Uses MatrixAvatar component
- **Follow/Unfollow Actions:** Integrated follow button
- **Chat Integration:** Direct message button
- **Zero Pro Badge:** Shows subscription status
- **Follower/Following Counts:** Live statistics
- **Loading States:** Skeleton text during data fetch
- **Own Profile Detection:** Hides actions for current user

### Integrated Components

The ProfileCard uses several sub-components:
- `MatrixAvatar` for profile images
- `ZeroProBadge` for subscription indicators
- `SkeletonText` for loading states
- zUI `Button` and `IconButton` components

## Tooltip Component

**Location:** `/src/components/tooltip/index.tsx`

A wrapper around rc-tooltip for consistent tooltip behavior across the app.

### TypeScript Interface

```typescript
export interface Properties extends TooltipProps {
  className?: string;
}
```

### Usage

```tsx
import Tooltip from '@/components/tooltip';

// Basic tooltip
<Tooltip overlay="This is a tooltip">
  <button>Hover me</button>
</Tooltip>

// Custom positioning
<Tooltip
  overlay="Custom tooltip"
  placement="topLeft"
  className="custom-tooltip"
>
  <div>Hover target</div>
</Tooltip>
```

### Features

- **Conditional Rendering:** Only shows when overlay content exists
- **Custom Delays:** Optimized enter/leave delays
- **Auto Cleanup:** Destroys tooltip on hide for performance
- **Full rc-tooltip API:** Supports all rc-tooltip properties

## Lightbox Component

**Location:** `/src/components/lightbox/index.tsx`

A full-screen image viewer with navigation, download, and copy functionality.

### TypeScript Interface

```typescript
export interface LightboxProps {
  items: Media[];
  startingIndex?: number;
  hasActions?: boolean;
  onClose?: (e?: React.MouseEvent) => void;
  provider: {
    fitWithinBox: (media: any) => any;
    getSource: (options: { src: string; options: any }) => string;
  };
}
```

### Usage

```tsx
import { Lightbox } from '@/components/lightbox';

const mediaItems = [
  { type: 'image', url: 'image1.jpg', name: 'Image 1' },
  { type: 'image', url: 'image2.jpg', name: 'Image 2' },
];

// Basic lightbox
<Lightbox
  items={mediaItems}
  onClose={handleClose}
  provider={imageProvider}
/>

// Start at specific image
<Lightbox
  items={mediaItems}
  startingIndex={1}
  hasActions={true}
  onClose={handleClose}
  provider={imageProvider}
/>
```

### Features

- **Keyboard Navigation:** Arrow keys for navigation, ESC to close
- **Image Actions:** Copy to clipboard, download functionality
- **GIF Support:** Special handling for animated GIFs
- **Responsive Design:** Adapts to different screen sizes
- **Canvas Fallback:** Fallback copy method for compatibility

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← | Previous image |
| → | Next image |
| ESC | Close lightbox |

## HoverCard Component

**Location:** `/src/components/hover-card/index.tsx`

A hover-triggered card component built on Radix UI primitives.

### TypeScript Interface

```typescript
export interface ZeroProBadgeProps {
  className?: string;
  iconTrigger: React.ReactNode;
  content: React.ReactNode;
  onClick?: () => void;
}
```

### Usage

```tsx
import { HoverCard } from '@/components/hover-card';

// Basic hover card
<HoverCard
  iconTrigger={<IconInfo />}
  content={<div>Additional information</div>}
/>

// With click handler
<HoverCard
  iconTrigger={<IconHelp />}
  content={<div>Help content</div>}
  onClick={handleHelpClick}
  className="help-hover-card"
/>
```

### Features

- **Radix UI Integration:** Built on reliable primitives
- **Click Support:** Optional click handling
- **Portal Rendering:** Renders outside DOM hierarchy
- **Customizable Delays:** Quick hover response
- **Arrow Indicator:** Visual connection to trigger

## LoadingScreen Component

**Location:** `/src/components/loading-screen/index.tsx`

A full-screen loading component with progress indication and contextual messages.

### TypeScript Interface

```typescript
interface Properties {
  progress: number;
}
```

### Usage

```tsx
import { LoadingScreenContainer } from '@/components/loading-screen';

// Connected to Redux state
<LoadingScreenContainer />
```

### Features

- **Progress Visualization:** Animated progress bar
- **Contextual Messages:** Different messages based on progress
- **Redux Integration:** Automatically connected to chat loading state
- **Visual Polish:** Progress bar appears full at 90% for UX

## ErrorBoundary Component

**Location:** `/src/components/error-boundary/index.tsx`

A Sentry-integrated error boundary for graceful error handling.

### TypeScript Interface

```typescript
export interface Properties {
  children: any;
  boundary: string;
}
```

### Usage

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

// Wrap components that might error
<ErrorBoundary boundary="user-profile">
  <UserProfileComponent />
</ErrorBoundary>

// App-level error boundary
<ErrorBoundary boundary="main-app">
  <App />
</ErrorBoundary>
```

### Features

- **Sentry Integration:** Automatic error reporting
- **Context Tagging:** Application boundary and name tags
- **Route Detection:** Automatic app detection from pathname
- **Graceful Degradation:** Prevents entire app crashes

## Performance Tips

1. **Avatar Component:** Images are lazy-loaded with fallbacks
2. **Modal Component:** Uses React.memo for re-render optimization
3. **Lightbox Component:** Keyboard event cleanup prevents memory leaks
4. **ProfileCard Component:** Skeleton loading improves perceived performance
5. **All Components:** TypeScript provides compile-time optimization

## Common Patterns

### Loading States

```tsx
// Using skeleton loading
<SkeletonText asyncText={{ text: userName, isLoading }} />

// Using conditional rendering
{isLoading ? <Skeleton /> : <ActualContent />}
```

### Error Handling

```tsx
// Wrap error-prone components
<ErrorBoundary boundary="feature-name">
  <FeatureComponent />
</ErrorBoundary>
```

### Modal Patterns

```tsx
// Controlled modal state
const [isOpen, setIsOpen] = useState(false);

{isOpen && (
  <Modal
    title="Dialog Title"
    onClose={() => setIsOpen(false)}
    onPrimary={handleAction}
  >
    <ModalContent />
  </Modal>
)}
```

### Responsive Components

```tsx
// Using CSS modules with responsive classes
<div className={`${styles.Container} ${isMobile ? styles.Mobile : ''}`}>
  <ResponsiveContent />
</div>
```

This reference covers the most commonly used components in the zOS application. Each component is designed with accessibility, performance, and developer experience in mind.