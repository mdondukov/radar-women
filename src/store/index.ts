import {createContext} from "react";

import {StepStore} from "./StepStore";
import {RegionStore} from "./RegionStore";
import {QuestionStore} from "./QuestionStore";
import {SummaryStore} from "./SummaryStore";
import {MessageStore} from "./MessageStore";
import {UIStore} from "./UIStore";

export const rootStoreContext = createContext({
    stepStore: new StepStore(),
    regionStore: new RegionStore(),
    questionStore: new QuestionStore(),
    summaryStore: new SummaryStore(),
    messageStore: new MessageStore(),
    uiStore: new UIStore()
})