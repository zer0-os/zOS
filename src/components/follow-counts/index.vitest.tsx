import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { FollowCounts } from './index';

describe('FollowCounts', () => {
  describe('when showing both counts', () => {
    beforeEach(() => {
      renderWithProviders(<FollowCounts followingCount={100} followersCount={200} />);
    });

    it('renders following count', () => {
      const followingSection = screen.getByText('Following').closest('div');
      expect(followingSection).toHaveTextContent('100');
      expect(followingSection).toHaveTextContent('Following');
    });

    it('renders followers count', () => {
      const followersSection = screen.getByText('Followers').closest('div');
      expect(followersSection).toHaveTextContent('200');
      expect(followersSection).toHaveTextContent('Followers');
    });
  });

  describe('when showing only following', () => {
    beforeEach(() => {
      renderWithProviders(<FollowCounts followingCount={100} followersCount={200} showFollowers={false} />);
    });

    it('renders following count', () => {
      const followingSection = screen.getByText('Following').closest('div');
      expect(followingSection).toHaveTextContent('100');
      expect(followingSection).toHaveTextContent('Following');
    });

    it('does not render followers count', () => {
      expect(screen.queryByText('Followers')).not.toBeInTheDocument();
    });
  });

  describe('when showing only followers', () => {
    beforeEach(() => {
      renderWithProviders(<FollowCounts followingCount={100} followersCount={200} showFollowing={false} />);
    });

    it('renders followers count', () => {
      const followersSection = screen.getByText('Followers').closest('div');
      expect(followersSection).toHaveTextContent('200');
      expect(followersSection).toHaveTextContent('Followers');
    });

    it('does not render following count', () => {
      expect(screen.queryByText('Following')).not.toBeInTheDocument();
    });
  });

  it('handles zero counts', () => {
    renderWithProviders(<FollowCounts followingCount={0} followersCount={0} />);

    // Check each section separately
    const followingSection = screen.getByText('Following').closest('div');
    expect(followingSection).toHaveTextContent('0');

    const followersSection = screen.getByText('Followers').closest('div');
    expect(followersSection).toHaveTextContent('0');
  });
});
