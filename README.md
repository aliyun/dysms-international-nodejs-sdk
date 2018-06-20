### 安装

``` javascript
 $ npm install @alicloud/international-sms-sdk --save
```

### Quick Start
1. please install @alicloud/international-sms-sdk,please read help documents for more parameters instructions
2. product doc: https://sms-intl.console.aliyun.com/
3. Node.js version >= v4.6.0

### Usage

``` javascript
/**
 * The is a DEMO that introduces how to use SMS send Api/SMS query Api/ SMS Delivery Report API.
 * Created on 2018-06-20
 */

const SMSClient = require('@alicloud/international-sms-sdk')

// AccessKey and AccessKeySecret , you can login sms console and find it in API Management
const accessKeyId = 'yourAccessKeyId'
const secretAccessKey = 'yourAccessKeySecret'

// Message Quenue Name, you can get it from SMS console, like:Alicom-Queue-xxxxxx-
const queueName = 'Alicom-Queue-xxxxxxxxxxxx-'

// initiate SMSClient
let smsClient = new SMSClient({accessKeyId, secretAccessKey})

// SMS Delivery Report
smsClient.receiveMsg(0, queueName).then(function (res) {
    let {code, body}=res
    if (code === 200) {
        //parse messagebody and please start your own code here
        console.log(body)
    }
}, function (err) {
    // The exception caused by your own code. Message will not be deleted and be pushed again
    console.log(err)
})

// query send detail
smsClient.queryDetail({
  PhoneNumber: '6281398007451',
  StartDate: '2018-06-20T00:00:23+0800',
  EndDate:'2018-06-20T11:59:23+0800',
  PageSize: '10',
  CurrentPage: "1",
  BizId:'102001029462841907^0',
}).then(function (res) {
  let {ResultCode, SmsSendDetailDTOs}=res
  if (ResultCode === 'OK') {
    // parse detail
    console.log('detail:', SmsSendDetailDTOs)
  }
}, function (err) {
  // parse error
  console.log(err)
})

// send sms
smsClient.sendSMS({
  PhoneNumbers: '6281398007000',
  ExternalId: 'E001203311',
  ContentCode: 'SMS_1000000',
  ContentParam: '{"smsContent":"nodejs-sdk"}'
}).then(function (res) {
  let {ResultCode}=res
  if (ResultCode === 'OK') {
    // parse res
    console.log('send sms:', res)
  }
}, function (err) {
  console.log('err:', err)
})
```
