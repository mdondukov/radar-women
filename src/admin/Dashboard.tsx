import React from "react";
import {useSearchParams} from "react-router-dom";
import type {EChartsOption} from "echarts";

import {Chart} from "./Chart";
import {
    bishkekTime,
    buildModel,
    Completion,
    countDevices,
    Filters,
    filterCompletions,
    filtersFromParams,
    filtersToParams,
    filterVisits,
    hasFilters,
} from "./model";
import {IndicatorDef, Stats, Zone} from "./types";

const ZONE_COLOR: Record<Zone, string> = {high: "#dc2626", medium: "#f59e0b", low: "#16a34a"}
const ZONE_NAME: Record<Zone, string> = {high: "высокий риск", medium: "средний риск", low: "низкий риск"}
const WEIGHT_COLOR = ["#dc2626", "#f97316", "#a3a3a3", "#16a34a"]
const LOCALE_NAME: Record<string, string> = {ru: "русский", ky: "кыргызча"}
const DEVICE_NAME: Record<string, string> = {mobile: "телефон", desktop: "компьютер"}
const PAGE = 50

const fmt = (n: number, digits = 1) => n.toLocaleString("ru-RU", {maximumFractionDigits: digits})
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

const zoneOf = (ind: IndicatorDef, value: number): Zone => {
    if (ind.high_risk_max != null && value <= ind.high_risk_max) return "high"
    if (ind.medium_risk_max != null && value <= ind.medium_risk_max) return "medium"
    return "low"
}

const daysBetween = (from: string, to: string): string[] => {
    const out: string[] = []
    for (let d = new Date(from + "T00:00:00Z"); d.toISOString().slice(0, 10) <= to; d.setUTCDate(d.getUTCDate() + 1)) {
        out.push(d.toISOString().slice(0, 10))
    }
    return out
}

const Card: React.FC<{title: string, hint?: string, children: React.ReactNode, className?: string}> =
    ({title, hint, children, className = ""}) => (
        <section className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
            <h2 className="text-lg font-bold text-blue-900 mb-1">{title}</h2>
            {hint && <p className="text-sm text-gray-500 mb-3">{hint}</p>}
            {children}
        </section>
    )

