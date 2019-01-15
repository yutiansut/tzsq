import * as fs from 'fs'
import * as R from 'ramda'
import { JSONRequest } from '../C/JSONRequest'
import { config } from '../../config'

const BR = '\n'
const BR2 = BR + BR
const TAB = '    '
const TAB2 = TAB + TAB
const TAB3 = TAB + TAB + TAB
const repeatTAB = R.compose(R.join(''), R.repeat(TAB))

const getTypeString = (obj: any, tab = 1): string => {

    const type: string = obj.type ? obj.type : 'BitMEXMessage.' + R.last(obj.$ref.split('/'))

    if (type === 'BitMEXMessage.x-any') {
        return 'any'
    }
    else if (type === 'object') {
        if (tab === 0) {
            const arr = R.toPairs(obj.properties)
            return arr.length === 0 ? '{}' : `{ ${arr.map(obj => obj[0] + ': ' + getTypeString(obj[1], tab + 1)).join('')} }`
        } else {
            return '{' +
                R.toPairs(obj.properties)
                    .map(obj => '\n' + repeatTAB(tab + 1) + obj[0] + ': ' + getTypeString(obj[1], tab + 1)).join('')
                + '\n' + repeatTAB(tab) + '}'
        }
    }
    else if (type === 'array') {
        return getTypeString(obj.items, tab) + '[]'
    }
    else {
        const s = (obj.format ? ' format:' + obj.format : '') + (obj.description ? ' description:' + obj.description : '')
        return type + (s ? ' /*' + s + '*/' : '')
    }
}


const xx = (v: { description: string, type: string }) => {
    const xx = (v.description || '').match(/Valid options:.*?\./g)
    const yy = (v.description || '').match(/Available options:.*?\]/g)
    if (xx && xx[0]) {
        const type = (xx[0] as string).replace('Valid options:', '').replace(/[ \.]+/g, '').split(',').map(v => `'${v}'`).join(' | ')
        return `(${type}) | (${type})[]`
    }
    else if (yy && yy[0]) {
        const type = (yy[0] as string).replace('Available options:', '').replace(/[ \[\]]+/g, '').split(',').map(v => `'${v}'`).join(' | ')
        return type
    } else {
        return v.type as string
    }
}

const getReqTypeString = (arr: any[]) =>
    arr.length === 0 ? '{}' : `{${arr.map(v => `${BR}${TAB3}${v.name}${(v.required ? '' : '?')}: ${xx(v)} /* '${v.format || ''}'  ${v.description || ''}*/`).join('')}${BR}${TAB2}}`


const getResTypeString = (obj: any) => getTypeString(obj.schema, 0)


const run = async () => {

    const swagger = (await JSONRequest<any>({
        url: `https://www.bitmex.com/api/explorer/swagger.json`,
        ss: config.ss
    })).data

    if (swagger === undefined) {
        console.log('swagger is undefined')
        return
    }

    let dic: any = {}
    R.toPairs(swagger.paths).map((_: any) => {
        R.toPairs(_[1]).map((obj: any) => {
            const item = obj[1]
            const arr = item.operationId.split('.')
            const a = arr[0]
            const b = arr[1]
            if (dic[a] === undefined) {
                dic[a] = {}
            }
            dic[a][b] = {
                reqType: getReqTypeString(item.parameters),
                resType: getResTypeString(item.responses['200']),
                path: _[0],
                method: (obj[0] + '').toUpperCase()
            }
        })
    })



    fs.writeFileSync('./src/lib/BitMEX/BitMEXMessage.ts', `
//greate by https://www.bitmex.com/api/explorer/swagger.json

export namespace BitMEXMessage {${
        R.toPairs(swagger.definitions).filter(obj => obj[0] !== 'x-any' && obj[0] !== 'Error').map((obj: any) =>
            `${BR2}${TAB}export interface ${obj[0]} ${getTypeString(obj[1])}`
        ).join('')
        }
}`)


    fs.writeFileSync('./src/lib/BitMEX/BitMEXRESTAPI.ts', `
//greate by https://www.bitmex.com/api/explorer/swagger.json

import { BitMEXMessage } from './BitMEXMessage'
import { BitMEXRESTAPI__http } from './BitMEXRESTAPI__http'

export const BitMEXRESTAPI = {${
        R.toPairs(dic).map((tag: any) =>
            `${BR2}${TAB}${tag[0]}: {${
            R.toPairs(tag[1]).map((v: any) =>
                `${BR2}${TAB2}${v[0]}: (cookie: string, req: ${v[1].reqType}) => BitMEXRESTAPI__http<${v[1].resType}>({ cookie, method: '${v[1].method}', path: '/api/v1${v[1].path}', req })`
            )}
    }`).join(',')}
}`)
}

run()