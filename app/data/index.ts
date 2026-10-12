import type { Creator, StreamRecord } from "~/lib/types";

import creatorsData from "./creators.json";
import streamsData from "./streams.json";

export const creators: Creator[] = creatorsData as Creator[];
export const streams: StreamRecord[] = streamsData as StreamRecord[];
