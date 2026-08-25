import {$host} from "./index";
import {IRegionSelect} from "../types/region";
import {IAnswerSelect} from "../types/question";

const PROJECT_CODE = process.env.REACT_APP_PROJECT_CODE
const POLL_BASE = `/v1/${PROJECT_CODE}/poll`

const config = (locale: string) => {
  return {
      headers: {
          locale: locale as string
      }
  }
}

export const fetchSteps = async (locale: string) => {
    const {data} = await $host.get(`${POLL_BASE}/steps`, config(locale))
    return data
}

export const fetchRegions = async (locale: string) => {
    const {data} = await $host.get(`${POLL_BASE}/regions`, config(locale))
    return data
}

export const fetchAssessment = async (locale: string) => {
    const {data} = await $host.get(`${POLL_BASE}/assessment`, config(locale))
    return data
}

export const fetchIndicators = async (region: IRegionSelect | null, answers: IAnswerSelect[]) => {
    const {data} = await $host.post(`${POLL_BASE}/summary`, {region: region, answers: answers})
    return data
}
