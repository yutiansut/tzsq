// import * as request from 'request'
// import { compose } from 'ramda'
// import { F } from '../lib/F'

// const parse1 = compose(F.typeObjectParse({ errcode: -1 }), F.safeJSONParse)

// const send = (msg: string, access_token: string) => new Promise((resolve, reject) => {
//     request({
//         url: 'https://qyapi.weixin.qq.com/cgi-bin/message/send?' + F.queryStringStringify({
//             access_token
//         }),
//         method: 'POST',
//         body: JSON.stringify({
//             touser: 'LiuXiaoTian|ChuSheng',
//             msgtype: 'text',
//             agentid: '1000002',
//             text: {
//                 content: new Date().toLocaleString() + ' ' + msg
//             },
//             safe: 0
//         })
//     }, (error, response, body) => {
//         if (parse1(body).errcode == 0) {
//             resolve()
//         } else {
//             reject()
//         }
//     })
// })


// const parse2 = compose(F.typeObjectParse({ access_token: '' }), F.safeJSONParse)

// let last_access_token = ''
// const get_access_token = () => new Promise<string>(resolve => {
//     request({
//         url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=wwc6b445c44248da60&corpsecret=qTJ33JtqG1qJk5Au7BLNY-TSHn8rqk4KlyfOttQFzmo',
//         method: 'GET'
//     }, (error, response, body) => {
//         resolve(parse2(body).access_token)
//     })
// })

// export const 企业微信提醒 = async (msg: string, times = 0) => {
//     console.log(msg)

//     try {
//         if (last_access_token == '') {
//             last_access_token = await get_access_token()
//         }

//         const success = await send(msg, last_access_token)
//         if (success == false) {
//             last_access_token = await get_access_token()
//             await send(msg, last_access_token)
//         }
//     } catch (e) {
//         console.log('wechatNotify error ' + e)

//         //重试3次
//         if (times < 3) {
//             setTimeout(() => {
//                 企业微信提醒(msg, times + 1)
//             }, 100)
//         }
//     }
// }  