import axios from "axios";

import {Stats} from "./types";

// Same host as the dashboard: nginx forwards /admin/api/* to radar-api's
// /v1/admin/*, so the session cookie stays first-party and scoped to /admin.
const $admin = axios.create({baseURL: "/admin/api", withCredentials: true})

export const PROJECT_CODE = "fergana-women"

export const fetchConfig = async (): Promise<{googleClientId: string}> =>
    (await $admin.get("/config")).data.data

export const fetchSession = async (): Promise<{email: string} | null> => {
    try {
        return (await $admin.get("/session")).data.data
    } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 401) return null
        throw e
    }
}

export const signIn = async (credential: string): Promise<{email: string}> =>
    (await $admin.post("/session", {credential})).data.data

export const signOut = async (): Promise<void> => {
    await $admin.delete("/session")
}

export const fetchStats = async (): Promise<Stats> =>
    (await $admin.get(`/${PROJECT_CODE}/stats`)).data.data
