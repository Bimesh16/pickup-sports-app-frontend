import * as React from 'react';
import renderer from 'react-test-renderer';

jest.mock('../useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('../Themed', () => ({
  __esModule: true,
  Text: ({ children }) => <span>{children}</span>,
}));

const { MonoText } = require('../StyledText');

it(`renders correctly`, () => {
  let testRenderer;
  renderer.act(() => {
    testRenderer = renderer.create(<MonoText>Snapshot test!</MonoText>);
  });
  const tree = testRenderer.toJSON();

  expect(tree).not.toBeNull();
  expect(tree.children).toContain('Snapshot test!');
});
