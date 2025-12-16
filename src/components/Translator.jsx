import { useState, useEffect } from "react";
import { lightTheme, darkTheme } from "../themes"; // Импортируем цвета

export default function Translator() {
  const [text, setText] = useState("");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState(["kk"]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState("light");

  // 1. Инициализация темы при загрузке
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
  }, []);

  // 2. ПРИМЕНЕНИЕ ТЕМЫ: При каждом изменении theme красим сайт
  useEffect(() => {
    const themeObj = theme === "light" ? lightTheme : darkTheme;

    Object.keys(themeObj).forEach((key) => {
      document.documentElement.style.setProperty(key, themeObj[key]);
    });

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const languages = [
    { code: "ru", name: "Русский" },
    { code: "kk", name: "Казахский" },
    { code: "ky", name: "Киргизский" },
    { code: "az", name: "Азербайджанский" },
    { code: "uz", name: "Узбекский" },
    { code: "uk", name: "Украинский" },
    { code: "hi", name: "Хинди" },
    { code: "en", name: "Английский" },
    { code: "tr", name: "Турецкий" },
    { code: "fr", name: "Французский" },
    { code: "de", name: "Немецкий" },
    { code: "es", name: "Испанский" },
    { code: "zh", name: "Китайский" },
    { code: "ja", name: "Японский" },
  ];

  const handleTargetChange = (code) => {
    setTargets((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  function detectLanguageImproved(text) {
    const t = text.trim().toLowerCase();
    if (/^[a-z0-9.,!?'"()\-\s]+$/i.test(t)) return "en";
    if (/[а-яёүұқғәіһңө]/i.test(t)) return "ru";
    if (/[çğıöşü]/i.test(t)) return "tr";
    return "auto";
  }

  const toLatin = (s) =>
    s
      .replace(/А/g, "A")
      .replace(/В/g, "B")
      .replace(/Е/g, "E")
      .replace(/К/g, "K")
      .replace(/М/g, "M")
      .replace(/Н/g, "N")
      .replace(/О/g, "O")
      .replace(/Р/g, "R")
      .replace(/С/g, "S")
      .replace(/Т/g, "T")
      .replace(/У/g, "U")
      .replace(/а/g, "a")
      .replace(/в/g, "v")
      .replace(/е/g, "e")
      .replace(/к/g, "k")
      .replace(/м/g, "m")
      .replace(/н/g, "n")
      .replace(/о/g, "o")
      .replace(/р/g, "r")
      .replace(/с/g, "s")
      .replace(/т/g, "t")
      .replace(/у/g, "u");

  async function handleTranslate() {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setTranslations({});

    const source = detectLanguageImproved(text);
    const apiUrl = ""; // Работаем через Vercel API

    try {
      // 3. УСКОРЕНИЕ: Запускаем все переводы параллельно (без задержек)
      const promises = targets.map(async (target) => {
        try {
          const res = await fetch(`${apiUrl}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, source, target }),
          });

          const json = await res.json();

          if (json.error) throw new Error(json.error);

          let output = json.translation || "Ошибка сервера";
          if (target === "tr") output = toLatin(output);

          // Обновляем UI сразу по готовности каждого языка
          setTranslations((prev) => ({ ...prev, [target]: output }));
        } catch (err) {
          console.error(`Ошибка ${target}:`, err);
          setTranslations((prev) => ({
            ...prev,
            [target]: "Не удалось перевести",
          }));
        }
      });

      // Ждем завершения всех запросов
      await Promise.all(promises);
    } catch (globalErr) {
      setError("Общая ошибка приложения");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div>
      {/* Кнопка смены темы справа сверху */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === "light" ? "🌙 Тёмная тема" : "☀️ Светлая тема"}
        </button>
      </div>

      <h2>KAMI Menu Translator</h2>
      <p className="small">Переводчик для электронных меню</p>

      <textarea
        className="input-box"
        placeholder="Введите названия блюд (можно списком)..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDropdown((prev) => !prev)}>
            {targets.length > 0 ? `Языки: ${targets.length}` : "Выбрать языки"}{" "}
            ▾
          </button>

          {showDropdown && (
            <div className="dropdown">
              {languages.map((l) => (
                <label key={l.code}>
                  <input
                    type="checkbox"
                    checked={targets.includes(l.code)}
                    onChange={() => handleTargetChange(l.code)}
                  />
                  {l.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleTranslate}
          disabled={loading}>
          {loading ? "Переводим..." : "Перевести"}
        </button>

        <button
          className="btn btn-grey"
          onClick={() => {
            setText("");
            setTranslations({});
            setError("");
          }}>
          Очистить
        </button>
      </div>

      {error && <div style={{ marginTop: 12, color: "#ef4444" }}>{error}</div>}

      {/* Вывод результатов */}
      {Object.keys(translations).length > 0 && (
        <div className="result-block">
          {Object.entries(translations).map(([lang, result]) => {
            const langName =
              languages.find((l) => l.code === lang)?.name || lang;

            return (
              <div key={lang} className="result-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}>
                  <span className="result-title">{langName}</span>
                  <button
                    onClick={(e) => {
                      handleCopy(result);
                      // Визуальный эффект смены текста на кнопке
                      const originalText = e.target.innerText;
                      e.target.innerText = "Скопировано!";
                      e.target.classList.add("copied");
                      setTimeout(() => {
                        e.target.innerText = "Копировать";
                        e.target.classList.remove("copied");
                      }, 1000);
                    }}
                    className="btn btn-primary"
                    style={{
                      padding: "4px 12px",
                      fontSize: "0.75rem",
                      height: "auto",
                    }}>
                    Копировать
                  </button>
                </div>
                <div className="result-text">{result}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
