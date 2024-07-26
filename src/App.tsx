import { AppRouter } from './apps/app-router';
import { ZUIProvider } from '@zero-tech/zui/ZUIProvider';

export const App = () => {
  return (
    // See: ZOS-115
    // @ts-ignore
    <ZUIProvider>
      <AppRouter />
    </ZUIProvider>
  );
};
