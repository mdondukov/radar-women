import React from "react";
import {observer} from "mobx-react-lite";
import {useStores} from "../hooks/use-stores";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import jamStartSvg from "../assets/img/jamilya/jamilya_start.svg";
import {useIntl} from "react-intl";
import {NextButton} from "./buttons/NextButton";

export const Resume: React.FC = observer(() => {
    const intl = useIntl()
    const [jamSvg, setJamSvg] = React.useState(jamStartSvg)
    const {stepStore, questionStore} = useStores()

    React.useEffect(() => {
        import(`../assets/img/jamilya/jamilya_step_${stepStore.activeStep.id}.svg`)
            .then(res => setJamSvg(res.default))
            .catch(e => console.error(e))
    }, [stepStore.activeStep.id])

    return (
        <div className="resume xl:grid xl:grid-cols-12">
            <div className="xl:col-span-8">
                <div className="sm:text-lg font-bold text-blue-800 mb-4">
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
                        <div className="sm:text-lg font-medium text-blue-800 mb-6 lg:mb-12">
                            <ReactMarkdown
                                children={stepStore.activeStep.descr}
                                remarkPlugins={[remarkGfm]}
                            />
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
                            src={jamSvg}
                            alt={intl.formatMessage({id: "label.jamilya"})}
                            className="h-[520px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
})