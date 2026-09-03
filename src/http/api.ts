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

export const fetchIndicators = async (
    region: IRegionSelect | null,
    answers: IAnswerSelect[],
    locale: string,
    secondaryLocale?: string
) => {
    const {data} = await $host.post(
        `${POLL_BASE}/summary`,
        {region: region, answers: answers},
        config(locale, secondaryLocale)
    )
    return data
}
