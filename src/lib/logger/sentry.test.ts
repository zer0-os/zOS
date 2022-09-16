import { Logger } from './sentry';

describe('sentry', () => {
  const subject = (logger, config, app) => {
    const sentryLogger = {
      init: () => {},
      captureException: () => {},
      withScope: () => {},
      ...logger,
    };

    const allConfig = {
      dsn: '',
      environment: '',
      release: '',
      ...config,
    };

    return new Logger(sentryLogger, allConfig, app);
  };

  describe('rewriteFrame', () => {
    it('rewrites filename', function () {
      const frame = {
        colno: 3622613,
        filename: 'https://d3h58788fxd67a.example.net/7e46b0b6e792_static/js/2.4d0f9c85.chunk.js',
        function: 'HTMLDocument.r',
        in_app: true,
        lineno: 1,
      };

      const newFrame = subject().rewriteFrame(frame);

      expect(newFrame.filename).toEqual('https://d3h58788fxd67a.example.net/static/js/2.4d0f9c85.chunk.js');
    });

    it('it maintains filename that is not transformed', function () {
      const frame = {
        colno: 3622613,
        filename: 'https://d3h58788fxd67a.example.net/static/js/2.4d0f9c85.chunk.js',
        function: 'HTMLDocument.r',
        in_app: true,
        lineno: 1,
      };

      const newFrame = subject().rewriteFrame(frame);

      expect(newFrame.filename).toEqual('https://d3h58788fxd67a.example.net/static/js/2.4d0f9c85.chunk.js');
    });

    it('it maintains remainder of frame properties', function () {
      const frame = {
        filename: 'https://d3h58788fxd67a.example.net/7e46b0b6e792_static/js/2.4d0f9c85.chunk.js',
        colno: 3622613,
        function: 'HTMLDocument.r',
        in_app: true,
        lineno: 1,
      };

      const newFrame = subject().rewriteFrame(frame);

      expect(newFrame).toMatchObject({
        colno: 3622613,
        function: 'HTMLDocument.r',
        in_app: true,
        lineno: 1,
      });
    });
  });

  describe('init', () => {
    it('for core', function () {
      const logger = {
        init: jest.fn(),
      };

      const config = {
        dsn: { core: 'the-core-specific-dsn' },
        release: 'v.0.1',
        environment: 'local',
      };

      const sentryConfig = {
        ...config,
        dsn: config.dsn.core,
      };

      subject(logger, config);

      expect(logger.init).toBeCalledWith(expect.objectContaining(sentryConfig));
    });

    it('for apps', function () {
      const logger = {
        init: jest.fn(),
      };

      const config = {
        dsn: { apps: 'the-app-specific-dsn' },
        release: 'v.0.1',
        environment: 'local',
      };

      const sentryConfig = {
        ...config,
        dsn: config.dsn.apps,
      };

      subject(logger, config, 'Feed');

      expect(logger.init).toBeCalledWith(expect.objectContaining(sentryConfig));
    });
  });

  describe('capture', () => {
    it('vanilla', async function () {
      const logger = {
        captureException: jest.fn(),
      };

      const expectation = new Error('OUCH!');

      subject(logger).capture(expectation);

      expect(logger.captureException).toBeCalledWith(expectation);
    });

    it('with app and extras', async function () {
      const logger = {
        captureException: jest.fn(),
        withScope: jest.fn(),
      };

      const expectation = new Error('OUCH!');

      subject(logger).capture(expectation, 'Feed', { we: 'can-put-additional-data-in-here' });

      expect(logger.captureException).toBeCalledWith(expectation);
      expect(logger.withScope).toBeCalled();
    });
  });
});
