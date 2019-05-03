import * as WebSocket from 'ws'
import { BaseType } from '../lib/BaseType'
import { Sampling } from '../lib/F/Sampling'
import { BinanceTradeAndOrderBook } from '../lib/____API____/TradeAndOrderBook/BinanceTradeAndOrderBook'
import { BitmexTradeAndOrderBook } from '../lib/____API____/TradeAndOrderBook/BitmexTradeAndOrderBook'
import { HopexTradeAndOrderBook } from '../lib/____API____/TradeAndOrderBook/HopexTradeAndOrderBook'
import { RealDataBase } from './RealDataBase'
import { CTPTradeAndOrderBook } from '../lib/____API____/TradeAndOrderBook/CTPTradeAndOrderBook'
import { FCoinTradeAndOrderBook } from '../lib/____API____/TradeAndOrderBook/FCoinTradeAndOrderBook'
import { IXTradeAndOrderBook } from '../lib/____API____/TradeAndOrderBook/IXTradeAndOrderBook'
import { BitfinexTradeAndOrderBook } from '../lib/____API____/TradeAndOrderBook/BitfinexTradeAndOrderBook'

export class RealData__Server extends RealDataBase {

    private wss?: WebSocket.Server
    private wsDic = new Map<WebSocket, boolean>()

    private bitmex = new BitmexTradeAndOrderBook()
    private binance = new BinanceTradeAndOrderBook()
    private ix = new IXTradeAndOrderBook()
    private bitfinex = new BitfinexTradeAndOrderBook()    
    private hopex = new HopexTradeAndOrderBook()
    private fcoin = new FCoinTradeAndOrderBook()

    _binance = false
    _bitmex = false
    _hopex = false
    _fcoin = false
    onTitle = (p: {
        binance: boolean
        bitmex: boolean
        hopex: boolean
        fcoin: boolean
    }) => { }

    private on着笔Dic = Object.create(null) as {
        [symbol: string]: Sampling<BaseType.KLine>
    }

    private on着笔(p: {
        key: string
        xxxxxxxx: {
            // 着笔: {
            //     ____push: (v: BaseType.着笔) => void
            // },
            data: {
                ____push: (v: BaseType.KLine) => void
                ____updateLast: (v: BaseType.KLine) => void
            },
            吃单情况: {
                ____get: () => {
                    买: {
                        价: number
                        被吃量: number
                    },
                    卖: {
                        价: number
                        被吃量: number
                    }
                }[]
                ____push: (v: {
                    买: {
                        价: number
                        被吃量: number
                    },
                    卖: {
                        价: number
                        被吃量: number
                    }
                }) => void
                ____updateLast: (v: {
                    买: {
                        价: number
                        被吃量: number
                    },
                    卖: {
                        价: number
                        被吃量: number
                    }
                }) => void
            },

        }
        timestamp: number
        side: BaseType.Side
        price: number
        size: number
        成交性质?: BaseType.成交性质Type
    }) {
        this.删除历史()

        const tick = Math.floor(p.timestamp / RealDataBase.单位时间)

        if (this.data.startTick === 0) {
            this.jsonSync.data.startTick.____set(tick)
        }

        //着笔
        //本地 ws 服务 才要
        // if (this.wsServer && p.key === 'bitmex_XBTUSD') {
        //     const { orderBook } = this.jsonSync.rawData.bitmex.XBTUSD
        //     if (orderBook.length > 0) {
        //         p.xxxxxxxx.着笔.____push({
        //             side: p.side,
        //             size: p.size,
        //             price: p.price,
        //             buy1: orderBook[orderBook.length - 1].buy.length > 0 ? orderBook[orderBook.length - 1].buy[0].price : NaN,
        //             sell1: orderBook[orderBook.length - 1].sell.length > 0 ? orderBook[orderBook.length - 1].sell[0].price : NaN,
        //             timestamp: p.timestamp,
        //         })
        //     }
        // }



        //吃单情况
        if (p.xxxxxxxx.吃单情况.____get().length === 0) {
            p.xxxxxxxx.吃单情况.____push({
                买: {
                    价: NaN,
                    被吃量: 0,
                },
                卖: {
                    价: NaN,
                    被吃量: 0,
                }
            })
        }

        //
        while (p.xxxxxxxx.吃单情况.____get().length < tick - this.jsonSync.rawData.startTick + 1) {
            const arr = p.xxxxxxxx.吃单情况.____get()
            p.xxxxxxxx.吃单情况.____push(arr[arr.length - 1])
        }

        //
        const arr = p.xxxxxxxx.吃单情况.____get()
        const item = {
            买: {
                价: arr[arr.length - 1].买.价,
                被吃量: arr[arr.length - 1].买.被吃量,
            },
            卖: {
                价: arr[arr.length - 1].卖.价,
                被吃量: arr[arr.length - 1].卖.被吃量,
            }
        }
        const xx = p.side === 'Sell' ? item.买 : item.卖
        if (xx.价 !== p.price) xx.被吃量 = 0
        xx.被吃量 += p.size
        xx.价 = p.price
        p.xxxxxxxx.吃单情况.____updateLast(item)





        //500ms
        if (this.on着笔Dic[p.key] === undefined) {
            this.on着笔Dic[p.key] = new Sampling<BaseType.KLine>({
                open: '开',
                high: '高',
                low: '低',
                close: '收',
                buySize: '累加',
                buyCount: '累加',
                sellSize: '累加',
                sellCount: '累加',
                成交性质: '收',
            })

            this.on着笔Dic[p.key].onNew2 = item => p.xxxxxxxx.data.____push(item)
            this.on着笔Dic[p.key].onUpdate2 = item => p.xxxxxxxx.data.____updateLast(item)
            this.on着笔Dic[p.key].in2({
                id: this.data.startTick,
                open: NaN,
                high: NaN,
                low: NaN,
                close: NaN,
                //
                buySize: 0,
                buyCount: 0,
                sellSize: 0,
                sellCount: 0,
                成交性质: '不知道',
            })
        }

        this.on着笔Dic[p.key].in2({
            id: tick,
            open: p.price,
            high: p.price,
            low: p.price,
            close: p.price,
            buySize: p.side === 'Buy' ? p.size : 0,
            buyCount: p.side === 'Buy' ? 1 : 0,
            sellSize: p.side === 'Sell' ? p.size : 0,
            sellCount: p.side === 'Sell' ? 1 : 0,
            成交性质: p.成交性质,
        })
    }

