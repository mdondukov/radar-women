import React from "react";
import {observer} from "mobx-react-lite";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {useIntl} from "react-intl";

import {InstrButton, LangButton, MainButton} from "../components";
import jamStartSvg from "../assets/img/jamilya/jamilya_start.svg"
import {useStores} from "../hooks/use-stores";

const Home: React.FC = observer(() => {
    const intl = useIntl()
    const {locale} = useStores().uiStore
    const [intro, setIntro] = React.useState("")
    const [welcome, setWelcome] = React.useState("")

    React.useEffect(() => {
        fetch(`/md/intro-${locale}.md`)
            .then(res => res.text())
            .then((text) => setIntro(text))
            .catch((e) => console.error(e))

        fetch(`/md/welcome-${locale}.md`)
            .then(res => res.text())
            .then((text) => setWelcome(text))
            .catch((e) => console.error(e))
    }, [locale])

    return (
        <>
            <div className="mb-6">
                <LangButton/>
            </div>
            <div className="xl:grid xl:grid-cols-12">
                <div className="xl:col-span-6">
                    <h1 className="text-2xl sm:text-4xl text-lime-500 font-bold uppercase mb-6 lg:mb-12">
                        {intl.formatMessage({id: "page.home.name"})}
                    </h1>
                    <div className="sm:text-lg font-medium text-blue-800 mb-6 lg:mb-12">
                        <ReactMarkdown children={intro} remarkPlugins={[remarkGfm]}/>
                    </div>
                    <MainButton path="/poll" name={intl.formatMessage({id: "label.start"})}/>
                </div>
                <div className="xl:col-span-6 mt-6 lg:mt-12 xl:mt-0 relative">
                    <div className="grid justify-items-stretch">
                        <div className="md:justify-self-end justify-self-center md:z-10 z-0">
                            <img
                                src={jamStartSvg}
                                alt={intl.formatMessage({id: "label.jamilya"})}
                                className="h-[520px]"
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-0 md:top-0 md:w-3/5 md:z-0 z-10 md:ml-6">
                        <div className="bg-white rounded-xl px-6 py-8 text-center">
                            <ReactMarkdown children={welcome} remarkPlugins={[remarkGfm]}/>

                            <div className="flex justify-center -mb-2 mt-6">
                                <InstrButton path="/instruction"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

export default Home