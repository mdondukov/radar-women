import React from "react";
import {observer} from "mobx-react-lite";
import {useIntl} from "react-intl";

import {useStores} from "../../hooks/use-stores";
import {StepType} from "../../types/step";
import {AlertType, IAlert} from "../../types/alert";
import {Alert} from "../common/Alert";

interface NextButtonProps {
    nextStepId: number
    enable: boolean
}

export const NextButton: React.FC<NextButtonProps> = observer(({nextStepId, enable}) => {
    const intl = useIntl()
    const [alert, setAlert] = React.useState<IAlert | null>(null)
    const [isAlertOpen, setAlertOpen] = React.useState<boolean>(false)
    const {stepStore} = useStores()

    // Steps are chained linearly, so "Далее" from the last показатель points at
    // the radar — even for a reader who jumped straight there and left the
    // others empty. Those would be averaged as zero, so the radar stays closed
    // until every показатель is answered, whichever way it is approached.
    const isRadarLocked =
        stepStore.getStep(nextStepId)?.type === StepType.RADAR && !stepStore.isAllAssessmentComplete

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    if (isRadarLocked) {
                        setAlert({
                            type: AlertType.ERROR,
                            name: intl.formatMessage({id: "label.error"}),
                            desc: intl.formatMessage(
                                {id: "label.error.radar.incomplete"},
                                {steps: stepStore.incompleteAssessments.join(", ")}
                            )
                        })
                        setAlertOpen(true)
                        return
                    }
                    stepStore.setActive(nextStepId)
                }}
                className={
                    `inline-flex items-center text-lg text-white font-bold uppercase` +
                    ` h-12 px-14 rounded-xl hover:bg-lime-400` +
                    `${enable ? ` bg-lime-500` : ` bg-lime-400 cursor-not-allowed`}`
                }
                disabled={!enable}
            >
                {intl.formatMessage({id: "label.next"})}
            </button>
            {
                (alert && isAlertOpen) && (
                    <Alert
                        alert={{type: alert.type, name: alert.name, desc: alert.desc}}
                        setOpen={setAlertOpen}
                    />
                )
            }
        </>
    )
})
