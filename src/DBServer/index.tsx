import * as Sequelize from 'sequelize'
import { JSONRPCServer } from '../lib/C/JSONRPC'
import { BaseType } from '../lib/BaseType'
import { funcList } from './funcList'
import { DB } from './DB'
import { syncBinanceTrades } from './syncBinanceTrades'
import { syncBitmex500msOrderBook } from './syncBitmex500msOrderBook'
import { syncBinance1M } from './syncBinance1M'
import { timeID } from '../lib/F/timeID'
import { syncBitmex500msKLine } from './syncBitmex500msKLine'
import { syncBitmex1M } from './syncBitmex1M'

//采集
syncBitmex500msOrderBook()
syncBitmex500msKLine('XBTUSD')
syncBitmex500msKLine('ETHUSD')

syncBitmex1M('XBTUSD')
syncBitmex1M('ETHUSD')

syncBinanceTrades('btcusdt', 64975394)
syncBinanceTrades('ethusdt', 38096146)

syncBinance1M('btcusdt')
syncBinance1M('ethusdt')



//
const server = new JSONRPCServer({
    funcList,
    port: 5555
})

server.func.getKLine = async req => {
    const timeFunc = req.type === '1m' ? timeID.timestampToOneMinuteID : timeID.timestampTo500msID
    const retData = await DB.getKLine(req.type, req.symbol).findAll<{}>({
        raw: true,
        where: {
            id: {
                [Sequelize.Op.gte]: timeFunc(req.startTime),
                [Sequelize.Op.lte]: timeFunc(req.endTime),
            }
        },
        order: ['id'],
    }) as BaseType.KLine[]
    return retData
}

server.func.getBinanceTick = async req => {
    const retData = await DB.getTrades(req.symbol).findAll<{}>({
        raw: true,
        where: {
            timestamp: {
                [Sequelize.Op.gte]: req.startTime,
                [Sequelize.Op.lte]: req.endTime
            }
        },
        order: ['id'],
    }) as BaseType.Trade[]
    return retData
}

server.func.getBitmex500msOrderBook = async req => {
    const arr = await DB.getBitmex500msOrderBook(req.symbol).findAll<{}>({
        raw: true,
        where: {
            id: {
                [Sequelize.Op.gte]: timeID.timestampTo500msID(req.startTime),
                [Sequelize.Op.lte]: timeID.timestampTo500msID(req.endTime),
            }
        },
        order: ['id'],
    })
    return arr.map(v => ({
        id: v.id,
        buy: [
            {
                price: v.buy1_price,
                size: v.buy1_size,
            },
            {
                price: v.buy2_price,
                size: v.buy2_size,
            },
            {
                price: v.buy3_price,
                size: v.buy3_size,
            },
            {
                price: v.buy4_price,
                size: v.buy4_size,
            },
            {
                price: v.buy5_price,
                size: v.buy5_size,
            },
        ],
        sell: [
            {
                price: v.sell1_price,
                size: v.sell1_size,
            },
            {
                price: v.sell2_price,
                size: v.sell2_size,
            },
            {
                price: v.sell3_price,
                size: v.sell3_size,
            },
            {
                price: v.sell4_price,
                size: v.sell4_size,
            },
            {
                price: v.sell5_price,
                size: v.sell5_size,
            },
        ],
    }))
}