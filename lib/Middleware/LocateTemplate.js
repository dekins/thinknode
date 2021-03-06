'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run(_ref) {
        var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

        var _ref2$ = _ref2[0];
        let templateFile = _ref2$ === undefined ? '' : _ref2$;
        let tVar = _ref2[1];

        if (THINK.isEmpty(templateFile)) {
            //根据group, controller, action自动生成
            templateFile = [THINK.APP_PATH, '/', this.http.group, '/View/', THINK.C('tpl_default_theme') || 'default', '/', this.http.controller.toLowerCase(), THINK.C('tpl_file_depr'), this.http.action.toLowerCase(), THINK.C('tpl_file_suffix')].join('');
        } else {
            templateFile = templateFile + '';
            if (templateFile.indexOf('./') > -1) {
                //相对路径解析
                templateFile = _path2.default.resolve(_path2.default.normalize(templateFile));
            } else if (templateFile.indexOf('/') > 0) {
                //模块式访问 group/controller/view
                let path = templateFile.split('/');
                let action = path.pop().toLowerCase();
                let controller = path.pop().toLowerCase() || this.http.controller.toLowerCase();
                let group = THINK.ucFirst(path.pop() || this.http.group);
                templateFile = [THINK.APP_PATH, '/', group, '/View/', THINK.C('tpl_default_theme') || 'default', '/', controller, THINK.C('tpl_file_depr'), action, THINK.C('tpl_file_suffix')].join('');
            }
        }

        this.http.templateFile = templateFile;
        return _promise2.default.resolve();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/19
    */