import { BroadCast } from "../pages/BroadCast";
import { Client } from "../pages/Client";
import { StreamViewer } from "../pages/StreamViewer";

export const routes = [
    {
        element: <BroadCast/>,
        protected: false,
        name: "Broadcast",
        path: "/broadcast"
    },
    {
        element: <Client/>,
        protected: false,
        name: "Client",
        path: "/client"
    },
    {
        element: <StreamViewer/>,
        protected: false,
        name: "Stream",
        path: "/stream"
    }
]