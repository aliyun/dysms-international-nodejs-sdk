/**
 * Copyright(c) Alibaba Group Holding Limited.
 *
 * @file:     sms-sdk
 * @authors:  qiankun <chuck.ql@alibaba-inc.com> (https://work.alibaba-inc.com/work/u/85053)
 * @date      18/6/20
 */

'use strict';
const DysmsapiClient = require('@alicloud/dysmsapi-2018-05-01')
const DybaseapiClient = require('@alicloud/dybaseapi-2018-05-01')
const MNSClient = require('@alicloud/mns')
// Message Type, there is only two type: smsreport, upmessage
const msgTypeList = ["SmsReport", "SmsUp"]
const DYSMSAPI_ENDPOINT = 'http://dysmsapi.ap-southeast-1.aliyuncs.com'
const DYBASEAPI_ENDPOINT = 'http://dybaseapi.ap-southeast-1.aliyuncs.com'

function hasOwnProperty(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

class SMSClient {
  constructor(options) {
    let {accessKeyId, secretAccessKey} = options
    if (!accessKeyId) {
      throw new TypeError('parameter "accessKeyId" is required')
    }
    if (!secretAccessKey) {
      throw new TypeError('parameter "secretAccessKey" is required')
    }
    this.dysmsapiClient = new DysmsapiClient({accessKeyId, secretAccessKey, endpoint: DYSMSAPI_ENDPOINT})
    this.dybaseClient = new DybaseapiClient({accessKeyId, secretAccessKey, endpoint: DYBASEAPI_ENDPOINT})
    this.expire = []
    this.mnsClient = []
  }


  // send message
  sendSMS(params) {
    return this.dysmsapiClient.sendSms(params)
  }

  // query detail
  queryDetail(params) {
    return this.dysmsapiClient.querySendDetails(params)
  }

  // refresh token
  _refresh(type) {
    return this.expire[type] - new Date().getTime() > 2 * 60 * 1000
  }

  //get token
  _getToken(type) {
    let msgType = msgTypeList[type]
    return this.dybaseClient.queryTokenForMnsQueue({MessageType: msgType})
  }

  //get mnsclient instance by type
  async _getMNSClient(type) {
    if (this.mnsClient && (this.mnsClient[type] instanceof MNSClient) && this._refresh(type)) {
      return this.mnsClient[type]
    }
    let {
      MessageTokenDTO: {
        SecurityToken,
        AccessKeyId,
        AccessKeySecret
      }
    } = await this._getToken(type)
    if (!(AccessKeyId && AccessKeySecret && SecurityToken)) {
      throw new TypeError('get token fail')
    }
    let mnsClient = new MNSClient('1493622401794734', {
      securityToken: SecurityToken,
      region: 'ap-southeast-1',
      accessKeyId: AccessKeyId,
      accessKeySecret: AccessKeySecret,
      // optional & default
      secure: false, // use https or http
      internal: false, // use internal endpoint
      vpc: false // use vpc endpoint
    })
    this.mnsClient[type] = mnsClient
    this.expire[type] = (new Date().getTime() + 10 * 60 * 1000)
    return mnsClient
  }

  // typeIndex, there is only two type: 0:smsreport, 1:upmessage
  async receiveMsg(typeIndex = 0, preQueueName, waitSeconds = 10) {
    let mnsClient = await this._getMNSClient(typeIndex)
    return await mnsClient.receiveMessage(preQueueName + msgTypeList[typeIndex], waitSeconds)
  }
}

module.exports = SMSClient




