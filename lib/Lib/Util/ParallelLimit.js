/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/8
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _ThinkBaseJs = require('../Think/Base.js');

var _ThinkBaseJs2 = _interopRequireDefault(_ThinkBaseJs);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    /**
     * limit
     * @param  {[type]}   limit    []
     * @param  {Function} callback []
     * @return {[type]}            []
     */

    _default.prototype.init = function init(limit, callback) {
        if (isFunction(limit)) {
            callback = limit;
            limit = 0;
        }
        this.limit = limit || 10;
        this.index = 0;
        this.doing = 0;
        this.callback = callback;
        this.deferreds = [];
    };

    /**
     * add item data
     * @param {data} item []
     */

    _default.prototype.add = function add(item) {
        var deferred = getDefer();
        deferred.data = item;
        this.deferreds.push(deferred);
        this.run();
        return deferred.promise;
    };

    /**
     * add many data once
     * @param {Array} dataList [data array]
     */

    _default.prototype.addMany = function addMany(dataList, ignoreError) {
        var _this = this;

        if (!dataList || dataList.length === 0) {
            return _Promise.resolve();
        }
        dataList.forEach(function (item) {
            return _this.add(item);
        });
        var promises = this.deferreds.map(function (deferred) {
            //ignore erros
            if (ignoreError) {
                return deferred.promise['catch'](function () {
                    return;
                });
            }
            return deferred.promise;
        });
        return _Promise.all(promises);
    };

    /**
     * run
     * @return {} []
     */

    _default.prototype.run = function run() {
        var _this2 = this;

        if (this.doing >= this.limit || this.index >= this.deferreds.length) {
            return;
        }
        this.doing++;
        var item = this.deferreds[this.index++];
        var callback = isFunction(item.data) ? item.data : this.callback;
        if (!isFunction(callback)) {
            throw new Error('data item or callback must be a function');
        }
        var result = callback(item.data);
        if (!isPromise(result)) {
            result = _Promise.resolve(result);
        }
        return result.then(function (data) {
            _this2.doing--;
            _this2.run();
            //resolve item
            item.resolve(data);
        })['catch'](function (err) {
            _this2.doing--;
            _this2.run();
            //reject item
            item.reject(err);
        });
    };

    return _default;
})(_ThinkBaseJs2['default']);

exports['default'] = _default;
module.exports = exports['default'];