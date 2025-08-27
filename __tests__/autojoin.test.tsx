import { describe } from 'node:test';
import renderer, { act } from 'react-test-renderer';
import { useAutoJoin } from '@/src/features/games/hooks/useAutoJoin';

jest.mock('@/src/components/ConfirmDialog', () => ({
  confirm: jest.fn(),
}));

import { confirm } from '@/src/components/ConfirmDialog';

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('useAutoJoin', () => {
  test('prompts once and joins on confirmation', async () => {
    (confirm as jest.Mock).mockResolvedValue(true);
    const join = { mutate: jest.fn(), isPending: false };
    const data = {
      joined: false,
      title: 'Pickup',
      location: 'Court',
      startsAt: new Date().toISOString(),
    };
    const whenText = '2025-01-01 10:00';

    const TestComp = ({ autojoin }: { autojoin?: string }) => {
      useAutoJoin({ autojoin, data, whenText, join });
      return null;
    };

    await act(async () => {
      const inst = renderer.create(<TestComp autojoin="1" />);
      await flushPromises();
      inst.update(<TestComp autojoin="1" />);
      await flushPromises();
    });

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(join.mutate).toHaveBeenCalledTimes(1);
  });
});

