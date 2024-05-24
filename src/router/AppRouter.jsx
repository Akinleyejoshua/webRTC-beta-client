import { Routes, Route } from "react-router-dom";
import { routes } from "./routes";

export const AppRouter = () => {
    return <Routes children={routes.map((item, i) => {
        return <Route {...item} key={i} />
    })} />

}