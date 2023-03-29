/// <reference types="jest" />

interface ZOSCustomMatchers<R> extends Record<string, any> {
  toHaveElement<P2>(statelessComponent: FunctionComponent<P2>): ShallowWrapper<P2, never>;
  toHaveElement<P2>(component: ComponentType<P2>): ShallowWrapper<P2, any>;
  toHaveElement<C2 extends Component>(
    componentClass: ComponentClass<C2['props']>
  ): ShallowWrapper<C2['props'], C2['state'], C2>;
  toHaveElement(props: EnzymePropSelector): ShallowWrapper<any, any>;
  toHaveElement(selector: string): R;
}

declare global {
  namespace jest {
    interface Matchers<R = void, _T = {}> extends ZOSCustomMatchers<R> {}
  }
}

// Not entirely sure why we need to export something but I've found VSCode
// couldn't autocomplete without this.
declare const matchers: ZOSCustomMatchers<void>;
export default matchers;
