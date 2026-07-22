import { createRequire } from 'module';
import { resolve } from 'path';

const require = createRequire(import.meta.url);
const dotenv = require('dotenv') as typeof import('dotenv');

const rootEnv = resolve(process.cwd(), '../../.env');
dotenv.config({ path: rootEnv });
