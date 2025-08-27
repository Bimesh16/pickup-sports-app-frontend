import { isFull, slotsLeft } from '@/src/utils/capacity';

describe('capacity utilities', () => {
  describe('isFull', () => {
    it('returns false when joined', () => {
      expect(isFull(true, 10, 10)).toBe(false);
    });

    it('returns false when maxPlayers is undefined', () => {
      expect(isFull(false, undefined, 5)).toBe(false);
    });

    it('returns false when playersCount is undefined', () => {
      expect(isFull(false, 5, undefined)).toBe(false);
    });

    it('returns true when not joined and at capacity', () => {
      expect(isFull(false, 5, 5)).toBe(true);
      expect(isFull(false, 5, 6)).toBe(true);
    });

    it('returns false when below capacity', () => {
      expect(isFull(false, 5, 4)).toBe(false);
    });
  });

  describe('slotsLeft', () => {
    it('returns undefined when numbers are missing', () => {
      expect(slotsLeft(undefined, 5)).toBeUndefined();
      expect(slotsLeft(5, undefined)).toBeUndefined();
    });

    it('calculates remaining slots', () => {
      expect(slotsLeft(10, 3)).toBe(7);
    });

    it('clamps at zero when over capacity', () => {
      expect(slotsLeft(5, 5)).toBe(0);
      expect(slotsLeft(5, 7)).toBe(0);
    });
  });
});
