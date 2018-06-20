/**
 * Copyright(c) Alibaba Group Holding Limited.
 *
 * @file:     sms-sdk
 * @authors:  qiankun <chuck.ql@alibaba-inc.com> (https://work.alibaba-inc.com/work/u/85053)
 * @date      18/6/20
 */

'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DysmsapiClient = require('@alicloud/dysmsapi-2018-05-01');
var DybaseapiClient = require('@alicloud/dybaseapi-2018-05-01');
var MNSClient = require('@alicloud/mns');
// Message Type, there is only two type: smsreport, upmessage
var msgTypeList = ["SmsReport", "SmsUp"];
var DYSMSAPI_ENDPOINT = 'http://dysmsapi.ap-southeast-1.aliyuncs.com';
var DYBASEAPI_ENDPOINT = 'http://dybaseapi.ap-southeast-1.aliyuncs.com';

function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

var SMSClient = function () {
  function SMSClient(options) {
    (0, _classCallCheck3.default)(this, SMSClient);
    var accessKeyId = options.accessKeyId,
        secretAccessKey = options.secretAccessKey;

    if (!accessKeyId) {
      throw new TypeError('parameter "accessKeyId" is required');
    }
    if (!secretAccessKey) {
      throw new TypeError('parameter "secretAccessKey" is required');
    }
    this.dysmsapiClient = new DysmsapiClient({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, endpoint: DYSMSAPI_ENDPOINT });
    this.dybaseClient = new DybaseapiClient({ accessKeyId: accessKeyId, secretAccessKey: secretAccessKey, endpoint: DYBASEAPI_ENDPOINT });
    this.expire = [];
    this.mnsClient = [];
  }

  // send message


  (0, _createClass3.default)(SMSClient, [{
    key: 'sendSMS',
    value: function sendSMS(params) {
      return this.dysmsapiClient.sendSms(params);
    }

    // query detail

  }, {
    key: 'queryDetail',
    value: function queryDetail(params) {
      return this.dysmsapiClient.querySendDetails(params);
    }

    // refresh token

  }, {
    key: '_refresh',
    value: function _refresh(type) {
      return this.expire[type] - new Date().getTime() > 2 * 60 * 1000;
    }

    //get token

  }, {
    key: '_getToken',
    value: function _getToken(type) {
      var msgType = msgTypeList[type];
      return this.dybaseClient.queryTokenForMnsQueue({ MessageType: msgType });
    }

    //get mnsclient instance by type

  }, {
    key: '_getMNSClient',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(type) {
        var _ref2, _ref2$MessageTokenDTO, SecurityToken, AccessKeyId, AccessKeySecret, mnsClient;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.mnsClient && this.mnsClient[type] instanceof MNSClient && this._refresh(type))) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt('return', this.mnsClient[type]);

              case 2:
                _context.next = 4;
                return this._getToken(type);

              case 4:
                _ref2 = _context.sent;
                _ref2$MessageTokenDTO = _ref2.MessageTokenDTO;
                SecurityToken = _ref2$MessageTokenDTO.SecurityToken;
                AccessKeyId = _ref2$MessageTokenDTO.AccessKeyId;
                AccessKeySecret = _ref2$MessageTokenDTO.AccessKeySecret;

                if (AccessKeyId && AccessKeySecret && SecurityToken) {
                  _context.next = 11;
                  break;
                }

                throw new TypeError('get token fail');

              case 11:
                mnsClient = new MNSClient('1493622401794734', {
                  securityToken: SecurityToken,
                  region: 'ap-southeast-1',
                  accessKeyId: AccessKeyId,
                  accessKeySecret: AccessKeySecret,
                  // optional & default
                  secure: false, // use https or http
                  internal: false, // use internal endpoint
                  vpc: false // use vpc endpoint
                });

                this.mnsClient[type] = mnsClient;
                this.expire[type] = new Date().getTime() + 10 * 60 * 1000;
                return _context.abrupt('return', mnsClient);

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _getMNSClient(_x) {
        return _ref.apply(this, arguments);
      }

      return _getMNSClient;
    }()

    // typeIndex, there is only two type: 0:smsreport, 1:upmessage

  }, {
    key: 'receiveMsg',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var typeIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var preQueueName = arguments[1];
        var waitSeconds = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
        var mnsClient;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._getMNSClient(typeIndex);

              case 2:
                mnsClient = _context2.sent;
                _context2.next = 5;
                return mnsClient.receiveMessage(preQueueName + msgTypeList[typeIndex], waitSeconds);

              case 5:
                return _context2.abrupt('return', _context2.sent);

              case 6:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function receiveMsg() {
        return _ref3.apply(this, arguments);
      }

      return receiveMsg;
    }()
  }]);
  return SMSClient;
}();

module.exports = SMSClient;
