import { SidekickTabs } from './../../components/sidekick/types';
import { SIDEKICK_TAB_KEY } from './constants';
import { resolveActiveTab } from './utils';

describe('layout.utils', () => {
  describe('resolveActiveTab', () => {
    it('should use the key to get the data', () => {
      resolveActiveTab();
      expect(global.localStorage.getItem).toHaveBeenCalledWith(SIDEKICK_TAB_KEY);
    });

    it('returns default active tab', () => {
      const activeTab = resolveActiveTab();
      expect(activeTab).toEqual(SidekickTabs.MESSAGES);
    });

    it('returns stored active tab', () => {
      global.localStorage.getItem = jest.fn().mockReturnValue('notifications');

      const activeTab = resolveActiveTab();
      expect(activeTab).toEqual(SidekickTabs.NOTIFICATIONS);
    });

    it('returns default in case stored tab is not matching any tab', () => {
      global.localStorage.getItem = jest.fn().mockReturnValue('data here');

      const activeTab = resolveActiveTab();
      expect(activeTab).toEqual(SidekickTabs.MESSAGES);
    });
  });
});
