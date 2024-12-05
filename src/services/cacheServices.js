// services/cacheService.js
import NodeCache from 'node-cache';
import logger from '../utils/logger.js';

class CacheService {
 constructor(ttlSeconds = 600) {
   this.cache = new NodeCache({
     stdTTL: ttlSeconds,
     checkperiod: ttlSeconds * 0.2,
     useClones: false
   });

   this.cache.on('expired', (key, value) => {
     logger.info('Cache expired:', { key });
   });
 }

 get(key) {
   const value = this.cache.get(key);
   if (value) {
     logger.debug('Cache hit:', { key });
   } else {
     logger.debug('Cache miss:', { key });
   }
   return value;
 }

 set(key, value, ttl = 600) {
   try {
     const success = this.cache.set(key, value, ttl);
     if (success) {
       logger.debug('Cache set:', { key, ttl });
     }
     return success;
   } catch (error) {
     logger.error('Cache set error:', { key, error });
     return false;
   }
 }

 del(key) {
   try {
     this.cache.del(key);
     logger.debug('Cache deleted:', { key });
     return true;
   } catch (error) {
     logger.error('Cache delete error:', { key, error });
     return false;
   }
 }

 flush() {
   try {
     this.cache.flushAll();
     logger.info('Cache flushed');
     return true;
   } catch (error) {
     logger.error('Cache flush error:', error);
     return false;
   }
 }

 getStats() {
   return {
     hits: this.cache.getStats().hits,
     misses: this.cache.getStats().misses,
     keys: this.cache.keys().length
   };
 }
}

export default new CacheService();