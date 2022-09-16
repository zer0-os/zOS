export interface ILogger {
  capture: (error: Error, app?: string, extra?: object) => void;
}
