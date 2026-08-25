import React from "react";
import {observer} from "mobx-react-lite";

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
            <h1 className="text-2xl sm:text-4xl text-lime-500 font-bold uppercase mb-6 sm:mb-12">
                {stepStore.activeStep.name}
            </h1>

            {
                getComponent(stepStore.isResume)
            }
        </>
    )
})

const getComponent = (isResume: boolean) => {
    return isResume ? <Resume/> : <Questions/>
}
