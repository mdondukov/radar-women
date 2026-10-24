import React from "react";
import * as echarts from "echarts";

interface ChartProps {
    option: echarts.EChartsOption
    height?: number
    onClick?: (params: echarts.ECElementEvent) => void
}

/** Thin ECharts wrapper: keeps one instance per mount, follows the container
 *  size, and forwards clicks (the dashboard turns them into filters). */
export const Chart: React.FC<ChartProps> = ({option, height = 320, onClick}) => {
    const ref = React.useRef<HTMLDivElement>(null)
    const chart = React.useRef<echarts.ECharts | null>(null)
    const clickRef = React.useRef(onClick)
    clickRef.current = onClick

    React.useEffect(() => {
        if (!ref.current) return
        const instance = echarts.init(ref.current)
        chart.current = instance
        instance.on("click", params => clickRef.current?.(params as echarts.ECElementEvent))
        const observer = new ResizeObserver(() => instance.resize())
        observer.observe(ref.current)
        return () => {
            observer.disconnect()
            instance.dispose()
            chart.current = null
        }
    }, [])

    React.useEffect(() => {
        chart.current?.setOption(option, true)
    }, [option])

    return <div ref={ref} style={{height, width: "100%", cursor: onClick ? "pointer" : "default"}}/>
}
