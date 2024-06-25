import 'jest-extended/all';
import { configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';

import 'jest-enzyme';

configure({ adapter: new Adapter() });

const localStorageMock = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  clear: jest.fn(),
  key: jest.fn(),
};

global.localStorage = localStorageMock;

expect.extend({
  toHaveElement(actual, finder) {
    const pass = actual.find(finder).exists();
    return {
      pass,
      message: pass
        ? () => `expected node [${printable(finder)}] not to exist`
        : () => `expected node [${printable(finder)}] to exist`,
    };
  },
});

function printable(finder) {
  return finder.name ?? finder;
}

// Hack to allow us to dynamically regenerate the mock files for zUI
// Running a single test with this env var set will recreate the files.
if (process.env.BUILD_MOCKS === 'true') {
  require('./build-mocks');
} else {
  require('./icon-mocks');
  require('./component-mocks');
}
