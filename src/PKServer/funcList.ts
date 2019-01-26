import { BaseType } from '../lib/BaseType'

export const funcList = {

    getBitmex500msOrderBook: {
        req: {
            symbol: '' as BaseType.BitmexSymbol,
            startTime: 0,
            endTime: 0
        },
        res: [{
            id: 0,
            buy: [{
                price: 0,
                size: 0,
            }],
            sell: [{
                price: 0,
                size: 0,
            }],
        }]
    }
}