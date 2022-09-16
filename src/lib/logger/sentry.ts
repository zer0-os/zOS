import * as Sentry from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';
import { ILogger } from './';
import { config } from '../../config';

export class Logger implements ILogger {
  constructor(private loggerClient, private options, private app?) {
    this.loggerClient.init({
      ...{ ...options, dsn: app ? options.dsn.apps : options.dsn.core },
      integrations: [
        new RewriteFrames({ iteratee: this.rewriteFrame }),
      ],
    });
  }

  rewriteFrame(frame) {
    return {
      ...frame,
      filename: frame.filename.replace(/[a-z0-9]*_static/, 'static'),
    };
  }

  capture(error, app?, extras?) {
    if (extras) {
      this.loggerClient.withScope((scope) => {
        if (app) scope.setContexts('application', app);
        scope.setExtras(extras);
      });
    }

    this.loggerClient.captureException(error);
  }
}

export const errorLogger = {
  get: (app?: string): ILogger => {
    return new Logger(Sentry, config.sentry, app);
  },
};
