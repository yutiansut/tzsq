import { chartInit, layer } from './lib/Chart'
import { KLineLayer } from './lib/Chart/Layer/KLineLayer'
import { formatDate } from './lib/F/formatDate'
import { timeID } from './lib/F/timeID'
import { theme } from './lib/Chart/theme'
import { toRange } from './lib/F/toRange'
import { HopexRealKLineBase } from './RealDataServer/HopexRealKLine'
import { 指标 } from './指标/指标'
import { LineLayer } from './lib/Chart/Layer/LineLayer'
import { BarLayer } from './lib/Chart/Layer/BarLayer'


export const RealKLineChart = (element: HTMLElement, real: HopexRealKLineBase, tmp?: () => any) => {

    const timeArr = 指标.map(() => real.kline.length, i => new Date(timeID._60s.toTimestamp(real.kline[i].id)).toLocaleString())

    const close = 指标.map(() => real.kline.length, i => real.kline[i].close)
    const M5 = 指标.SMA(close, 5, 1000)
    const M10 = 指标.SMA(close, 10, 1000)
    const M25 = 指标.SMA(close, 25, 1000)
    const M50 = 指标.SMA(close, 50, 1000)
    const macd = 指标.macd(close, 1000)


    let left = 200
    let right = 300
    let isDown = false
    let startX = 0
    let startLeft = 0
    let startRight = 0

    real.onFirstLoad = () => {
        left = Math.max(0, real.kline.length - 100)
        right = real.kline.length
    }

    chartInit(60, element, () => {

        const kline = real.kline

        //跟踪
        if (isDown === false && right < kline.length + 5) {
            left = left - ((kline.length + 5) - right)
            right = kline.length + 5
        }

        if (tmp) {
            const x = tmp()
            if (x) return x
        }

        return {
            xStrArr: timeArr,
            显示y: v => {
                const time = (kline[0] ? timeID._60s.toTimestamp(kline[0].id) : 0) + v * 1000 * 60
                if (time % (3600000 * 24) === 0) {
                    return formatDate(new Date(time), v => `${v.d}号`)
                } else {
                    return undefined
                }
            },
            left: left,
            right: right,
            items: {
                heightList: [0.6, 0.4],
                items: [
                    {
                        layerList: [
                            layer(KLineLayer, { data: kline }),
                            //layer(笔Layer, { data: get笔Index(kline), color: 0xffff00 }),
                            //layer(线段Layer, { data: get线段(get笔Index(kline)), color: 0xaa0000 }),
                            layer(LineLayer, { data: M5, color: 0x666666 }),
                            layer(LineLayer, { data: M10, color: 0x666666 }),
                            layer(LineLayer, { data: M25, color: 0xffffff }),
                            layer(LineLayer, { data: M50, color: 0xffffff }),
                        ]
                    },
                    {
                        layerList: [
                            layer(LineLayer, { data: macd.DIF, color: 0xffff00 }),
                            layer(LineLayer, { data: macd.DEM, color: 0xaaaa00 }),
                            layer(BarLayer, { data: macd.OSC, color: 0xeeeeee }),
                        ]
                    },
                ]
            }
        }
    })


    const xx = () => {
        const 多出 = 12

        left = toRange({ min: -多出, max: real.kline.length - 多出, value: left })

        if (right <= left + 多出) {
            right = left + 多出
        }

        right = toRange({ min: 多出, max: real.kline.length + 多出, value: right })
    }


    window.onmousewheel = (e: any) => {

        const count = right - left
        const d = e['wheelDelta'] / 120 * (count * 0.05)

        const n = startX / (document.body.clientWidth - theme.RIGHT_WIDTH)


        left += d * n
        right -= d * (1 - n)

        xx()

        startX = e['clientX']
        startLeft = left
        startRight = right
    }

    window.onmousedown = e => {
        if (e.button === 0) {
            isDown = true
            startX = e.clientX
            startLeft = left
            startRight = right
        }
    }

    window.onmouseup = e => {
        if (e.button === 0) {
            isDown = false
        }
    }

    window.onmousemove = e => {
        if (isDown) {
            left = startLeft - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
            right = startRight - (startRight - startLeft) * (e.clientX - startX) / (document.body.clientWidth - theme.RIGHT_WIDTH)
            xx()
        }
    }
}