import 'jest-extended/all';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

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
      message: pass ? () => `expected node [${finder}] not to exist` : () => `expected node [${finder}] to exist`,
    };
  },
});
