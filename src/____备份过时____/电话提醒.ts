import * as request from 'request'
import { compose } from 'ramda'
import { typeObjectParse } from '../lib/F/typeObjectParse'
import { safeJSONParse } from '../lib/F/safeJSONParse'
import { queryStringStringify } from '../lib/F/queryStringStringify'

const parse1 = compose(typeObjectParse({ count: 0 }), safeJSONParse)

const 电话提醒XX = () => new Promise<boolean>(resolve =>
    request({
        url: 'https://voice.yunpian.com/v2/voice/send.json',
        method: 'POST',
        headers: {
            'Accept': 'application/json;charset=utf-8',
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        body: queryStringStringify({
            apikey: '53797beb6d1ccbd8bf5dee7bc3ebf8f2',
            mobile: '18610441417',
            code: '1234'
        })
    }, (error, response, body) =>
            resolve(parse1(body).count >= 1)
    )
)


export const 电话提醒 = async () => {
    for (let i = 0; i < 3; i++) {
        console.log('电话提醒' + i)
        if (await 电话提醒XX()) {
            console.log('电话提醒成功')
            return
        }
    }
    console.log('电话提醒失败')
}