import * as React from 'react'
import { DataClient } from './RealDataServer/DataClient'
import { lastNumber } from './F/lastNumber'
import { mapObjIndexed } from './F/mapObjIndexed'
import { dialog } from './UI/dialog'

const dic = new Map<string, number>()

//同一个id一分钟内 只提醒一次
const speak = (msg: string, id: string) => {

    const n = dic.get(id)
    if (n !== undefined && Date.now() - n < 60 * 1000) {
        // console.log(new Date().toLocaleString(), '没有提醒', '同一个id一分钟内 只提醒一次', JSON.stringify({ body: msg }))
        return
    } else {
        console.log(new Date().toLocaleString(), '提醒', JSON.stringify({ body: msg }))
    }

    dic.set(id, Date.now())
    speechSynthesis.speak(new SpeechSynthesisUtterance(msg))
    // new Notification('提醒', { body: msg })
}

export const realTickClient = new DataClient.RealData__Client()

export class 提醒 extends React.Component {

    dic: { [key: string]: number } = Object.create(null)
    小于等于 = 1000
    中线小于等于 = 1000
    关键点小于等于 = 1000
    大于等于 = 20000
    中线大于等于 = 20000
    关键点大于等于 = 20000

    setAndSpeak(str: string, v: number, f: (v: number) => boolean) {
        this.dic[str] = v
        if (f(v)) {
            speak(`${str}, ${v.toFixed(2)}`, str)
        }
    }

    step = () => {
        //_______________________________布林带提醒_______________________________  

        const hopex收盘价 = lastNumber(realTickClient.dataExt.hopex.BTCUSDT.收盘价)


        this.setAndSpeak(
            '价格 大于等于 ' + this.大于等于,
            0,
            v => hopex收盘价 >= this.大于等于
        )
        this.setAndSpeak(
            '中线价格 大于等于 ' + this.中线大于等于,
            0,
            v => hopex收盘价 >= this.中线大于等于
        )
        this.setAndSpeak(
            '关键点大于等于 大于等于 ' + this.关键点大于等于,
            0,
            v => hopex收盘价 >= this.关键点大于等于
        )

        this.setAndSpeak(
            '价格 小于等于 ' + this.小于等于,
            0,
            v => hopex收盘价 <= this.小于等于
        )
        this.setAndSpeak(
            '中线小于等于价格 小于等于 ' + this.中线小于等于,
            0,
            v => hopex收盘价 <= this.中线小于等于
        )
        this.setAndSpeak(
            '关键点小于等于 小于等于 ' + this.关键点小于等于,
            0,
            v => hopex收盘价 <= this.关键点小于等于
        )

       

        //________________________________________________________________________

        // if (realTickClient.dataExt.XBTUSD.提醒.length > 0) {
        //     const arr = realTickClient.dataExt.XBTUSD.提醒[realTickClient.dataExt.XBTUSD.提醒.length - 1]
        //     arr.forEach(v => {
        //         this.setAndSpeak(
        //             v.name,
        //             0,
        //             xxx => v.value,
        //         )
        //     })
        // }

        //________________________________________________________________________




        const volum = realTickClient.get期货多少秒内成交量__万为单位('XBTUSD', 15)
        const 波动率 = lastNumber(realTickClient.dataExt.bitmex.XBTUSD.价格_波动率30)
        this.setAndSpeak(
            '比 特 币 成交量',
            volum,
            v => volum > 500 && 波动率 >= 0.1
        )
        const 买盘 = lastNumber(realTickClient.dataExt.bitmex.XBTUSD.买.盘口)
        const 卖盘 = lastNumber(realTickClient.dataExt.bitmex.XBTUSD.卖.盘口)
        this.setAndSpeak(
            '比 特 币 盘口大量',
            volum,
            v => 买盘 > 2000 * 10000 || 卖盘 > 2000 * 10000

        )


        this.forceUpdate()
    }

    componentWillMount() {
        const f = () => {
            requestAnimationFrame(f)
            this.step()
        }
        f()
    }

    render() {
        return <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
            <a
                style={{ fontSize: 20, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: '<=',
                        value: this.小于等于 + '',
                        onOK: v => {
                            this.小于等于 = Number(v)
                        }
                    })
                }}
            >
                {`超短小于 ${this.小于等于}`}
            </a>
            <br />
            <a
                style={{ fontSize: 20, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: '<=',
                        value: this.中线小于等于 + '',
                        onOK: v => {
                            this.中线小于等于 = Number(v)
                        }
                    })
                }}
            >
                {`中线小于 <= ${this.中线小于等于}`}
            </a>
            <br />
            <a
                style={{ fontSize: 20, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: '<=',
                        value: this.关键点小于等于 + '',
                        onOK: v => {
                            this.关键点小于等于 = Number(v)
                        }
                    })
                }}
            >
                {`关键点小于 ${this.关键点小于等于}`}
            </a>
            <br />
            <a
                style={{ fontSize: 20, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: '>=',
                        value: this.大于等于 + '',
                        onOK: v => {
                            this.大于等于 = Number(v)
                        }
                    })
                }}
            >
                {`超短大于 ${this.大于等于}`}
            </a>
            <br />
            <a
                style={{ fontSize: 20, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: '>=',
                        value: this.中线大于等于 + '',
                        onOK: v => {
                            this.中线大于等于 = Number(v)
                        }
                    })
                }}
            >
                {`中线大于 ${this.中线大于等于}`}
            </a>
            <br />
            <a
                style={{ fontSize: 20, color: 'yellow' }}
                href='#'
                onClick={() => {
                    dialog.showInput({
                        title: '>=',
                        value: this.关键点大于等于 + '',
                        onOK: v => {
                            this.关键点大于等于 = Number(v)
                        }
                    })
                }}
            >
                {`关键点大于 ${this.关键点大于等于}`}
            </a>

            <pre style={{ fontSize: 20, color: 'white' }}>
                {JSON.stringify(mapObjIndexed(v => v.toFixed(2), this.dic), undefined, 4)}
            </pre>
        </div>
    }
}
