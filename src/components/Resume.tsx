import React from "react";
import {observer} from "mobx-react-lite";
import {useStores} from "../hooks/use-stores";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import jamInstPng from "../assets/img/jamilya/jamilya_instr.png";
import indicatorEnvironmentPng from "../assets/img/jamilya/indicator_environment.png";
import indicatorAgriculturePng from "../assets/img/jamilya/indicator_agriculture.png";
import indicatorIrrigationPng from "../assets/img/jamilya/indicator_irrigation.png";
import indicatorWashPng from "../assets/img/jamilya/indicator_wash.png";
import indicatorSettlementPng from "../assets/img/jamilya/indicator_settlement.png";
import indicatorCommunityPng from "../assets/img/jamilya/indicator_community.png";
import indicatorGenderPng from "../assets/img/jamilya/indicator_gender.png";
import indicatorEmergencyPng from "../assets/img/jamilya/indicator_emergency.png";
import indicatorPeacebuildingPng from "../assets/img/jamilya/indicator_peacebuilding.png";
import {useIntl} from "react-intl";
import {NextButton} from "./buttons/NextButton";
import {Linkify} from "./common/Linkify";
import {fetchIndicators} from "../http/api";
import {ContentLangButton} from "./buttons/ContentLangButton";
import {pickLocale} from "../utils";

// показатель-specific illustration, keyed by step.code; falls back to the
// generic instruction illustration for any step without a dedicated one
// (e.g. a future показатель added before a designer supplies its art).
const INDICATOR_ILLUSTRATIONS: Record<string, string> = {
    "fergana-indicator-1": indicatorEnvironmentPng,
    "fergana-indicator-2": indicatorAgriculturePng,
    "fergana-indicator-3": indicatorIrrigationPng,
    "fergana-indicator-4": indicatorWashPng,
    "fergana-indicator-5": indicatorSettlementPng,
    "fergana-indicator-6": indicatorCommunityPng,
    "fergana-indicator-7": indicatorGenderPng,
    "fergana-indicator-8": indicatorEmergencyPng,
    "fergana-indicator-9": indicatorPeacebuildingPng,
}

export const Resume: React.FC = observer(() => {
    const intl = useIntl()
    const {stepStore, questionStore, uiStore, messageStore} = useStores()
    const [riskText, setRiskText] = React.useState<string | null>(null)
    const [riskTextSecondary, setRiskTextSecondary] = React.useState<string | null>(null)

    React.useEffect(() => {
        const stepId = stepStore.activeStep.id
        const answers = questionStore.selectAnswers.filter(a => a.stepId === stepId)
        setRiskText(null)
        setRiskTextSecondary(null)
        fetchIndicators(null, answers, uiStore.locale, uiStore.secondaryLocale).then(response => {
            const indicator = response.data.indicators.find(
                (i: { stepId: number }) => i.stepId === stepId
            )
            setRiskText(indicator?.riskText ?? null)
            setRiskTextSecondary(indicator?.riskTextSecondary ?? null)
        }).catch(e => console.error(e))
    }, [stepStore.activeStep.id, uiStore.locale, uiStore.secondaryLocale])

    const recommendations = questionStore.getRecommendations(
        stepStore.activeStep.id, uiStore.isSecondaryContent
    )
    const shownRiskText = pickLocale(riskText, riskTextSecondary, uiStore.isSecondaryContent)

    return (
        <div className="resume xl:grid xl:grid-cols-12">
            <div className="xl:col-span-8">
                <div className="sm:text-2xl font-bold text-gray-900 mb-4">
                    <p>
                        {
                            intl.formatMessage(
                                {id: "label.average"},
                                {result: questionStore.calcResult(stepStore.activeStep.id)}
                            )
                        }
                    </p>
                </div>
                {
                    (stepStore.activeStep.descr || recommendations.length > 0 || riskText) && (
                        <ContentLangButton/>
                    )
                }
                {
                    stepStore.activeStep.descr && (
                        <div className="markdown-body sm:text-2xl font-medium text-gray-900 mb-6 lg:mb-12">
                            <ReactMarkdown
                                children={pickLocale(
                                    stepStore.activeStep.descr,
                                    stepStore.activeStep.descrSecondary,
                                    uiStore.isSecondaryContent
                                ) ?? ""}
                                remarkPlugins={[remarkGfm]}
                            />
                        </div>
                    )
                }
                {
                    (recommendations.length > 0 || riskText) && (
                        <div className="bg-white rounded-xl p-10 mb-6 lg:mb-12">
                            <h3 className="text-2xl sm:text-4xl text-blue-800 font-bold uppercase mb-6">
                                {messageStore.messages[uiStore.contentLocale]["label.recommendations"]}
                            </h3>
                            {
                                recommendations.length > 0 && (
                                    <div className="sm:text-xl text-gray-900 mb-6">
                                        <ul className="list-disc recommendations">
                                            {
                                                recommendations.map(recommendation =>
                                                    <li key={recommendation}><Linkify text={recommendation}/></li>
                                                )
                                            }
                                        </ul>
                                    </div>
                                )
                            }
                            {
                                shownRiskText && (
                                    <div className="markdown-body sm:text-xl text-gray-900">
                                        <ReactMarkdown
                                            children={shownRiskText}
                                            remarkPlugins={[remarkGfm]}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    stepStore.activeStep.nextStepId && (
                        <NextButton
                            nextStepId={stepStore.activeStep.nextStepId}
                            enable={stepStore.isCompleteStep(stepStore.activeStep.id)}
                        />
                    )
                }
            </div>
            <div className="xl:col-span-4 mt-6 lg:mt-12 xl:mt-0">
                <div className="grid justify-items-stretch">
                    <div className="md:justify-self-end justify-self-center md:z-10 z-0">
                        <img
                            src={INDICATOR_ILLUSTRATIONS[stepStore.activeStep.code] ?? jamInstPng}
                            alt={intl.formatMessage({id: "label.jamilya"})}
                            className={
                                `h-auto w-auto max-w-full ` +
                                (stepStore.activeStep.code === "fergana-indicator-9" ? `max-h-[624px]` : `max-h-[520px]`)
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    )
})