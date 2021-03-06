'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _http2 = require('http');

var _http3 = _interopRequireDefault(_http2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Thttp = require('./Thttp');

var _Thttp2 = _interopRequireDefault(_Thttp);

var _Dispather = require('./Dispather');

var _Dispather2 = _interopRequireDefault(_Dispather);

var _WebSocket = require('../Adapter/Socket/WebSocket');

var _WebSocket2 = _interopRequireDefault(_WebSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
exports.default = class extends _Base2.default {

    run() {
        let clusterNums = THINK.C('use_cluster');
        //不使用cluster
        if (!clusterNums) {
            return this.createServer();
        } else {
            //使用cpu的个数
            if (clusterNums === true) {
                clusterNums = _os2.default.cpus().length;
            }
            if (_cluster2.default.isMaster) {
                for (let i = 0; i < clusterNums; i++) {
                    _cluster2.default.fork();
                }
                _cluster2.default.on('exit', worker => {
                    THINK.log(new Error(`worker ${ worker.process.pid } died`));
                    process.nextTick(() => _cluster2.default.fork());
                });
            } else {
                this.createServer();
            }
        }
    }

    /**
     *  创建HTTP服务
     */
    createServer() {
        let self = this,
            httpCls;
        let server = _http3.default.createServer((() => {
            var _ref = (0, _asyncToGenerator3.default)(function* (req, res) {
                try {
                    httpCls = new _Thttp2.default(req, res);
                    let _http = yield httpCls.run();
                    yield self.exec(_http);
                    return THINK.statusAction(_http, 200);
                } catch (err) {
                    return THINK.statusAction(_http3.default.loaded ? _http3.default : httpCls.http, 500, err);
                }
            });

            return function (_x, _x2) {
                return _ref.apply(this, arguments);
            };
        })());
        //websocket
        if (THINK.C('use_websocket')) {
            try {
                let instance = new _WebSocket2.default(server, this);
                instance.run();
            } catch (e) {
                THINK.E(`Initialize WebSocket error: ${ e.stack }`);
                return _promise2.default.reject(e);
            }
        }
        let host = THINK.C('app_host');
        let port = THINK.C('app_port');
        if (host) {
            server.listen(port, host);
        } else {
            server.listen(port);
        }

        THINK.log('====================================', 'THINK');
        THINK.log(`Server running at http://${ host || '127.0.0.1' }:${ port }/`, 'THINK');
        THINK.log(`ThinkNode Version: ${ THINK.THINK_VERSION }`, 'THINK');
        THINK.log(`App Cluster Status: ${ THINK.C('use_cluster') ? 'open' : 'closed' }`, 'THINK');
        THINK.log(`WebSocket Status: ${ THINK.C('use_websocket') ? 'open' : 'closed' }`, 'THINK');
        //THINK.log(`File Auto Compile: ${(THINK.C('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        THINK.log(`App File Auto Reload: ${ THINK.APP_DEBUG ? 'open' : 'closed' }`, 'THINK');
        THINK.log(`App Enviroment: ${ THINK.APP_DEBUG ? 'debug mode' : 'stand mode' }`, 'THINK');
        THINK.log('====================================', 'THINK');
    }

    /**
     * 记录当前进程的id
     */
    logPid(port) {
        if (!THINK.CONF.log_process_pid || !_cluster2.default.isMaster) {
            return;
        }
        try {
            THINK.RUNTIME_PATH && !THINK.isDir(THINK.RUNTIME_PATH) && THINK.mkDir(THINK.RUNTIME_PATH);
            let pidFile = `${ THINK.RUNTIME_PATH }/${ port }.pid`;
            _fs2.default.writeFileSync(pidFile, process.pid);
            THINK.chmod(pidFile);
            //进程退出时删除该文件
            process.on('SIGTERM', () => {
                if (_fs2.default.existsSync(pidFile)) {
                    _fs2.default.unlinkSync(pidFile);
                }
                process.exit(0);
            });
        } catch (e) {
            THINK.log(e);
        }
    }

    /**
     *
     * @param http
     * @returns {*}
     */
    exec(http) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            //禁止远程直接用带端口的访问,websocket下允许
            if (THINK.C('use_proxy')) {
                if (http.host !== http.hostname && !http.isWebSocket) {
                    return THINK.statusAction(http, 403);
                }
            }
            let dispCls = new _Dispather2.default(http);
            http = yield dispCls.run();
            return _this.execController(http);
        })();
    }

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    execController(http) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            //app initialize
            yield THINK.R('app_init', http);
            //app begin
            yield THINK.R('app_begin', http);
            //http对象的controller不存在直接返回
            if (!http.controller) {
                return THINK.statusAction(http, 404, 'Controller not found.');
            }
            //controller instance
            let controller;
            try {
                let instance = THINK.require(`${ http.group }/${ http.controller }`, 'Controller');
                controller = new instance(http);
            } catch (e) {
                return THINK.statusAction(http, 404, `Controller ${ http.group }/${ http.controller } not found.`);
            }
            yield _this2.execAction(controller, http);
            //app end
            return THINK.R('app_end', http);
        })();
    }

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param http
     */
    execAction(controller, http) {
        return (0, _asyncToGenerator3.default)(function* () {
            let act = `${ http.action }${ THINK.C('action_suffix') }`;
            let call = THINK.C('empty_method');
            let flag = false;
            //action不存在时执行空方法
            if (!controller[act]) {
                if (call && controller[call]) {
                    flag = true;
                    act = call;
                }
            }
            //action不存在
            if (!controller[act] && !flag) {
                return THINK.statusAction(http, 404, `action ${ http.action } not found.`);
            }
            //action前置操作
            let commonBefore = THINK.C('common_before_action');
            let before = THINK.C('before_action');

            //公共action前置操作
            if (commonBefore && controller[commonBefore]) {
                yield controller[commonBefore]();
            }
            //当前action前置操作
            if (before && controller[`${ before }${ http.action }`]) {
                yield controller[`${ before }${ http.action }`]();
            }
            return controller[act]();
        })();
    }
};