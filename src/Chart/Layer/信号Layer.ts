import { Graphics, Container } from 'pixi.js'
import { Viewport, To } from '../type'
import { Layer } from './Layer'
import { BitmapText } from '../BitmapText'
import { range } from 'ramda'

export class 信号Layer extends Layer<{ data: ArrayLike<{ name: string, value: boolean, color?: number }[]>, color: number }> {

    private g = new Graphics()
    private textArr: BitmapText[] = []
    private textContainer = new Container()

    init() {
        this.addChild(this.g)
        this.addChild(this.textContainer)
        range(0, 200).forEach(() => {
            let text = new BitmapText({
                fontSize: 20,
                fill: 0xaaaaaa,
                anchor: { x: 0, y: 0.5 }
            })
            this.textContainer.addChild(text)
            this.textArr.push(text)
        })
    }

    render(viewport: Viewport, to: To) {
        const { g } = this

        //clear
        let III = 0
        this.textArr.forEach(v => v.visible = false)
        g.clear()

        const { left, right, width, height } = viewport

        const { data, color } = this.props

        if (data.length === 0) return

        const strArr = data[0].map(v => v.name)
        const oneH = height / strArr.length


        //
        strArr.forEach((v, i) => {
            let text = this.textArr[III]
            III += 1
            text.text = v
            text.x = width + 5
            text.y = oneH * (i + 0.5)
            text.visible = true
        })

        for (let i = Math.max(0, Math.floor(left)); i <= Math.min(Math.round(right), data.length - 1); i++) {
            const x = to.x(i)
            for (let j = 0; j < strArr.length; j++) {
                if (data[i][j].value) {
                    if (data[i][j].color !== undefined) {
                        g.lineStyle(1, data[i][j].color)
                    } else {
                        g.lineStyle(1, color)
                    }
                    g.moveTo(x, oneH * j)
                    g.lineTo(x, oneH * (j + 1))
                }
            }
        }
    }

    getRight() {
        return this.props.data.length - 1
    }
} 