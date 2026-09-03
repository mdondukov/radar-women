import React from "react";
import {ResponsiveRadar} from "@nivo/radar"
import {useTheme} from "@nivo/core"
import {animated} from "@react-spring/web"
import {observer} from "mobx-react-lite";

import {useStores} from "../hooks/use-stores";
import {fetchIndicators} from "../http/api";
import {ContentLangButton, Linkify, Loader} from "./index";
import {pickLocale} from "../utils";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import {useIntl} from "react-intl";

// показатель names run long ("Климатические риски и социальная напряжённость"),
// too long for a single-line axis label at a readable font size — greedily
// wrap into short lines so the label stays narrow regardless of viewport.
const wrapLabel = (label: string, maxLineLength: number): string[] => {
    const words = label.split(" ")
    const lines: string[] = []
    let current = ""
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word
        if (candidate.length > maxLineLength && current) {
            lines.push(current)
            current = word
        } else {
            current = candidate
        }
    }
    if (current) {
        lines.push(current)
    }
    return lines
}

interface RadarGridLabelProps {
    id: string
    anchor: "start" | "middle" | "end"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    animated: { transform: any }
}

const RadarGridLabel: React.FC<RadarGridLabelProps> = ({id, anchor, animated: animatedProps}) => {
    const theme = useTheme()
    const {uiStore} = useStores()
    const maxLineLength = uiStore.windowDimensions.width < 640 ? 12 : uiStore.windowDimensions.width < 1280 ? 14 : 18
    const lines = wrapLabel(id, maxLineLength)
    const lineHeight = 20

    return (
        <animated.g transform={animatedProps.transform}>
            <text style={theme.axis.ticks.text} textAnchor={anchor}>
                {
                    lines.map((line, index) =>
                        <tspan
                            key={index}
                            x={0}
                            dy={index === 0 ? -((lines.length - 1) * lineHeight) / 2 + 5 : lineHeight}
                        >
                            {line}
                        </tspan>
                    )
                }
            </text>
        </animated.g>
    )
}

