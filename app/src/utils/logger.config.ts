import { createLogger } from '@aws-lambda-powertools/logger';
import config from '../config';

const _logger = createLogger({ serviceName: config.service.name });

export const logger = new Proxy(_logger, {
  get: (target, prop) => {
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }
    return target[prop as keyof typeof target];
  },
});