    private on盘口Dic = Object.create(null) as {
        [symbol: string]: Sampling<BaseType.OrderBook>
    }

    private on盘口(p: {
        key: string
        xxxxxxxx: {
            ____push: (v: BaseType.OrderBook) => void
            ____updateLast: (v: BaseType.OrderBook) => void
        }
        timestamp: number
        orderBook: BaseType.OrderBook
    }) {
        this.删除历史()
        const tick = Math.floor(p.timestamp / RealDataBase.单位时间)

        if (this.data.startTick === 0) {
            this.jsonSync.data.startTick.____set(tick)
        }

        if (this.on盘口Dic[p.key] === undefined) {
            this.on盘口Dic[p.key] = new Sampling<BaseType.OrderBook>({
                buy: '最新',
                sell: '最新',
            })
            this.on盘口Dic[p.key].onNew2 = item => p.xxxxxxxx.____push(item)
            this.on盘口Dic[p.key].onUpdate2 = item => p.xxxxxxxx.____updateLast(item)
            this.on盘口Dic[p.key].in2({
                id: this.data.startTick,
                buy: [],
                sell: [],
            })
        }

        this.on盘口Dic[p.key].in2(p.orderBook)
    }

    private ctp = new CTPTradeAndOrderBook()

    // private wsServer: boolean

