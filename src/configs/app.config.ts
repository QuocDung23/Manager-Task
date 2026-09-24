import dotenv from 'dotenv';
import { cleanEnv, bool, host, port, str, testOnly } from 'envalid';

dotenv.config();

export const appEnv = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly('test'), choices: ['development', 'production', 'test'] }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:5173,http://localhost:3000') }),
  COOKIE_SAME_SITE: str({ default: 'lax', choices: ['lax', 'none', 'strict'] }),
  COOKIE_SECURE: bool({ default: false }),
});
