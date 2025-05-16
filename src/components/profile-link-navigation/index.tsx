import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ProfileLinkNavigationProps {
  primaryZid?: string;
  thirdWebAddress?: string;
  children: ReactNode;
}

const PreventPropagation = ({ children }: { children: ReactNode }) => {
  return <div onClick={(e) => e.stopPropagation()}>{children}</div>;
};

export const ProfileLinkNavigation = ({ primaryZid, thirdWebAddress, children }: ProfileLinkNavigationProps) => {
  // Use primaryZID if available, otherwise fall back to ThirdWeb wallet address
  // Remove '0://' prefix from ZID if present
  const profileIdentifier = primaryZid?.replace('0://', '') ?? thirdWebAddress;

  // If we don't have either identifier, just render the children without a link
  if (!profileIdentifier) {
    return <>{children}</>;
  }

  return (
    <PreventPropagation>
      <Link to={`/profile/${profileIdentifier}`}>{children}</Link>
    </PreventPropagation>
  );
};
