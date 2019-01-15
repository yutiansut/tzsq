import { BitMEXWSAPI } from '../lib/BitMEX/BitMEXWSAPI'
import { createJSONSync } from './____API____'
import { keys } from 'ramda'

export class Account {
    jsonSync = createJSONSync()
    private ws: BitMEXWSAPI
    // private cookie: string
    // private accountName: string

    constructor(p: { accountName: string, cookie: string }) {
        // this.accountName = p.accountName
        // this.cookie = p.cookie

        this.ws = new BitMEXWSAPI(p.cookie, [
            { theme: 'margin' },
            { theme: 'position' },
            { theme: 'order' },
        ])
        this.ws.onmessage = frame => {
            if (frame.table === 'margin' && this.ws.data.margin.length > 0) {
                const { walletBalance } = this.ws.data.margin[0]
                const { wallet } = this.jsonSync.rawData
                if (wallet.length === 0 || wallet[wallet.length - 1].total !== walletBalance) {
                    this.jsonSync.data.wallet.____push({
                        time: new Date(this.ws.data.margin[0].timestamp).getTime(),
                        total: walletBalance
                    })
                }
            }
            else if (frame.table === 'position') {
                keys(this.jsonSync.rawData.symbol).forEach(symbol => {
                    const item = this.ws.data.position.find(v => v.symbol === symbol && v.isOpen)
                    const { 仓位数量, 开仓均价 } = this.jsonSync.data.symbol[symbol]
                    if (item !== undefined) {
                        仓位数量.____set(item.currentQty)
                        开仓均价.____set(item.avgCostPrice)
                    } else {
                        仓位数量.____set(0)
                        开仓均价.____set(0)
                    }
                })
            }
            else if (frame.table === 'order') {
                //委托列表
            }
        }
    }
}