import { useEffect, useState } from "react";
import Translator from "./components/Translator";
import { lightTheme, darkTheme } from "./themes";
import "./main.css";

export default function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const selectedTheme = theme === "light" ? lightTheme : darkTheme;
    Object.entries(selectedTheme).forEach(([key, value]) =>
      document.documentElement.style.setProperty(key, value)
    );
  }, [theme]);

  return (
    <div className="app">
      <div className="card">
        <div className="header">
        </div>

        <p className="small">Переводчик для электронных меню (На все языки)</p>

        <Translator />
      </div>
    </div>
  );
}
