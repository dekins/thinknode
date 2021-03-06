/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
import base from '../../Core/Base';

export default class extends base{
    init(config = {}){
        this.config = THINK.extend(false, {
            memcache_host: THINK.C('memcache_host'),
            memcache_port: THINK.C('memcache_port')
        }, config);
        this.handle = null;
        this.deferred = null;
    }

    connect(){
        if (this.handle) {
            return this.deferred.promise;
        }
        let deferred = THINK.getDefer();
        let memcached = require('memcached');
        //[ '192.168.0.102:11211', '192.168.0.103:11211', '192.168.0.104:11211' ]
        let connection = new memcached([ `${this.config.memcache_host}:${this.config.memcache_port}`]);
        connection.on('issue', () => {
            this.close();
            deferred.reject('connection issue');
        });
        connection.on('failure', err => {
            this.close();
            deferred.reject(err);
        });

        this.handle = connection;
        if (this.deferred) {
            this.deferred.reject(new Error('connection closed'));
        }
        deferred.resolve();
        this.deferred = deferred;
        return this.deferred.promise;
    }

    close(){
        if (this.handle) {
            this.handle.remove();
            this.handle = null;
        }
    }

    /**
     *
     * @param name
     * @param data
     * @returns {*}
     */
    async wrap(name, data){
        let deferred = THINK.getDefer();
        await this.connect().catch(e => deferred.reject(e));
        if(!THINK.isArray(data)){
            data = data === undefined ? [] : [data];
        }
        data.push((err, data) => {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(data);
            }
        });
        if(this.handle){
            this.handle[name].apply(this.handle, data);
        } else {
            deferred.reject('connection end');
        }
        return deferred.promise;
    }

    /**
     * 字符串获取
     * @param name
     */
    get(name){
        return this.wrap('get', [name]);
    }

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */
    set(name, value, timeout){
        return this.wrap('set', [name, value, timeout]);
    }

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */
    expire(name, timeout){
        return this.wrap('touch', [name, timeout]);
    }

    /**
     * 删除key
     * @param name
     */
    rm(name){
        return this.wrap('del', [name]);
    }

    /**
     * 自增
     * @param name
     */
    incr(name) {
        return this.wrap('incr',[name, 1]);
    }

    /**
     * 自减
     * @param name
     * @returns {*}
     */
    decr(name) {
        return this.wrap('decr',[name, 1]);
    }
}
