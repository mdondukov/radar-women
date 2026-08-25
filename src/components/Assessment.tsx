import React from "react";
import {observer} from "mobx-react-lite";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

import {Loader, Questions, Resume} from "./index";
import {useStores} from "../hooks/use-stores";
import {fetchAssessment} from "../http/api";

export const Assessment: React.FC = observer(() => {
    const {questionStore, stepStore, uiStore} = useStores()

    React.useEffect(() => {
        questionStore.setLoading(true)
        fetchAssessment(uiStore.locale).then(response => {
            questionStore.setQuestions(response.data)
            questionStore.setLoading(false)
        }).catch(error => {
            questionStore.setError(error)
            questionStore.setLoading(false)
        })
    }, [])

    if (questionStore.isLoading) {
        return <Loader/>
    }

    return (
        <>
            <h1 className={
                `text-3xl sm:text-5xl text-lime-500 font-bold uppercase ` +
                (stepStore.activeStep.intro ? `mb-2 sm:mb-3` : `mb-6 sm:mb-12`)
            }>
                {stepStore.activeStep.name}
            </h1>

            {
                stepStore.activeStep.intro && (
                    <div className="markdown-body sm:text-2xl font-medium text-blue-800 mb-10 lg:mb-16">
                        <ReactMarkdown
                            children={stepStore.activeStep.intro}
                            remarkPlugins={[remarkGfm]}
                        />
                    </div>
                )
            }

            {
                getComponent(stepStore.isResume)
            }
        </>
    )
})

const getComponent = (isResume: boolean) => {
    return isResume ? <Resume/> : <Questions/>
}
