import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ListPage } from "./pages/ListPage";
import { ViewPage } from "./pages/ViewPage";

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<ListPage />} />
                <Route path="/view/:filename" element={<ViewPage />} />
            </Routes>
        </BrowserRouter>
    );
}

