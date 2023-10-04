const { helloWorld } = require('../lib/main');

test('adds 1 + 2 to equal 3', () => {
  expect(helloWorld(1, 2)).toBe(3);
});
