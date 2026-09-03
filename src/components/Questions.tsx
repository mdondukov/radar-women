import React from "react";
import {useIntl} from "react-intl";
import {Question} from "./Question";
import {useStores} from "../hooks/use-stores";
import {observer} from "mobx-react-lite";
import {ResumeButton} from "./buttons/ResumeButton";

export const Questions: React.FC = observer(() => {
    const intl = useIntl()
    const {questionStore, stepStore} = useStores()
    const isComplete = stepStore.isCompleteStep(stepStore.activeStep.id)

    return (
        <>
            <div className="max-w-lg sm:mx-auto md:max-w-none mb-12">
                <div className="grid grid-cols-1 gap-y-12">
                    {
                        questionStore.getQuestions(stepStore.activeStep.id).map((question, index) =>
                            <Question key={question.id}{...{question: question, num: index + 1}}/>
                        )
                    }
                </div>
            </div>

            <ResumeButton enable={isComplete}/>
            {
                !isComplete && (
                    <p className="mt-3 text-sm sm:text-base text-gray-600">
                        {intl.formatMessage({id: "label.hint.answer.all"})}
                    </p>
                )
            }
        </>
    )
})