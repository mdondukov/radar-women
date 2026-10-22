import axios from "axios";
import {$host} from "./index";
import {IRegionSelect} from "../types/region";
import {IAnswerSelect} from "../types/question";

const PROJECT_CODE = process.env.REACT_APP_PROJECT_CODE
const POLL_BASE = `/v1/${PROJECT_CODE}/poll`

// The questionnaire is shown bilingually (see UIStore.secondaryLocale), so every
// request asks for the mirror language alongside the primary one — including
// POST /summary, which used to send no locale at all and therefore always came
// back in the API's default language.
const config = (locale: string, secondaryLocale?: string) => {
  return {
      headers: {
          locale: locale as string,
          ...(secondaryLocale ? {"secondary-locale": secondaryLocale} : {})
      }
  }
}

export const fetchSteps = async (locale: string, secondaryLocale?: string) => {
    const {data} = await $host.get(`${POLL_BASE}/steps`, config(locale, secondaryLocale))
    return data
}

export const fetchRegions = async (locale: string, secondaryLocale?: string) => {
    const {data} = await $host.get(`${POLL_BASE}/regions`, config(locale, secondaryLocale))
    return data
}

export const fetchAssessment = async (locale: string, secondaryLocale?: string) => {
    const {data} = await $host.get(`${POLL_BASE}/assessment`, config(locale, secondaryLocale))
    return data
}

// Random per page load, sent with every summary so the server's statistics can
// tie a reader's block results to their radar. Identifies no one: it is not
// stored in the browser and is gone on reload.
const SESSION_ID = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export type SummarySource = "step" | "radar"

export const fetchIndicators = async (
    region: IRegionSelect | null,
    answers: IAnswerSelect[],
    locale: string,
    secondaryLocale: string | undefined,
    source: SummarySource
) => {
    const {data} = await $host.post(
        `${POLL_BASE}/summary`,
        {region: region, answers: answers, sessionId: SESSION_ID, source: source},
        config(locale, secondaryLocale)
    )
    return data
}

/** POST /summary answers 409 when the answers name ids the questionnaire no
 *  longer has: the page was loaded before the content was re-seeded. The only
 *  fix on the reader's side is to reload. */
export const isPollOutdated = (error: unknown): boolean =>
    axios.isAxiosError(error) && error.response?.status === 409
