import { boot, showFatalError } from './src/app/bootstrap.js';

boot().catch(error => showFatalError(error?.stack || error));
