import React from "react";
import {observer} from "mobx-react-lite";

import {useStores} from "../hooks/use-stores";
import {IQuestion} from "../types/question";
import {IoIosRadioButtonOff, IoIosRadioButtonOn} from "react-icons/io";

interface QuestionProps {
    question: IQuestion
    num: number
}

export const Question: React.FC<QuestionProps> = observer(({question, num}) => {
    const {stepStore, questionStore, uiStore} = useStores()

    return (
        <div className="relative flex lg:gap-6 gap-4 flex-row">
            <div
                className="flex h-10 lg:h-14 w-10 lg:w-14 items-center justify-center rounded-full bg-blue-100 shrink-0">
                <span className="text-sm lg:text-lg text-blue-900 font-semibold">{num}</span>
            </div>
            <div className="sm:min-w-0 sm:flex-1">
                <p className="sm:text-lg font-medium text-gray-900 mb-0">{question.content}</p>
                <div className="lg:inline-flex rounded-lg shadow-sm mt-6" role="group">
                    {
                        question.answers.map((answer, index) =>
                            uiStore.windowDimensions.width > 1024 - 1
                                ? <button key={answer.id}
                                          type="button"
                                          onClick={() => {
                                              questionStore.setSelectAnswer(stepStore.activeStep.id, question.id, answer.id)
                                              if (questionStore.isAllQuestionsComplete(stepStore.activeStep.id)) {
                                                  stepStore.setCompleteStep(stepStore.activeStep.id)
                                              }
                                          }}
                                          className={
                                              getButtonClass(index, question.answers.length - 1) +
                                              `${questionStore.isAnswerSelect(question.id, answer.id)
                                                  ? ` z-20 ring-1 ring-lime-700 text-lime-800 bg-lime-300`
                                                  : ` bg-lime-200`}`
                                          }>
                                    {answer.content}
                                </button>
                                : <div
                                    key={answer.id}
                                    onClick={() => {
                                        questionStore.setSelectAnswer(stepStore.activeStep.id, question.id, answer.id)
                                        if (questionStore.isAllQuestionsComplete(stepStore.activeStep.id)) {
                                            stepStore.setCompleteStep(stepStore.activeStep.id)
                                        }
                                    }}
                                    className="flex cursor-default mb-4"
                                >
                                    <div className={
                                        `flex items-baseline mr-2` +
                                        `${questionStore.isAnswerSelect(question.id, answer.id) ? ` text-blue-800` : ``}`
                                    }>
                                        {
                                            questionStore.isAnswerSelect(question.id, answer.id)
                                                ? <IoIosRadioButtonOn size={22}/>
                                                : <IoIosRadioButtonOff size={22}/>
                                        }
                                    </div>
                                    <div className="font-medium text-sm">
                                        <p>{answer.content}</p>
                                    </div>
                                </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
})

const getButtonClass = (currentIndex: number, lastIndex: number) => {
    const className = `xl:min-w-[160px] px-4 py-2 border-t border-b font-medium text-gray-900 hover:text-lime-800 ` +
        `border-lime-500 hover:bg-lime-300 max-xl:text-sm`

    if (currentIndex === 0)
        return className + " border-l border-r rounded-l-lg"

    else if (currentIndex === lastIndex)
        return className + " border-r rounded-r-lg"

    else if (currentIndex === 0 && lastIndex === 1)
        return className + " border-l border-r rounded-lg"

    else
        return className + " border-r"
}