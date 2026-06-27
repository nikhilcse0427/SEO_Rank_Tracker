import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <ThemeProvider>
            <AppProvider>
                <App />
            </AppProvider>
        </ThemeProvider>
    </BrowserRouter>
);
