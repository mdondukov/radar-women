import React from "react";
import {observer} from "mobx-react-lite";
import {useStores} from "../hooks/use-stores";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
// TODO: designer will provide a dedicated illustration per показатель later —
// until then every Resume screen reuses the instruction illustration.
import jamInstPng from "../assets/img/jamilya/jamilya_instr.png";
import {useIntl} from "react-intl";
import {NextButton} from "./buttons/NextButton";
import {Linkify} from "./common/Linkify";
import {fetchIndicators} from "../http/api";

export const Resume: React.FC = observer(() => {
    const intl = useIntl()
    const {stepStore, questionStore} = useStores()
    const [riskText, setRiskText] = React.useState<string | null>(null)

    React.useEffect(() => {
        const stepId = stepStore.activeStep.id
        const answers = questionStore.selectAnswers.filter(a => a.stepId === stepId)
        setRiskText(null)
        fetchIndicators(null, answers).then(response => {
            const indicator = response.data.indicators.find(
                (i: { stepId: number }) => i.stepId === stepId
            )
            setRiskText(indicator?.riskText ?? null)
        }).catch(e => console.error(e))
    }, [stepStore.activeStep.id])

    const recommendations = questionStore.getRecommendations(stepStore.activeStep.id)

    return (
        <div className="resume xl:grid xl:grid-cols-12">
            <div className="xl:col-span-8">
                <div className="sm:text-2xl font-bold text-blue-800 mb-4">
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
                    stepStore.activeStep.descr && (
                        <div className="markdown-body sm:text-2xl font-medium text-blue-800 mb-6 lg:mb-12">
                            <ReactMarkdown
                                children={stepStore.activeStep.descr}
                                remarkPlugins={[remarkGfm]}
                            />
                        </div>
                    )
                }
                {
                    (recommendations.length > 0 || riskText) && (
                        <div className="bg-white rounded-xl p-10 mb-6 lg:mb-12">
                            <h3 className="text-2xl sm:text-4xl text-blue-800 font-bold uppercase mb-6">
                                {intl.formatMessage({id: "label.recommendations"})}
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
                                riskText && (
                                    <div className="markdown-body sm:text-xl text-gray-900">
                                        <ReactMarkdown
                                            children={riskText}
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
                            src={jamInstPng}
                            alt={intl.formatMessage({id: "label.jamilya"})}
                            className="h-[520px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
})