export const Radar: React.FC = observer(() => {
    const intl = useIntl()
    const {summaryStore, stepStore, regionStore, questionStore, uiStore, messageStore} = useStores()

    React.useEffect(() => {
        summaryStore.setLoading(true)
        fetchIndicators(
            regionStore.selectRegion,
            questionStore.selectAnswers,
            uiStore.locale,
            uiStore.secondaryLocale
        ).then(response => {
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
            <h1 className="text-3xl sm:text-5xl text-lime-500 font-bold uppercase mb-6 sm:mb-12">
                {stepStore.activeStep.name}
            </h1>

            <div className="sm:text-2xl font-medium text-gray-900 mb-6 lg:mb-12">
                <p>{intl.formatMessage({id: "label.radar.congrats"})}</p>
                <p>{intl.formatMessage({id: "label.radar.info"})}</p>
            </div>

            <div className="bg-white rounded-xl p-6 sm:p-10 mb-6 lg:mb-12">
                <div className={`radar-wrap ${uiStore.windowDimensions.width < 640 ? "mob" : ""}`}>
                    <div
                        className={
                            uiStore.windowDimensions.width < 640
                                ? "radar mob w-[640px]"
                                : "radar w-full max-w-[1000px] mx-auto"
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
                            margin={{top: 70, right: 110, bottom: 70, left: 110}}
                            borderWidth={3}
                            borderColor="#0B6B32"
                            gridLevels={6}
                            gridShape="circular"
                            gridLabelOffset={28}
                            gridLabel={RadarGridLabel}
                            dotSize={14}
                            dotColor="#ffffff"
                            dotBorderWidth={3}
                            dotBorderColor="#0B6B32"
                            enableDotLabel={true}
                            dotLabelYOffset={-16}
                            colors={["#1B8A4E"]}
                            fillOpacity={0.25}
                            blendMode="normal"
                            motionConfig="wobbly"
                            isInteractive={false}
                            theme={
                                {
                                    "fontFamily": "'PT Sans', sans-serif",
                                    "fontSize": 15,
                                    grid: {
                                        line: {
                                            stroke: "#C6A3E6",
                                            strokeWidth: 1,
                                        }
                                    },
                                    dots: {
                                        text: {
                                            "fontWeight": 700,
                                            "fontSize": 15,
                                            fill: "#003D6C",
                                        }
                                    },
                                    axis: {
                                        ticks: {
                                            text: {
                                                "fontWeight": 700,
                                                "fontSize": uiStore.windowDimensions.width < 640 ? 12 : uiStore.windowDimensions.width < 1280 ? 14 : 17,
                                                fill: "#003D6C",
                                            }
                                        }
                                    }
                                }
                            }
                        />
                    </div>
                </div>

                <p className="text-center text-sm sm:text-base text-gray-900 mt-4">
                    {intl.formatMessage({id: "label.radar.scale"})}
                </p>
            </div>

            <div className="sm:text-2xl font-medium text-gray-900 mb-6 lg:mb-12">
                <p>{intl.formatMessage({id: "label.radar.impacts.info"})}</p>
            </div>

            <div className="bg-white rounded-xl p-10">
                <span className="text-sm sm:text-lg text-blue-800 font-medium uppercase mb-2">
                    {regionStore.getRegion(regionStore.selectRegion.regionId).name}
                </span>

                <h3 className="text-2xl sm:text-4xl text-blue-800 font-bold uppercase mb-6">
                    {regionStore.getArea(regionStore.selectRegion.areaId).name}
                </h3>

                <ContentLangButton/>

                <p className="sm:text-xl text-gray-900 mb-6">
                    {
                        pickLocale(
                            regionStore.getArea(regionStore.selectRegion.areaId).descr,
                            regionStore.getArea(regionStore.selectRegion.areaId).descrSecondary,
                            uiStore.isSecondaryContent
                        )
                    }
                </p>

                <div className={
                    (uiStore.windowDimensions.width < 640 ? "markdown-body mob" : "markdown-body") + " sm:text-xl text-gray-900"
                }>
                    <ReactMarkdown
                        children={pickLocale(
                            regionStore.getArea(regionStore.selectRegion.areaId).impact,
                            regionStore.getArea(regionStore.selectRegion.areaId).impactSecondary,
                            uiStore.isSecondaryContent
                        ) ?? ""}
                        remarkPlugins={[remarkGfm]}
                    />
                </div>
            </div>

            {
                summaryStore.indicators.some(
                    indicator => questionStore.getRecommendations(indicator.stepId).length > 0 || indicator.riskText
                ) && (
                    <div className="bg-white rounded-xl p-10 mt-6 lg:mt-12">
                        <h3 className="text-2xl sm:text-4xl text-blue-800 font-bold uppercase mb-6">
                            {messageStore.messages[uiStore.contentLocale]["label.recommendations"]}
                        </h3>
                        <ContentLangButton/>
                        {
                            summaryStore.indicators.map(indicator => {
                                const recommendations = questionStore.getRecommendations(
                                    indicator.stepId, uiStore.isSecondaryContent
                                )
                                if (recommendations.length === 0 && !indicator.riskText) {
                                    return null
                                }
                                const riskText = pickLocale(
                                    indicator.riskText, indicator.riskTextSecondary, uiStore.isSecondaryContent
                                )
                                return (
                                    <div key={indicator.stepId} className="radar-recommendation-item mb-8 last:mb-0">
                                        <h4 className="text-lg sm:text-3xl text-blue-800 font-bold uppercase mb-3">
                                            {
                                                pickLocale(
                                                    indicator.name,
                                                    indicator.nameSecondary,
                                                    uiStore.isSecondaryContent
                                                )
                                            }
                                        </h4>
                                        {
                                            recommendations.length > 0 && (
                                                <div className="sm:text-xl text-gray-900 mb-3">
                                                    <ul className="list-disc recommendations">
                                                        {
                                                            recommendations.map(recommendation =>
                                                                <li key={recommendation}><Linkify text={recommendation}/></li>
                                                            )
                                                        }
                                                    </ul>
                                                </div>
                                            )
                                        }
                                        {
                                            riskText && (
                                                <div className="markdown-body sm:text-xl text-gray-900">
                                                    <ReactMarkdown
                                                        children={riskText}
                                                        remarkPlugins={[remarkGfm]}
                                                    />
                                                </div>
                                            )
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }

            <div className="print:hidden text-center mt-6 lg:mt-12">
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center h-12 px-14 text-lg bg-lime-500 hover:bg-lime-400 text-white font-bold uppercase rounded-xl"
                >
                    {intl.formatMessage({id: "label.export.pdf"})}
                </button>
            </div>
        </>
    )
})

const getHeight = (windowWidth: number) => {
    if (windowWidth < 640) return 340

    if (windowWidth < 1280) return 480

    return 680
}