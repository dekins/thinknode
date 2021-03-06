'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run(data) {
        if (!this.http.req.readable) {
            return _promise2.default.resolve();
        }
        return this.http.getPayload().then(payload => {
            //解析提交的json数据
            let types = THINK.C('post_json_content_type');
            let data = {};
            if (types.indexOf(this.http._type) > -1) {
                try {
                    data = JSON.parse(payload);
                } catch (e) {
                    THINK.log('JSON.parse error, payload is not a valid JSON data', 'WARNING');
                    //if using json parse error, then use querystring parse.
                    //sometimes http header has json content-type, but payload data is querystring data
                    data = _querystring2.default.parse(payload);
                }
            }
            //querystring.parse解析
            let contentType = this.http.type();
            if (contentType && contentType.indexOf('application/x-www-form-urlencoded') > -1) {
                data = THINK.extend(data, _querystring2.default.parse(payload));
            }
            if (!THINK.isEmpty(data)) {
                this.http._post = THINK.extend(this.http._post, data);
            }
            return _promise2.default.resolve();
        });
    }

}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/19
    */