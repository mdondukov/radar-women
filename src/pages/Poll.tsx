import React from "react";
import {observer} from "mobx-react-lite";

import {Loader, Navigation, Assessment, Radar, Region} from "../components";
import {useStores} from "../hooks/use-stores";
import {fetchSteps} from "../http/api";
import {StepType} from "../types/step";

const Poll: React.FC = observer(() => {
    const {stepStore, uiStore} = useStores()

    React.useEffect(() => {
        window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }, [stepStore.isResume])

    React.useEffect(() => {
        stepStore.setLoading(true)
        fetchSteps(uiStore.locale).then(response => {
            stepStore.setSteps(response.data)
            stepStore.setActive(response.data[0].id)
            stepStore.setLoading(false)
        }).catch(error => {
            stepStore.setError(error)
            stepStore.setLoading(false)
        })
    }, [])

    if (stepStore.isLoading) {
        return <Loader/>
    }

    if (stepStore.error) {
        throw Error(stepStore.error)
    }

    return (
        <>
            <Navigation/>
            {(() => {
                switch (stepStore.activeStep.type) {
                    case StepType.REGION:
                        return <Region/>
                    case StepType.ASSESSMENT:
                        return <Assessment/>
                    case StepType.RADAR:
                        return <Radar/>
                }
            })()}
        </>
    )
})

export default Poll

