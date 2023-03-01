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

jest.mock('react-mic', () => ({}));
