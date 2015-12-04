/**
 * 缓存基类
 * @return {[type]} [description]
 */
import base from './Base.js';

export default class extends base{
    init(options = {}){
        this.options = extend(false, {
            cache_type: C('cache_type'), //数据缓存类型 File,Redis,Memcache
            cache_key_prefix: C('cache_key_prefix'), //缓存key前置(memcache和redis下有效)
            cache_timeout: C('cache_timeout'), //数据缓存有效期，单位: 秒
            cache_path: THINK.CACHE_PATH,  //缓存路径设置 (File缓存方式有效)
            cache_file_suffix: C('cache_file_suffix'), //File缓存方式下文件后缀名
            cache_gc_hour: C('cache_gc_hour') //缓存清除的时间点，数据为小时
        }, options);
    }
}