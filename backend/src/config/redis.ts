import { Redis } from '@upstash/redis';
import { config } from './config';

const redisClient = new Redis({
  url: config.upstash.restUrl,
  token: config.upstash.restToken,
});

export default redisClient;
