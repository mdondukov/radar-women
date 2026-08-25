import React from "react";
import {ResponsiveRadar} from "@nivo/radar"
import {observer} from "mobx-react-lite";

import {useStores} from "../hooks/use-stores";
import {fetchIndicators} from "../http/api";
import {Loader} from "./index";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import {useIntl} from "react-intl";

export const Radar: React.FC = observer(() => {
    const intl = useIntl()
    const {summaryStore, stepStore, regionStore, questionStore, uiStore} = useStores()

    React.useEffect(() => {
        summaryStore.setLoading(true)
        fetchIndicators(regionStore.selectRegion, questionStore.selectAnswers).then(response => {
            summaryStore.setIndicators(response.data.indicators)
            stepStore.setCompleteStep(stepStore.activeStep.id)
            summaryStore.setLoading(false)
        }).catch(error => {
            summaryStore.setError(error)
            summaryStore.setLoading(false)
        })
    }, [])

    if (summaryStore.isLoading) {
        return <Loader/>
    }

    if (summaryStore.error) {
        throw Error(summaryStore.error)
    }

    return (
        <>
            <h1 className="text-2xl sm:text-4xl text-lime-500 font-bold uppercase mb-6 sm:mb-12">
                {stepStore.activeStep.name}
            </h1>

            <div className="sm:text-lg font-medium text-blue-800 mb-6 lg:mb-12">
                <p>{intl.formatMessage({id: "label.radar.congrats"})}</p>
                <p>{intl.formatMessage({id: "label.radar.info"})}</p>
            </div>

            <div className="radar-wrap">
                <div
                    className={
                        `max-lg:w-[820px] max-md:w-[640px] mb-6 sm:mb-12 ${uiStore.windowDimensions.width < 640 ? "radar mob" : "radar"}`
                    }
                    style={{height: getHeight(uiStore.windowDimensions.width)}}
                >
                    <ResponsiveRadar
                        data={summaryStore.indicators.map(indicator => {
                            return {
                                name: indicator.name,
                                value: indicator.value
                            }
                        })}
                        keys={["value"]}
                        indexBy="name"
                        maxValue={3.0}
                        valueFormat=">-.1f"
                        margin={{top: 40, right: 80, bottom: 40, left: 80}}
                        borderColor={{from: 'color', modifiers: []}}
                        gridLevels={6}
                        gridLabelOffset={24}
                        dotSize={10}
                        dotColor={{theme: 'background'}}
                        dotBorderWidth={2}
                        enableDotLabel={true}
                        colors={{scheme: 'accent'}}
                        fillOpacity={0.15}
                        blendMode="multiply"
                        motionConfig="wobbly"
                        isInteractive={false}
                        theme={
                            {
                                "fontFamily": "'Montserrat', sans-serif",
                                "fontSize": 15,
                                axis: {
                                    ticks: {
                                        text: {
                                            "fontWeight": 500,
                                            "fontSize": uiStore.windowDimensions.width < 640 ? 10 : 12,
                                        }
                                    }
                                }
                            }
                        }
                    />
                </div>
            </div>

            <div className="sm:text-lg font-medium text-blue-800 mb-6 lg:mb-12">
                <p>{intl.formatMessage({id: "label.radar.impacts.info"})}</p>
            </div>

            <div className="bg-white rounded-xl p-10">
                <span className="text-xs sm:text-sm text-blue-800 font-medium uppercase mb-2">
                    {regionStore.getRegion(regionStore.selectRegion.regionId).name}
                </span>

                <h3 className="text-lg sm:text-2xl text-blue-800 font-bold uppercase mb-6">
                    {regionStore.getArea(regionStore.selectRegion.areaId).name}
                </h3>

                <p className="max-sm:text-sm mb-6">{regionStore.getArea(regionStore.selectRegion.areaId).descr}</p>

                <div className={uiStore.windowDimensions.width < 640 ? "area-impact mob" : "area-impact"}>
                    <ReactMarkdown
                        children={regionStore.getArea(regionStore.selectRegion.areaId).impact}
                        remarkPlugins={[remarkGfm]}
                    />
                </div>
            </div>
        </>
    )
})

const getHeight = (windowWidth: number) => {
    if (windowWidth < 640) return 250

    // if (windowWidth < 1024) return 300

    if (windowWidth < 1280) return 350

    return 600
}