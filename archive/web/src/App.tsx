import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ListPage } from "./pages/ListPage";
import { ViewPage } from "./pages/ViewPage";

export function App() {
    return (
        <BrowserRouter>
            <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 2000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        fontSize: '14px',
                    },
                }}
            />
            <Routes>
                <Route path="/" element={<ListPage />} />
                <Route path="/view/:filename" element={<ViewPage />} />
            </Routes>
        </BrowserRouter>
    );
}