export const Dashboard: React.FC<{stats: Stats}> = ({stats}) => {
    const model = React.useMemo(() => buildModel(stats), [stats])
    const [params, setParams] = useSearchParams()
    const filters = React.useMemo(() => filtersFromParams(params), [params])
    const setFilters = (f: Filters) => setParams(filtersToParams(f), {replace: true})
    const [indicatorCode, setIndicatorCode] = React.useState(stats.indicators[0]?.code)
    const [detail, setDetail] = React.useState<Completion | null>(null)
    const [shown, setShown] = React.useState(PAGE)

    const indicators = stats.indicators
    const regionName = React.useMemo(() => new Map(stats.regions.map(r => [r.code, r.name])), [stats])
    const areaName = React.useMemo(
        () => new Map(stats.regions.flatMap(r => r.areas.map(a => [a.code, a.name] as const))), [stats])
    const answerText = React.useMemo(() => {
        const m = new Map<string, {question: string, answer: string, weight: number}>()
        indicators.forEach(i => i.questions.forEach(q => q.answers.forEach(a =>
            m.set(`${q.code}|${a.code}`, {question: q.content, answer: a.content, weight: a.weight}))))
        return m
    }, [indicators])

    const completions = React.useMemo(() => filterCompletions(model.completions, filters), [model, filters])
    const visits = React.useMemo(
        () => filterVisits(model.visits, filters, completions), [model, filters, completions])

    // Each chart ignores its own dimension, so the current choice stays visible
    // among the alternatives instead of collapsing to a single bar.
    const without = (patch: Partial<Filters>) => ({...filters, ...patch})
    const completionsAllRegions = React.useMemo(
        () => filterCompletions(model.completions, without({region: undefined, area: undefined})),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [model, params])
    const completionsAllAreas = React.useMemo(
        () => filterCompletions(model.completions, without({area: undefined})),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [model, params])
    const visitsAllDays = React.useMemo(() => {
        const f = without({from: undefined, to: undefined})
        return filterVisits(model.visits, f, filterCompletions(model.completions, f))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model, params])
    const completionsAllLocales = React.useMemo(
        () => filterCompletions(model.completions, without({locale: undefined})),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [model, params])
    const completionsAllDevices = React.useMemo(
        () => filterCompletions(model.completions, without({device: undefined})),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [model, params])

    const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) =>
        setFilters({...filters, [key]: filters[key] === value ? undefined : value})

    // ---------- timeline ----------
    const timelineOption = React.useMemo<EChartsOption>(() => {
        const allDays = model.visits.map(v => v.day).sort()
        if (!allDays.length) return {}
        const days = daysBetween(allDays[0], allDays[allDays.length - 1])
        const reached = new Map<string, number>()
        const left = new Map<string, number>()
        visitsAllDays.forEach(v => {
            const m = v.reachedRadar ? reached : left
            m.set(v.day, (m.get(v.day) ?? 0) + 1)
        })
        const selected = (d: string) => (!filters.from || d >= filters.from) && (!filters.to || d <= filters.to)
        const bar = (m: Map<string, number>, color: string) => days.map(d => ({
            value: m.get(d) ?? 0,
            itemStyle: {color, opacity: hasPeriod ? (selected(d) ? 1 : 0.25) : 1},
        }))
        const hasPeriod = !!(filters.from || filters.to)
        const until = stats.log_history.until.slice(0, 10)
        return {
            tooltip: {trigger: "axis"},
            legend: {data: ["дошли до радара", "не дошли"]},
            grid: {left: 40, right: 20, top: 40, bottom: 60},
            xAxis: {type: "category", data: days},
            yAxis: {type: "value", minInterval: 1},
            dataZoom: [{type: "slider", height: 18, bottom: 10}],
            series: [
                {
                    name: "дошли до радара", type: "bar", stack: "v", data: bar(reached, "#16a34a"),
                    itemStyle: {color: "#16a34a"},
                    markLine: {
                        symbol: "none",
                        label: {formatter: "начало сбора ответов", position: "insideEndTop"},
                        lineStyle: {color: "#1e3a8a", type: "dashed"},
                        data: [{xAxis: until}],
                    },
                },
                {name: "не дошли", type: "bar", stack: "v", data: bar(left, "#cbd5e1"), itemStyle: {color: "#cbd5e1"}},
            ],
        }
    }, [model, visitsAllDays, filters.from, filters.to, stats.log_history.until])

    // ---------- indicators ----------
    const indicatorAverages = indicators.map(i => {
        const values = completions.map(c => c.indicators[i.code]?.value).filter((v): v is number => v != null)
        return {ind: i, value: avg(values), n: values.length}
    })
    const indicatorOption: EChartsOption = {
        tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
        grid: {left: 10, right: 40, top: 10, bottom: 30, containLabel: true},
        xAxis: {type: "value", min: 0, max: 3, interval: 0.5},
        yAxis: {type: "category", inverse: true, data: indicatorAverages.map(a => a.ind.name), axisLabel: {width: 200, overflow: "truncate"}},
        series: [{
            type: "bar",
            data: indicatorAverages.map(a => ({
                value: Number(a.value.toFixed(2)),
                itemStyle: {
                    color: ZONE_COLOR[zoneOf(a.ind, a.value)],
                    borderColor: a.ind.code === indicatorCode ? "#1e3a8a" : undefined,
                    borderWidth: a.ind.code === indicatorCode ? 3 : 0,
                },
            })),
            label: {show: true, position: "right", formatter: "{c}"},
        }],
    }

    const zoneOption: EChartsOption = {
        tooltip: {trigger: "axis", axisPointer: {type: "shadow"}},
        legend: {data: (["high", "medium", "low"] as Zone[]).map(z => ZONE_NAME[z])},
        grid: {left: 10, right: 30, top: 40, bottom: 30, containLabel: true},
        xAxis: {type: "value", minInterval: 1},
        yAxis: {type: "category", inverse: true, data: indicators.map(i => i.name), axisLabel: {width: 200, overflow: "truncate"}},
        series: (["high", "medium", "low"] as Zone[]).map(zone => ({
            name: ZONE_NAME[zone],
            type: "bar",
            stack: "z",
            data: indicators.map(i => ({
                value: completions.filter(c => c.indicators[i.code]?.zone === zone).length,
                itemStyle: {
                    color: ZONE_COLOR[zone],
                    opacity: filters.zone && !(filters.zone.indicator === i.code && filters.zone.zone === zone) ? 0.35 : 1,
                },
            })),
        })),
    }

    // ---------- regions ----------
    const regionCounts = stats.regions.map(r => ({
        code: r.code, name: r.name, n: completionsAllRegions.filter(c => c.region === r.code).length,
    })).filter(r => r.n > 0)
    const regionOption: EChartsOption = {
        tooltip: {},
        grid: {left: 10, right: 40, top: 10, bottom: 30, containLabel: true},
        xAxis: {type: "value", minInterval: 1},
        yAxis: {type: "category", inverse: true, data: regionCounts.map(r => r.name)},
        series: [{
            type: "bar",
            data: regionCounts.map(r => ({
                value: r.n,
                itemStyle: {color: "#1e40af", opacity: filters.region && filters.region !== r.code ? 0.3 : 1},
            })),
            label: {show: true, position: "right"},
        }],
    }
    const region = stats.regions.find(r => r.code === filters.region)
    const areaCounts = (region?.areas ?? []).map(a => ({
        code: a.code, name: a.name, n: completionsAllAreas.filter(c => c.area === a.code).length,
    })).filter(a => a.n > 0)
    const areaOption: EChartsOption = {
        tooltip: {},
        grid: {left: 10, right: 40, top: 10, bottom: 30, containLabel: true},
        xAxis: {type: "value", minInterval: 1},
        yAxis: {type: "category", inverse: true, data: areaCounts.map(a => a.name), axisLabel: {width: 260, overflow: "truncate"}},
        series: [{
            type: "bar",
            data: areaCounts.map(a => ({
                value: a.n,
                itemStyle: {color: "#0e7490", opacity: filters.area && filters.area !== a.code ? 0.3 : 1},
            })),
            label: {show: true, position: "right"},
        }],
    }

    // ---------- funnel ----------
    const funnel = [
        {name: "начали", n: visits.length},
        ...indicators.map((i, k) => ({name: `${k + 1}. ${i.name}`, n: visits.filter(v => v.blocks > k).length})),
        {name: "радар", n: visits.filter(v => v.reachedRadar).length},
    ]
    const funnelOption: EChartsOption = {
        tooltip: {},
        grid: {left: 10, right: 80, top: 10, bottom: 30, containLabel: true},
        xAxis: {type: "value", minInterval: 1},
        yAxis: {type: "category", inverse: true, data: funnel.map(f => f.name), axisLabel: {width: 260, overflow: "truncate"}},
        series: [{
            type: "bar",
            data: funnel.map(f => f.n),
            itemStyle: {color: "#65a30d"},
            label: {
                show: true, position: "right",
                formatter: p => `${p.value} (${funnel[0].n ? Math.round(100 * Number(p.value) / funnel[0].n) : 0}%)`,
            },
        }],
    }

    // ---------- pies ----------
    const pie = (items: Completion[], key: "locale" | "device", names: Record<string, string>, active?: string): EChartsOption => {
        const counts = new Map<string, number>()
        items.forEach(c => {
            const k = c[key] ?? "unknown"
            counts.set(k, (counts.get(k) ?? 0) + 1)
        })
        return {
            tooltip: {trigger: "item", formatter: "{b}: {c} ({d}%)"},
            legend: {bottom: 0},
            series: [{
                type: "pie",
                radius: ["35%", "62%"],
                center: ["50%", "42%"],
                label: {show: true, position: "inside", formatter: "{d}%", color: "#fff"},
                data: Array.from(counts, ([k, n]) => ({
                    name: names[k] ?? "неизвестно", value: n, id: k,
                    itemStyle: {opacity: active && active !== k ? 0.3 : 1},
                })),
            }],
        }
    }

    // ---------- questions of the selected indicator ----------
    const selectedIndicator = indicators.find(i => i.code === indicatorCode) ?? indicators[0]

    const toggleAnswer = (question: string, answer: string) => {
        const exists = filters.answers.some(a => a.question === question && a.answer === answer)
        setFilters({
            ...filters,
            answers: exists
                ? filters.answers.filter(a => !(a.question === question && a.answer === answer))
                : [...filters.answers, {question, answer}],
        })
    }

    // ---------- export ----------
    const exportCsv = () => {
        const head = ["дата", "регион", "район", "язык", "устройство", "средний балл",
            ...indicators.map(i => i.name)]
        const rows = completions.map(c => [
            bishkekTime(c.at),
            c.region ? regionName.get(c.region) ?? c.region : "",
            c.area ? areaName.get(c.area) ?? c.area : "",
            LOCALE_NAME[c.locale] ?? c.locale,
            c.device ? DEVICE_NAME[c.device] : "",
            c.avg.toFixed(2),
            ...indicators.map(i => c.indicators[i.code]?.value.toFixed(1) ?? ""),
        ])
        const csv = [head, ...rows]
            .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(";"))
            .join("\r\n")
        const blob = new Blob(["﻿" + csv], {type: "text/csv;charset=utf-8"})
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = `radar-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(a.href)
    }

    // ---------- filter chips ----------
    const chips: {label: string, clear: () => void}[] = []
    if (filters.from || filters.to) {
        chips.push({
            label: `период: ${filters.from ?? "…"} - ${filters.to ?? "…"}`,
            clear: () => setFilters({...filters, from: undefined, to: undefined}),
        })
    }
    if (filters.region) chips.push({label: `регион: ${regionName.get(filters.region) ?? filters.region}`, clear: () => setFilters({...filters, region: undefined, area: undefined})})
    if (filters.area) chips.push({label: `район: ${areaName.get(filters.area) ?? filters.area}`, clear: () => toggle("area", filters.area)})
    if (filters.locale) chips.push({label: `язык: ${LOCALE_NAME[filters.locale] ?? filters.locale}`, clear: () => toggle("locale", filters.locale)})
    if (filters.device) chips.push({label: `устройство: ${DEVICE_NAME[filters.device] ?? filters.device}`, clear: () => toggle("device", filters.device)})
    if (filters.zone) {
        const name = indicators.find(i => i.code === filters.zone!.indicator)?.name
        chips.push({label: `${name}: ${ZONE_NAME[filters.zone.zone]}`, clear: () => setFilters({...filters, zone: undefined})})
    }
    filters.answers.forEach(a => {
        const t = answerText.get(`${a.question}|${a.answer}`)
        chips.push({label: `«${t?.question ?? a.question}» → ${t?.answer ?? a.answer}`, clear: () => toggleAnswer(a.question, a.answer)})
    })

    const logVisits = visits.filter(v => v.origin === "log").length
    const reached = visits.filter(v => v.reachedRadar).length

    return (
        <div className="space-y-5">
            {/* filters */}
            <section className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3 sticky top-0 z-10">
                <label className="text-sm text-gray-600">с
                    <input type="date" className="ml-1 border rounded px-2 py-1" value={filters.from ?? ""}
                           onChange={e => setFilters({...filters, from: e.target.value || undefined})}/>
                </label>
                <label className="text-sm text-gray-600">по
                    <input type="date" className="ml-1 border rounded px-2 py-1" value={filters.to ?? ""}
                           onChange={e => setFilters({...filters, to: e.target.value || undefined})}/>
                </label>
                <label className="text-sm text-gray-700 flex items-center gap-1"
                       title="Если с одного устройства прошли анкету несколько раз, в графиках и таблице останется только последнее прохождение">
                    <input type="checkbox" checked={!!filters.latestPerDevice}
                           onChange={e => setFilters({...filters, latestPerDevice: e.target.checked || undefined})}/>
                    только последнее прохождение с устройства
                </label>
                {chips.map(c => (
                    <button key={c.label} onClick={c.clear}
                            className="text-sm bg-blue-50 text-blue-900 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100">
                        {c.label} ✕
                    </button>
                ))}
                {hasFilters(filters) && (
                    <button onClick={() => setFilters({answers: []})} className="text-sm text-red-600 underline">
                        сбросить всё
                    </button>
                )}
                <span className="text-sm text-gray-400 ml-auto">клик по графику или таблице добавляет фильтр</span>
            </section>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    {
                        label: "начали анкету", value: fmt(visits.length, 0),
                        note: [logVisits ? `из них ${logVisits} по логам до сбора` : "",
                            `уникальных устройств: ${countDevices(visits)}`].filter(Boolean).join(" · "),
                    },
                    {
                        label: "дошли до радара", value: fmt(reached, 0),
                        note: `с ответами в базе: ${completions.length} · уникальных устройств: ${countDevices(completions)}`,
                    },
                    {label: "доля дошедших", value: visits.length ? `${Math.round(100 * reached / visits.length)}%` : "-", note: ""},
                    {label: "средний балл", value: completions.length ? fmt(avg(completions.map(c => c.avg)), 2) : "-", note: "из 3, по завершенным"},
                ].map(k => (
                    <div key={k.label} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="text-3xl font-bold text-blue-900">{k.value}</div>
                        <div className="text-gray-600">{k.label}</div>
                        {k.note && <div className="text-xs text-gray-400 mt-1">{k.note}</div>}
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-500 -mt-2">
                Уникальные устройства считаются с 24 октября 2026: браузер хранит случайный ID. Это устройства, а не люди:
                общий ноутбук на семинаре - одно устройство, режим инкогнито или очищенный браузер - новое.
            </p>

            <Card title="Прохождения по дням"
                  hint="Клик по дню - фильтр по этому дню, повторный клик снимает. До пунктирной линии данные восстановлены по логам сервера: только сам факт прохождения, без ответов.">
                <Chart option={timelineOption} height={300} onClick={p => {
                    const day = String(p.name)
                    if (filters.from === day && filters.to === day) setFilters({...filters, from: undefined, to: undefined})
                    else setFilters({...filters, from: day, to: day})
                }}/>
            </Card>

            {completions.length === 0 ? (
                <Card title="Ответы">
                    <p className="text-gray-500">
                        Нет завершенных прохождений с ответами под выбранные фильтры. Ответы сохраняются с 22 октября 2026.
                    </p>
                </Card>
            ) : (
                <>
                    <div className="grid lg:grid-cols-2 gap-5">
                        <Card title="Средний балл по показателям" hint="Клик - показать вопросы показателя ниже.">
                            <Chart option={indicatorOption} height={360}
                                   onClick={p => setIndicatorCode(indicators[p.dataIndex]?.code)}/>
                        </Card>
                        <Card title="Зоны риска по показателям" hint="Клик по сегменту - только прохождения с этой зоной.">
                            <Chart option={zoneOption} height={360} onClick={p => {
                                const ind = indicators[p.dataIndex]
                                const zone = (["high", "medium", "low"] as Zone[])[p.seriesIndex ?? 0]
                                const same = filters.zone?.indicator === ind.code && filters.zone?.zone === zone
                                setFilters({...filters, zone: same ? undefined : {indicator: ind.code, zone}})
                            }}/>
                        </Card>
                    </div>

                    <Card title={`Вопросы: ${selectedIndicator.name}`}
                          hint="Распределение ответов по завершенным прохождениям. Клик по варианту - только те, кто его выбрал (можно несколько). Цвет - балл ответа: красный 0, зеленый 3.">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {indicators.map(i => (
                                <button key={i.code} onClick={() => setIndicatorCode(i.code)}
                                        className={`text-sm rounded-full px-3 py-1 border ${i.code === selectedIndicator.code ? "bg-blue-900 text-white border-blue-900" : "border-gray-300 hover:bg-gray-100"}`}>
                                    {i.name}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-4">
                            {selectedIndicator.questions.map(q => {
                                const counts = q.answers.map(a => ({
                                    a, n: completions.filter(c => c.answers.has(`${q.code}|${a.code}`)).length,
                                }))
                                const total = counts.reduce((s, x) => s + x.n, 0)
                                return (
                                    <div key={q.code}>
                                        <div className="text-sm text-gray-800 mb-1">{q.ord}. {q.content}</div>
                                        <div className="flex w-full h-8 rounded overflow-hidden bg-gray-100">
                                            {counts.filter(x => x.n > 0).map(({a, n}) => {
                                                const active = filters.answers.some(f => f.question === q.code && f.answer === a.code)
                                                return (
                                                    <button key={a.code} title={`${a.content}: ${n} (${Math.round(100 * n / total)}%)`}
                                                            onClick={() => toggleAnswer(q.code, a.code)}
                                                            style={{width: `${100 * n / total}%`, background: WEIGHT_COLOR[a.weight] ?? "#64748b"}}
                                                            className={`text-xs text-white truncate px-1 border-r border-white ${active ? "ring-4 ring-inset ring-blue-900" : ""}`}>
                                                        {a.content} · {n}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-5">
                        <Card title="Регионы" hint="Клик - фильтр по региону, затем по району.">
                            <Chart option={regionOption} height={Math.max(160, regionCounts.length * 36 + 40)}
                                   onClick={p => {
                                       const code = regionCounts[p.dataIndex]?.code
                                       setFilters({...filters, region: filters.region === code ? undefined : code, area: undefined})
                                   }}/>
                            {region && areaCounts.length > 0 && (
                                <>
                                    <h3 className="font-bold text-blue-900 mt-4">Районы: {region.name}</h3>
                                    <Chart option={areaOption} height={Math.max(140, areaCounts.length * 36 + 40)}
                                           onClick={p => toggle("area", areaCounts[p.dataIndex]?.code)}/>
                                </>
                            )}
                        </Card>
                        <div className="grid grid-cols-2 gap-5">
                            <Card title="Язык">
                                <Chart option={pie(completionsAllLocales, "locale", LOCALE_NAME, filters.locale)} height={220}
                                       onClick={p => toggle("locale", (p.data as {id: string}).id)}/>
                            </Card>
                            <Card title="Устройство">
                                <Chart option={pie(completionsAllDevices, "device", DEVICE_NAME, filters.device)} height={220}
                                       onClick={p => toggle("device", (p.data as {id: string}).id)}/>
                            </Card>
                        </div>
                    </div>
                </>
            )}

            <Card title="Где бросают анкету"
                  hint="Сколько посетителей завершили каждый блок. Учитывает и прохождения по логам до начала сбора ответов; фильтры по ответам и зонам оставляют только прохождения с ответами в базе.">
                <Chart option={funnelOption} height={420}/>
            </Card>

            {completions.length > 0 && (
                <Card title={`Завершенные прохождения (${completions.length})`}
                      hint="Клик по строке - подробности. Клик по региону, языку, устройству или баллу - фильтр.">
                    <div className="flex justify-end mb-2">
                        <button onClick={exportCsv} className="text-sm bg-lime-600 hover:bg-lime-500 text-white rounded px-3 py-1">
                            выгрузить в CSV (Excel)
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2 pr-3">дата (Бишкек)</th>
                                <th className="pr-3">регион / район</th>
                                <th className="pr-3">язык</th>
                                <th className="pr-3">устройство</th>
                                <th className="pr-3">средний</th>
                                {indicators.map(i => <th key={i.code} className="pr-2" title={i.name}>{i.ord}</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {completions.slice(0, shown).map(c => (
                                <tr key={c.id} className="border-b hover:bg-blue-50 cursor-pointer" onClick={() => setDetail(c)}>
                                    <td className="py-2 pr-3 whitespace-nowrap">{bishkekTime(c.at)}</td>
                                    <td className="pr-3">
                                        <span className="underline decoration-dotted" onClick={e => {
                                            e.stopPropagation()
                                            if (c.region) setFilters({...filters, region: c.region, area: undefined})
                                        }}>{c.region ? regionName.get(c.region) ?? c.region : "-"}</span>
                                        {c.area && <span className="text-gray-500"> / <span className="underline decoration-dotted" onClick={e => {
                                            e.stopPropagation()
                                            setFilters({...filters, region: c.region ?? undefined, area: c.area ?? undefined})
                                        }}>{areaName.get(c.area) ?? c.area}</span></span>}
                                    </td>
                                    <td className="pr-3"><span className="underline decoration-dotted" onClick={e => {
                                        e.stopPropagation()
                                        toggle("locale", c.locale)
                                    }}>{LOCALE_NAME[c.locale] ?? c.locale}</span></td>
                                    <td className="pr-3"><span className="underline decoration-dotted" onClick={e => {
                                        e.stopPropagation()
                                        if (c.device) toggle("device", c.device)
                                    }}>{c.device ? DEVICE_NAME[c.device] : "-"}</span></td>
                                    <td className="pr-3 font-bold">{c.avg.toFixed(1)}</td>
                                    {indicators.map(i => {
                                        const v = c.indicators[i.code]
                                        return (
                                            <td key={i.code} className="pr-2">
                                                {v && <span className="inline-block rounded px-1 text-white"
                                                            style={{background: ZONE_COLOR[v.zone]}}
                                                            title={`${i.name}: ${ZONE_NAME[v.zone]}`}
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                setFilters({...filters, zone: {indicator: i.code, zone: v.zone}})
                                                            }}>{v.value.toFixed(1)}</span>}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    {shown < completions.length && (
                        <button onClick={() => setShown(shown + PAGE)} className="mt-3 text-sm text-blue-900 underline">
                            показать еще
                        </button>
                    )}
                </Card>
            )}

            {detail && (
                <Detail completion={detail} indicators={indicators} answerText={answerText}
                        place={[detail.region && regionName.get(detail.region), detail.area && areaName.get(detail.area)]
                            .filter(Boolean).join(" / ")}
                        onClose={() => setDetail(null)}/>
            )}
        </div>
    )
}

const Detail: React.FC<{
    completion: Completion
    indicators: IndicatorDef[]
    answerText: Map<string, {question: string, answer: string, weight: number}>
    place: string
    onClose: () => void
}> = ({completion, indicators, answerText, place, onClose}) => {
    const option: EChartsOption = {
        radar: {
            indicator: indicators.map(i => ({name: i.name.length > 22 ? i.name.slice(0, 21) + "…" : i.name, max: 3})),
            radius: "62%",
        },
        series: [{
            type: "radar",
            data: [{value: indicators.map(i => completion.indicators[i.code]?.value ?? 0), areaStyle: {opacity: 0.25}}],
            itemStyle: {color: "#0B6B32"},
        }],
    }
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto p-4" onClick={onClose}>
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 mt-10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-xl font-bold text-blue-900">Прохождение #{completion.id}</h2>
                        <p className="text-sm text-gray-500">
                            {bishkekTime(completion.at)} · {place || "регион не указан"} · {LOCALE_NAME[completion.locale] ?? completion.locale}
                            {completion.device ? ` · ${DEVICE_NAME[completion.device]}` : ""} · средний балл {completion.avg.toFixed(2)}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-800">✕</button>
                </div>
                <Chart option={option} height={360}/>
                {indicators.map(i => (
                    <div key={i.code} className="mt-4">
                        <h3 className="font-bold text-blue-900">
                            {i.name}: {completion.indicators[i.code]?.value.toFixed(1) ?? "-"}
                        </h3>
                        <ul className="text-sm">
                            {i.questions.map(q => {
                                const picked = q.answers.filter(a => completion.answers.has(`${q.code}|${a.code}`))
                                return (
                                    <li key={q.code} className="py-1 border-b border-gray-100">
                                        <span className="text-gray-600">{q.ord}. {q.content}</span>
                                        {" - "}
                                        {picked.length ? picked.map(a => (
                                            <span key={a.code} className="font-medium" style={{color: WEIGHT_COLOR[answerText.get(`${q.code}|${a.code}`)?.weight ?? 0]}}>
                                                {a.content} ({a.weight}){" "}
                                            </span>
                                        )) : <span className="text-gray-400">нет ответа</span>}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
