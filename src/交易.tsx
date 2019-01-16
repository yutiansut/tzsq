import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { style } from 'typestyle'
import { OrderClient } from './OrderServer/OrderClient'
import { config } from './config'
import { getAccountName } from './ConfigType'
import { Switch } from '@material-ui/core'
import { JSONRequestError } from './lib/C/JSONRequest'
import { dialog } from './lib/UI/dialog'
import none from 'ramda/es/none'

const cookie = config.account![getAccountName()].cookie
const orderClient = new OrderClient(cookie)
const d = () => orderClient.jsonSync.rawData.symbol.XBTUSD
const rpc = OrderClient.rpc.func

    ; (window as any)['d'] = d


const boxButton = style({
    margin: 'auto auto',
    width: '150px',
    height: '36px',
    lineHeight: '36px',
    borderRadius: '2px 2px 2px 2px',
    fontSize: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    $nest: {
        '&:active': {
            boxShadow: '2px 2px 2px #999 inset'
        }
    }
})


class Table extends React.Component<{

    side: string

}, {}> {

    componentWillMount() {

    }
    render() {
        return <table style={{
            width: '150px',
            margin: '15px auto',
        }}
        >
            <tbody>
                {d().活动委托.filter(v => v.side === this.props.side).map((v, i) =>
                    <tr key={v.id}

                        style={{
                            fontSize: '20px',
                            width: '100%',
                            color: v.type === '限价只减仓' ?
                                'rgba(255, 239, 85, 1)'
                                : v.type === '止损' ?
                                    this.props.side === 'Buy' ? 'rgba(229, 101, 70, 1)' : 'rgba(72, 170, 101, 1)'
                                    : this.props.side === 'Buy' ? 'rgba(72, 170, 101, 1)' : 'rgba(72, 170, 101, 1)'
                        }}>
                        <td style={{ width: '50%' }}>{v.price}</td>
                        <td style={{ width: '35%' }}>{v.size}</td>
                        <td style={{ width: '15%', display: 'none' }} >
                            <Button                  
                                bgColor='#24292d'
                                text='X'
                                width='100%'
                                func={() => rpc.取消委托({ cookie, orderID: [v.id] })} />
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    }
}


class Button extends React.Component<{

    bgColor: string
    text: string
    width?: string
    func: () => Promise<{
        error?: JSONRequestError
        data?: boolean
        msg?: string
    }>
}, { loading: boolean }> {

    componentWillMount() {
        this.setState({ loading: false })
    }

    callFunc() {
        this.setState({ loading: true })
        this.props.func().then(({ error, msg, data }) => {
            if (error !== undefined) {
                dialog.showMessageBox({
                    title: error,
                    contentText: msg !== undefined ? msg : '',
                })
            }
            else if (data === false) {
                dialog.showMessageBox({
                    title: '失败',
                    contentText: '',
                })
            }
        })
    }

    render() {
        return <div className={boxButton} style={{
            backgroundColor: this.props.bgColor,
            width: this.props.width
        }}>
            {this.props.text}</div>
    }
}




class APP extends React.Component<{}, { quxiao: string }> {
    componentWillMount() {
        this.setState({
            quxiao: '0'
        })
        const f = () => {
            requestAnimationFrame(f)
            this.forceUpdate()
        }
        f()
    }
    render() {
        return <div style={{
            backgroundColor: '#24292d',
            margin: 'auto auto',
            width: '350px',
            height: '100%',
            padding: '10px 5px',
            overflow: 'hidden',
            fontFamily: 'SourceHanSansSC-regular',
            color: 'white',
            fontSize: '24px',
            userSelect: 'none',
            cursor: 'default'
        }}>
            <span>XBTUSD</span>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                margin: '20px 0'
            }}>
                <span style={{ color: d().仓位数量 < 0 ? 'rgba(229, 101, 70, 1)' : 'rgba(72, 170, 101, 1)', fontSize: '24px' }}>{d().仓位数量}</span>
                <span style={{ paddingLeft: '50px', fontSize: '24px' }}>@{d().开仓均价}</span>
            </div>
            <Button

                bgColor='rgba(229, 101, 70, 1)'
                text='市价平仓'
                func={() => rpc.市价平仓({ cookie, symbol: 'XBTUSD' })} />
            <div
                style={{
                    fontSize: '20px',
                    marginLeft: '10px'
                }}>
                <span>止损任务<Switch value={d().任务.止损} color='primary' /></span><br />
                <span>止盈任务<Switch value={d().任务.止盈} color='secondary' /></span>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center'
            }}>
                <div
                    style={{

                        width: '50%'
                    }}>
                    <Button

                        bgColor='rgba(72, 170, 101, 1)'
                        text='500'
                        func={() => { }} />
                    <Table side='Buy' />

                </div>
                <div
                    style={{
                        width: '50%'
                    }}>
                    <Button

                        bgColor='rgba(229, 101, 70, 1)'
                        text='-500'
                        func={() => { }} />
                    <Table side='Sell' />
                </div>
            </div>
        </div >
    }
}

ReactDOM.render(<APP />, document.querySelector('#root'))