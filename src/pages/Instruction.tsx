import React from "react";
import {observer} from "mobx-react-lite";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {useIntl} from "react-intl";

import jamInstSvg from "../assets/img/jamilya/jamilya_instr.svg";
import {useStores} from "../hooks/use-stores";
import {LangButton, MainButton} from "../components";
import {Link} from "react-router-dom";
import {IoMdRocket} from "react-icons/io";

const Instruction: React.FC = observer(() => {
    const intl = useIntl()
    const {locale} = useStores().uiStore
    const [tutorial, setTutorial] = React.useState("")
    const [farewell, setFarewell] = React.useState("")

    React.useEffect(() => {
        fetch(`/md/tutorial-${locale}.md`)
            .then(res => res.text())
            .then((text) => setTutorial(text))
            .catch((e) => {
                console.error(e)
            })

        fetch(`/md/farewell-${locale}.md`)
            .then(res => res.text())
            .then((text) => setFarewell(text))
            .catch((e) => {
                console.error(e)
            })
    }, [locale])

    return (
        <>
            <div className="mb-6">
                <LangButton/>
            </div>
            <div className="xl:grid xl:grid-cols-12">
                <div className="xl:col-span-6">
                    <h1 className="text-2xl sm:text-4xl text-lime-500 font-bold uppercase mb-6 lg:mb-12">
                        {intl.formatMessage({id: "page.instr.name"})}
                    </h1>
                    <div className="sm:text-lg font-medium text-blue-800 mb-6 lg:mb-12">
                        <ReactMarkdown children={tutorial} remarkPlugins={[remarkGfm]}/>
                    </div>
                    <MainButton path="/poll" name={intl.formatMessage({id: "label.start"})}/>
                </div>
                <div className="xl:col-span-6 mt-6 lg:mt-12 xl:mt-0 relative">
                    <div className="grid justify-items-stretch">
                        <div className="md:justify-self-end justify-self-center md:z-10 z-0">
                            <img
                                src={jamInstSvg}
                                alt={intl.formatMessage({id: "label.jamilya"})}
                                className="h-[520px]"
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-0 md:top-0 md:w-3/5 md:z-0 z-10 md:ml-6">
                        <div className="bg-white rounded-xl px-6 md:py-8 py-14 text-center">
                            <ReactMarkdown children={farewell} remarkPlugins={[remarkGfm]}/>
                            <div className="flex justify-center -mb-2 mt-6">
                                <Link
                                    to="/poll"
                                    className="block flex items-center text-blue-800 hover:opacity-75"
                                >
                                    <div className="flex-none mr-2">
                                        <IoMdRocket size={24}/>
                                    </div>
                                    <div className="flex-auto align-middle">
                                        {intl.formatMessage({id: "label.farewell"})}
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

export default Instruction