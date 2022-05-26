import * as matchers from 'jest-extended';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

// add all jest-extended matchers
expect.extend(matchers);

configure({ adapter: new Adapter() });

// Needed for tests 
process.env.REACT_APP_ETH_CHAIN = '1';