    constructor(wsServer = true) {
        super()

        // this.wsServer = wsServer

        this.重新初始化()//<-----------fix 


        if (wsServer) {
            this.wss = new WebSocket.Server({ port: 6666 })
        }

        const onTitle = () => this.onTitle({
            binance: this._binance,
            bitmex: this._bitmex,
            hopex: this._hopex,
            fcoin: this._fcoin,
        })


        this.bitmex.statusObservable.subscribe(v => {
            this._bitmex = v.isConnected
            onTitle()
        })


        this.binance.statusObservable.subscribe(v => {
            this._binance = v.isConnected
            onTitle()
        })

        this.hopex.statusObservable.subscribe(v => {
            this._hopex = v.isConnected
            onTitle()
        })


        this.fcoin.statusObservable.subscribe(v => {
            this._fcoin = v.isConnected
            onTitle()
        })


        //runServer
        if (this.wss !== undefined) {
            this.wss.on('connection', ws => {
                try {
                    ws.send(JSON.stringify({
                        path: [],
                        value: this.data
                    }))
                } catch (error) {

                }
                this.wsDic.set(ws, true)
                ws.onerror = ws.onclose = () => this.wsDic.delete(ws)
            })
        }

        this.jsonSync.subject.subscribe(
            op => {
                const str = JSON.stringify(op)
                this.wsDic.forEach((_, ws) => {
                    try { ws.send(str) } catch (error) { }
                })

                //const d = this.dataExt.XBTUSD.期货.信号_下跌
                //console.log(d.length, d.length > 0 ? d[d.length - 1].map(v => v.value ? 'O' : '_').join('') : '')
            }
        )

        //
        this.ctp.run()
        this.ctp.tradeObservable.subscribe(({ symbol, timestamp, side, size, price, 成交性质 }) => {
            //if (symbol === 'rb1910')
            this.on着笔({
                key: 'ctp_' + symbol,
                xxxxxxxx: this.jsonSync.data.ctp[symbol as 'rb1910'],
                timestamp,
                side: side as BaseType.Side,
                size,
                price,
                成交性质,
            })
        })

        this.ctp.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            ``
            //if (symbol === 'rb1910')
            this.on盘口({
                key: 'ctp_' + symbol,
                xxxxxxxx: this.jsonSync.data.ctp[symbol as 'rb1910'].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })
        })


        //run期货
        this.bitmex.tradeObservable.subscribe(({ symbol, timestamp, side, size, price }) => {
            this.on着笔({
                key: 'bitmex_' + symbol,
                xxxxxxxx: this.jsonSync.data.bitmex[symbol],
                timestamp,
                side: side as BaseType.Side,
                size,
                price,
            })
        })

        this.bitmex.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                key: 'bitmex_' + symbol,
                xxxxxxxx: this.jsonSync.data.bitmex[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })
        })

        this.binance.tradeObservable.subscribe(({ symbol, timestamp, price, side, size }) => {
            this.on着笔({
                key: 'binance_' + symbol,
                xxxxxxxx: this.jsonSync.data.binance[symbol],
                timestamp,
                price,
                side,
                size,
            })
        })


        this.binance.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                key: 'binance_' + symbol,
                xxxxxxxx: this.jsonSync.data.binance[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })

        })


        //ix
        this.ix.tradeObservable.subscribe(({ symbol, timestamp, price, side, size }) => {
            this.on着笔({
                key: 'ix_' + symbol,
                xxxxxxxx: this.jsonSync.data.ix[symbol],
                timestamp,
                price,
                side,
                size,
            })
        })


        this.ix.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                key: 'ix_' + symbol,
                xxxxxxxx: this.jsonSync.data.ix[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })

        })


        //bitfinex
        this.bitfinex.tradeObservable.subscribe(({ symbol, timestamp, price, side, size }) => {
            this.on着笔({
                key: 'bitfinex_' + symbol,
                xxxxxxxx: this.jsonSync.data.bitfinex[symbol],
                timestamp,
                price,
                side,
                size,
            })
        })


        this.bitfinex.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                key: 'bitfinex_' + symbol,
                xxxxxxxx: this.jsonSync.data.bitfinex[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })
        })



        //

        this.hopex.tradeObservable.subscribe(({ symbol, timestamp, price, side, size }) => {
            this.on着笔({
                key: 'hopex_' + symbol,
                xxxxxxxx: this.jsonSync.data.hopex[symbol],
                timestamp,
                price,
                side,
                size,
            })
        })


        this.hopex.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                key: 'hopex_' + symbol,
                xxxxxxxx: this.jsonSync.data.hopex[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })
        })



        this.fcoin.tradeObservable.subscribe(({ symbol, timestamp, price, side, size }) => {
            this.on着笔({
                key: 'fcoin_' + symbol,
                xxxxxxxx: this.jsonSync.data.fcoin[symbol],
                timestamp,
                price,
                side,
                size,
            })
        })


        this.fcoin.orderBookObservable.subscribe(({ symbol, timestamp, buy, sell }) => {
            this.on盘口({
                key: 'fcoin_' + symbol,
                xxxxxxxx: this.jsonSync.data.fcoin[symbol].orderBook,
                timestamp,
                orderBook: {
                    id: Math.floor(timestamp / RealDataBase.单位时间),
                    buy,
                    sell,
                }
            })
        })


    }
}