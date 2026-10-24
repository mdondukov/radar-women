import React from "react";
import axios from "axios";

import {fetchConfig, fetchSession, fetchStats, signIn, signOut} from "./api";
import {Dashboard} from "./Dashboard";
import {Stats} from "./types";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (o: {client_id: string, callback: (r: {credential: string}) => void}) => void
                    renderButton: (el: HTMLElement, o: Record<string, unknown>) => void
                }
            }
        }
    }
}

const GIS_SRC = "https://accounts.google.com/gsi/client"

const loadGis = () => new Promise<void>((resolve, reject) => {
    if (window.google?.accounts) return resolve()
    const script = document.createElement("script")
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Google sign-in did not load"))
    document.head.appendChild(script)
})

type State =
    | {kind: "loading"}
    | {kind: "signin", clientId: string, error?: string}
    | {kind: "ready", email: string, stats: Stats}
    | {kind: "error", message: string}

const SignIn: React.FC<{clientId: string, error?: string, onCredential: (c: string) => void}> =
    ({clientId, error, onCredential}) => {
        const button = React.useRef<HTMLDivElement>(null)
        React.useEffect(() => {
            loadGis().then(() => {
                window.google!.accounts.id.initialize({client_id: clientId, callback: r => onCredential(r.credential)})
                if (button.current) {
                    window.google!.accounts.id.renderButton(button.current, {theme: "outline", size: "large", locale: "ru"})
                }
            }).catch(() => undefined)
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [clientId])
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="bg-white rounded-xl shadow p-10 text-center max-w-md">
                    <h1 className="text-2xl font-bold text-blue-900 mb-2">Радар: статистика</h1>
                    <p className="text-gray-600 mb-6">Вход только для участников проекта.</p>
                    <div ref={button} className="flex justify-center"/>
                    {error && <p className="text-red-600 mt-4">{error}</p>}
                </div>
            </div>
        )
    }

const AdminApp: React.FC = () => {
    const [state, setState] = React.useState<State>({kind: "loading"})

    const load = React.useCallback(async (error?: string) => {
        try {
            const session = await fetchSession()
            if (!session) {
                const {googleClientId} = await fetchConfig()
                setState({kind: "signin", clientId: googleClientId, error})
                return
            }
            setState({kind: "ready", email: session.email, stats: await fetchStats()})
        } catch (e) {
            const status = axios.isAxiosError(e) ? e.response?.status : undefined
            setState({
                kind: "error",
                message: status === 503 ? "Админка не настроена на сервере." : "Не удалось загрузить данные.",
            })
        }
    }, [])

    React.useEffect(() => {
        document.title = "Радар: статистика"
        load()
    }, [load])

    const onCredential = async (credential: string) => {
        try {
            await signIn(credential)
            await load()
        } catch (e) {
            const status = axios.isAxiosError(e) ? e.response?.status : undefined
            await load(status === 429
                ? "Слишком много попыток, попробуйте через несколько минут."
                : "У этого аккаунта нет доступа.")
        }
    }

    if (state.kind === "loading") return <div className="p-10 text-gray-500">Загрузка…</div>
    if (state.kind === "error") return <div className="p-10 text-red-600">{state.message}</div>
    if (state.kind === "signin") {
        return <SignIn clientId={state.clientId} error={state.error} onCredential={onCredential}/>
    }
    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-blue-900 text-white px-6 py-3 flex items-center">
                <h1 className="text-lg font-bold">Женщины Ферганы: статистика</h1>
                <span className="ml-auto text-sm opacity-80">{state.email}</span>
                <button className="ml-4 text-sm underline" onClick={async () => {
                    await signOut()
                    await load()
                }}>выйти</button>
            </header>
            <main className="max-w-7xl mx-auto p-5">
                <Dashboard stats={state.stats}/>
            </main>
        </div>
    )
}

export default AdminApp
