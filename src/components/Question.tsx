import React from "react";
import {observer} from "mobx-react-lite";

import {useIntl} from "react-intl";

import {useStores} from "../hooks/use-stores";
import {IQuestion} from "../types/question";
import {mirrorOf} from "../utils";
import {IoIosCheckbox, IoIosCheckboxOutline, IoIosRadioButtonOff, IoIosRadioButtonOn} from "react-icons/io";

interface QuestionProps {
    question: IQuestion
    num: number
}

export const Question: React.FC<QuestionProps> = observer(({question, num}) => {
    const intl = useIntl()
    const {stepStore, questionStore, uiStore, messageStore} = useStores()

    const questionMirror = mirrorOf(question.content, question.contentSecondary)

    const select = (answerId: number) => {
        questionStore.setSelectAnswer(stepStore.activeStep.id, question.id, answerId, question.isMultiSelect)
        if (questionStore.isAllQuestionsComplete(stepStore.activeStep.id)) {
            stepStore.setCompleteStep(stepStore.activeStep.id)
        }
    }

    return (
        <div className="relative flex lg:gap-6 gap-4 flex-row">
            <div
                className="flex h-10 lg:h-14 w-10 lg:w-14 items-center justify-center rounded-full bg-blue-100 shrink-0">
                <span className="text-sm lg:text-lg text-blue-900 font-semibold">{num}</span>
            </div>
            <div className="sm:min-w-0 sm:flex-1">
                <p className="sm:text-2xl font-medium text-gray-900 mb-0">
                    {question.content}
                    {
                        question.isMultiSelect &&
                        ` (${intl.formatMessage({id: "label.multiSelect.hint"})})`
                    }
                </p>
                {
                    // The mirror translation sits under the primary text in its own
                    // color, so a reader of either language can follow the same page.
                    questionMirror && (
                        <p className="sm:text-xl font-medium text-blue-700 mb-0">
                            {questionMirror}
                            {
                                question.isMultiSelect &&
                                ` (${messageStore.messages[uiStore.secondaryLocale]["label.multiSelect.hint"]})`
                            }
                        </p>
                    )
                }
                <div className="lg:inline-flex rounded-lg shadow-sm mt-6" role="group">
                    {
                        question.answers.map((answer, index) =>
                            uiStore.windowDimensions.width > 1024 - 1
                                ? <button key={answer.id}
                                          type="button"
                                          onClick={() => select(answer.id)}
                                          className={
                                              getButtonClass(index, question.answers.length - 1) +
                                              `${questionStore.isAnswerSelect(question.id, answer.id)
                                                  ? ` z-20 ring-1 ring-lime-700 text-lime-800 bg-lime-300`
                                                  : ` bg-lime-200`}`
                                          }>
                                    <span className="block">{answer.content}</span>
                                    {
                                        mirrorOf(answer.content, answer.contentSecondary) && (
                                            <span className="block text-blue-700 max-xl:text-xs text-sm">
                                                {answer.contentSecondary}
                                            </span>
                                        )
                                    }
                                </button>
                                : <div
                                    key={answer.id}
                                    onClick={() => select(answer.id)}
                                    className="flex cursor-default mb-4"
                                >
                                    <div className={
                                        `flex items-baseline mr-2` +
                                        `${questionStore.isAnswerSelect(question.id, answer.id) ? ` text-blue-800` : ``}`
                                    }>
                                        {
                                            question.isMultiSelect
                                                ? (
                                                    questionStore.isAnswerSelect(question.id, answer.id)
                                                        ? <IoIosCheckbox size={22}/>
                                                        : <IoIosCheckboxOutline size={22}/>
                                                )
                                                : (
                                                    questionStore.isAnswerSelect(question.id, answer.id)
                                                        ? <IoIosRadioButtonOn size={22}/>
                                                        : <IoIosRadioButtonOff size={22}/>
                                                )
                                        }
                                    </div>
                                    <div className="font-medium text-sm">
                                        <p>{answer.content}</p>
                                        {
                                            mirrorOf(answer.content, answer.contentSecondary) && (
                                                <p className="text-blue-700 text-xs">{answer.contentSecondary}</p>
                                            )
                                        }
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
        `border-lime-500 hover:bg-lime-300 max-xl:text-sm text-left align-top`

    if (currentIndex === 0)
        return className + " border-l border-r rounded-l-lg"

    else if (currentIndex === lastIndex)
        return className + " border-r rounded-r-lg"

    else if (currentIndex === 0 && lastIndex === 1)
        return className + " border-l border-r rounded-lg"

    else
        return className + " border-r"
}
