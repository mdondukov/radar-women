import React from "react";
import {observer} from "mobx-react-lite";
import {useIntl} from "react-intl";
import {AiOutlineArrowRight, AiOutlineRadarChart} from "react-icons/ai";
import {BsFillGeoAltFill} from "react-icons/bs";
import {FaCity, FaDove, FaTree, FaUsers, FaVenus} from "react-icons/fa";
import {GiTap} from "react-icons/gi";
import {MdAgriculture, MdSanitizer} from "react-icons/md";
import {RiAlarmWarningFill} from "react-icons/ri";

import {useStores} from "../../hooks/use-stores";
import {IStep} from "../../types/step";
import {AlertType, IAlert} from "../../types/alert";
import {Alert} from "../common/Alert";

const ICON_SIZE = 32
const ICON_SIZE_MOBILE = 24

export const Navigation: React.FC = observer(() => {
    const intl = useIntl()
    const [alert, setAlert] = React.useState<IAlert | null>(null)
    const [isAlertOpen, setAlertOpen] = React.useState<boolean>(false)
    const {stepStore, uiStore} = useStores()

    return (
        <>
            <div className="md:mb-10 mb-6 overflow-x-auto h-[50px] md:h-auto">
                <div className="flex">
                    {
                        stepStore.steps.map((step, index) =>
                            <div key={step.id} className={index === 0 ? `flex-none` : `grow flex`}>
                                {
                                    index !== 0 && (
                                        <div className="grow inline-flex items-center">
                                            <hr className={
                                                `md:w-full w-4 text-white border-t-2 border-t border-dotted ` +
                                                `${(step.id === stepStore.activeStep.id || stepStore.isCompleteStep(step.id))
                                                    ? `border-amber-300` : `text-gray-300`
                                                }`
                                            }/>
                                        </div>
                                    )
                                }
                                <div
                                    onClick={() => {
                                        if (stepStore.isCompleteStep(step.id)) {
                                            if (stepStore.isCompleteStep(stepStore.activeStep.id)) {
                                                stepStore.setActive(step.id)
                                            } else {
                                                setAlert({
                                                    type: AlertType.ERROR,
                                                    name: intl.formatMessage({id: "label.error"}),
                                                    desc: intl.formatMessage(
                                                        {id: "label.error.step.incomplete"},
                                                        {stepName: step.name})
                                                })
                                                setAlertOpen(true)
                                            }
                                        }
                                    }}
                                    className={
                                        `flex-none rounded-full p-2 text-center inline-flex items-center ` +
                                        getColor(step.id, stepStore.activeStep.id, stepStore.isCompleteStep(step.id))
                                    }
                                >
                                    {getIcon(step, uiStore.windowDimensions.width)}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
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

const getColor = (stepId: number, activeId: number, isCompleteStep: boolean) => {
    if (stepId === activeId)
        return "text-white bg-amber-300"

    if (isCompleteStep)
        return "text-blue-800 hover:text-blue-600 bg-white cursor-pointer"

    return "text-gray-300 bg-gray-50"
}

const getIcon = (step: IStep, windowWidth: number) => {
    const iconSize = windowWidth > 768 + 1 ? ICON_SIZE : ICON_SIZE_MOBILE

    switch (step.code) {
        case "fergana-region":
            return <BsFillGeoAltFill size={iconSize} title={step.name}/>
        case "fergana-indicator-1": // Окружающая среда
            return <FaTree size={iconSize} title={step.name}/>
        case "fergana-indicator-2": // Сельское хозяйство
            return <MdAgriculture size={iconSize} title={step.name}/>
        case "fergana-indicator-3": // Ирригационные ресурсы и инфраструктура
            return <GiTap size={iconSize} title={step.name}/>
        case "fergana-indicator-4": // Вода, санитария, гигиена
            return <MdSanitizer size={iconSize} title={step.name}/>
        case "fergana-indicator-5": // Среда населённых пунктов
            return <FaCity size={iconSize} title={step.name}/>
        case "fergana-indicator-6": // Потенциал местного сообщества
            return <FaUsers size={iconSize} title={step.name}/>
        case "fergana-indicator-7": // Гендер и климатическая устойчивость
            return <FaVenus size={iconSize} title={step.name}/>
        case "fergana-indicator-8": // Климатические риски и социальная напряжённость
            return <RiAlarmWarningFill size={iconSize} title={step.name}/>
        case "fergana-indicator-9": // Механизмы миростроительства
            return <FaDove size={iconSize} title={step.name}/>
        case "fergana-radar":
            return <AiOutlineRadarChart size={iconSize} title={step.name}/>
        default:
            return <AiOutlineArrowRight size={iconSize} title={step.name}/>
    }
}