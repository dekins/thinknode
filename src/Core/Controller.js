/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import base from './Base';
import filterTool from '../Util/Filter';

export default class extends base {

    init(http) {
        this.http = http;
        //assign别名
        this.set = this.assign;
        //success别名
        this.ok = this.success;
        //error别名
        this.fail = this.error;
        //display别名
        this.render = this.display;
    }

    /**
     * 是否是GET请求
     * @return {Boolean} [description]
     */
    isGet() {
        return this.http.isGet();
    }

    /**
     * 是否是POST请求
     * @return {Boolean} [description]
     */
    isPost() {
        return this.http.isPost();
    }

    /**
     * 是否是特定METHOD请求
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */
    isMethod(method) {
        return this.http.method === method.toUpperCase();
    }

    /**
     * 是否是AJAX请求
     * @return {Boolean} [description]
     */
    isAjax(method) {
        return this.http.isAjax(method);
    }

    /**
     * 是否是websocket请求
     * @return {Boolean} [description]
     */
    isWebSocket() {
        return this.http.isWebSocket;
    }

    /**
     * 是否是restful请求
     */
    isRestful() {
        return this.http.isRestful;
    }

    /**
     * 是否是jsonp接口
     * @return {Boolean} [description]
     */
    isJsonp(name) {
        return this.http.isJsonp(name);
    }

    /**
     * token功能
     * @return {[type]} [description]
     */
    async token() {
        if (THINK.C('token_on')) {
            let tokenName = THINK.C('token_name');
            let value = await this.session(tokenName);
            let formValue = this.http.param(tokenName);
            if (value !== formValue) {
                return false;
            } else {
                //token匹配方式 http每次请求token不同, session在session有效期内token相同
                if(THINK.C('token_type') === 'http'){
                    //匹配完成后清除token
                    this.http.session(tokenName, null);
                }
                return true;
            }
        } else {
            return true;
        }

    }

    /**
     * 获取及构造QUERY参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get(name, value) {
        return this.http.get(name, value);
    }

    /**
     * 获取及构造POST参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    post(name, value) {
        return this.http.post(name, value);
    }

    /**
     * 获取post或get参数,post优先
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    param(name) {
        return this.http.param(name);
    }

    /**
     * 获取及构造上传的文件
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    file(name, value) {
        return this.http.file(name, value);
    }

    /**
     * header操作
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    header(name, value) {
        return this.http.header(name, value);
    }

    /**
     * 获取userAgent
     * @return {[type]} [description]
     */
    userAgent() {
        return this.http.userAgent();
    }

    /**
     * 获取referrer
     * @return {[type]} [description]
     */
    referer(host) {
        return this.http.referrer(host);
    }

    /**
     * cookie操作
     * @param  {[type]} name    [description]
     * @param  {[type]} value   [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    cookie(name, value, options) {
        return this.http.cookie(name, value, options);
    }

    /**
     * session操作
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]} timeout [description]
     */
    session(name, value, timeout) {
        return this.http.session(name, value, timeout);
    }

    /**
     * 赋值变量到模版
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    assign(name, value) {
        return this.http.view().assign(name, value);
    }

    /**
     * 获取模板引擎解析后的模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    fetch(templateFile){
        return this.http.view().fetch(templateFile);
    }

    /**
     * 输出模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    display(templateFile, charset, contentType){
        return this.http.view().display(templateFile, charset, contentType);
    }
    /**
     * 设置http响应状态码
     * @param  {Number} status [status code]
     * @return {}        []
     */
    status(status = 404) {
        this.http.status(status);
        return this;
    }
    /**
     * 阻止访问
     * @param  {Number} status [status code]
     * @return {[type]}        []
     */
    deny(status = 403){
        return THINK.statusAction(this.http, 403);
    }
    /**
     * 设置Cache-Control及失效时间
     * @param  {Number} time []
     * @return {}      []
     */
    expires(time){
        this.http.expires(time);
        return this;
    }

    /**
     * url跳转
     * @param url
     * @param code
     * @returns {*}
     */
    redirect(url, code) {
        this.http.redirect(url, code);
        return THINK.getDefer().promise;
    }

    /**
     * 发送Content-Type
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    type(ext, encoding = THINK.C('encoding')){
        return this.http.type(ext, encoding);
    }

    /**
     * 发送执行时间
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    sendTime(name){
        return this.http.sendTime(name);
    }

    /**
     * json格式输出数据
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    json(data){
        this.type(THINK.C('json_content_type'));
        return this.http.end(data);
    }

    /**
     * jsonp格式输出数据
     * @param  {[type]} data  [description]
     * @param  {[type]} jsonp [description]
     * @return {[type]}       [description]
     */
    jsonp(data){
        this.type(THINK.C('json_content_type'));
        let callback = this.get(THINK.C('url_callback_name'));
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = `${callback}(${(data !== undefined ? JSON.stringify(data) : '')})`;
        }
        return this.http.end(data);
    }

    /**
     * 操作成功后格式化的json数据输出
     * @param errmsg
     * @param data
     * @param code
     * @returns {type[]}
     */
    success(errmsg, data, code = 200){
        let obj = THINK.getObject(['status', THINK.C('error_no_key'), THINK.C('error_msg_key')], [1, code, errmsg || '']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(THINK.C('json_content_type'));
        return this.http.end(obj);
    }

    /**
     * 操作异常后格式化的json数据输出
     * @param errmsg
     * @param data
     * @param code
     * @returns {type[]}
     */
    error(errmsg, data, code = 500){
        let obj = THINK.getObject(['status', THINK.C('error_no_key'), THINK.C('error_msg_key')], [0, code, (THINK.isError(errmsg) ? errmsg.messave : errmsg) || 'error']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(THINK.C('json_content_type'));
        return this.http.end(obj);
    }

    /**
     * 输出内容
     * 自动JSON.stringify
     * 自定将数字等转化为字符串
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    echo(obj, contentType, encoding){
        contentType = contentType || THINK.C('tpl_content_type');
        this.type(contentType);
        return this.http.end(obj, encoding);
    }

    /**
     * 结束输出
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    end(obj, encoding){
        return this.http.end(obj, encoding);
    }

    /**
     * 对数据进行过滤
     * @param  {[type]} data [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    filter(){
        let _filter = filterTool.filter;
        return _filter.apply(null, arguments);
    }

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Miex} data  []
     * @return {}       []
     */
    emit(event, data){
        if(!this.http.isWebSocket){
            return THINK.statusAction(this.http, 403, 'emit method can only used in websocket request', 'SOCKET');
        }
        return this.http.socketEmit(event, data);
    }
    /**
     * broadcast socket data
     * @param  {String} event       []
     * @param  {Mixed} data        []
     * @param  {Boolean} containSelf []
     * @return {}             []
     */
    broadcast(event, data, containSelf){
        if(!this.http.isWebSocket){
            return THINK.statusAction(this.http, 403, 'broadcast method can only used in websocket request', 'SOCKET');
        }
        return this.http.socketBroadcast(event, data, containSelf);
    }
}
