import * as matchers from 'jest-extended';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom';
import enableHooks from 'jest-react-hooks-shallow';
import 'jest-canvas-mock';

// add all jest-extended matchers
expect.extend(matchers);

configure({ adapter: new Adapter() });

// pass an instance of jest to `enableHooks()`
enableHooks(jest);