import { sortVersions } from '../../src/utils/version';

describe('Version', () => {
  describe('sortVersions()', () => {
    it('should sort semver correctly', () => {
      /* standard sort */
      const arr1 = [
        '3.4.2',
        '2.1.0',
        '1.2.12'
      ];
      expect(arr1.sort(sortVersions)).toEqual([
        '1.2.12',
        '2.1.0',
        '3.4.2'
      ]);

      /* semver sort */
      const arr2 = [
        '1.1.20',
        '1.1.11',
        '11.0.0',
        '2.1.0'
      ];
      expect(arr2.sort(sortVersions)).toEqual([
        '1.1.11',
        '1.1.20',
        '2.1.0',
        '11.0.0',
      ]);
    });
  });
});