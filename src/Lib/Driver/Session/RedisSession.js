/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/29
 */
import rediscache from '../Cache/RedisCache';

export default class extends rediscache{
    init(options) {
        super.init(options);

        //cache keystore
        this.cacheStore = thinkCache.SESSION;
        //cache auto refresh
        this.updateExpire = true;
    }
}