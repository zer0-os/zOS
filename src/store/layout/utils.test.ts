import { SidekickTabs } from './../../components/sidekick/types';
import { resolveActiveTab } from './utils';

describe('layout.utils', () => {
  describe('resolveActiveTab', () => {
    it('should use the key to get the data', () => {
      const key = 'key';
      resolveActiveTab(key);
      expect(global.localStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('returns default active tab', () => {
      const key = 'key';
      const activeTab = resolveActiveTab(key);
      expect(activeTab).toEqual(SidekickTabs.MESSAGES);
    });

    it('returns stored active tab', () => {
      const key = 'key';
      global.localStorage.getItem = jest.fn().mockReturnValue('notifications');

      const activeTab = resolveActiveTab(key);
      expect(activeTab).toEqual(SidekickTabs.NOTIFICATIONS);
    });

    it('returns default in case stored tab is not matching any tab', () => {
      const key = 'key';
      global.localStorage.getItem = jest.fn().mockReturnValue('data here');

      const activeTab = resolveActiveTab(key);
      expect(activeTab).toEqual(SidekickTabs.MESSAGES);
    });
  });
});
