import * as http from 'http'
import { JSONRequest, JSONRequestError } from './JSONRequest'
import { typeObjectParse } from './typeObjectParse'
import { mapObjIndexed } from './mapObjIndexed'
import { safeJSONParse } from './safeJSONParse'

type FuncList = {
    [funcName: string]: {
        req: any
        res: any
    }
}

export class JSONRPCServer<T extends FuncList> {

    readonly func: {
        [K in keyof T]?: (req: T[K]['req']) => Promise<T[K]['res']>
    } = Object.create(null)

    readonly 模拟客户端调用: {
        [K in keyof T]: (req: T[K]['req']) => Promise<{
            error?: JSONRequestError
            data?: T[K]['res']
            msg?: string
        }>
    }


    private funcList: T
    private port: number

    constructor(p: {
        funcList: T
        port: number
    }) {
        this.funcList = p.funcList
        this.port = p.port

        this.模拟客户端调用 = mapObjIndexed(
            (value, key) =>
                async (req: any) => {
                    try {
                        return { data: await this.func[key]!(req) }
                    } catch (error) {
                        return { error }
                    }
                },
            p.funcList
        )
    }

    run() {

        http.createServer(async (req, res) => {

            let data = ''
            req.setEncoding('utf8')
            req.on('data', chunk => data += chunk)
            req.on('end', async () => {
                const arr = safeJSONParse(data)
                if (Array.isArray(arr) && arr.length === 2 && typeof arr[0] === 'string') {
                    const name = arr[0]
                    const param = arr[1]
                    const f = this.func[name]
                    const define = this.funcList[name]
                    if (f !== undefined && define !== undefined) {
                        try {
                            const ret = await f(typeObjectParse(define.req)(param))
                            res.write(JSON.stringify(ret))
                            res.end()
                        } catch (error) {
                            res.writeHead(404)
                            res.write(String(error))
                            res.end()
                        }
                        return
                    }
                }
                res.writeHead(404)
                res.write('error')
                res.end()
            })
        }).listen(this.port)
    }
}


export class JSONRPCClient<T extends FuncList> {

    readonly func: {
        [K in keyof T]: (req: T[K]['req']) => Promise<{
            error?: JSONRequestError
            data?: T[K]['res']
            msg?: string
        }>
    }

    constructor(p: {
        funcList: T
        host: string
        port: number
    }) {

        this.func = mapObjIndexed(
            (value, key) =>
                async (req: any) => {
                    const { error, data, msg } = await JSONRequest({
                        url: `http://${p.host}:${p.port}`,
                        method: 'POST',
                        body: [key, req],
                    })
                    return {
                        error: error,
                        data: error ? undefined : typeObjectParse(value.res)(data),
                        msg,
                    }
                },
            p.funcList
        )

    }
} 