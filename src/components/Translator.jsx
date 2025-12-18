import { useState, useEffect } from "react";
import { lightTheme, darkTheme } from "../themes";

export default function Translator() {
  const [text, setText] = useState("");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // По умолчанию ставим 2 языка, чтобы сразу видеть порядок
  const [targets, setTargets] = useState(["kk", "en"]);
  const [showDropdown, setShowDropdown] = useState(false);

  // 1. Инициализация темы (Сразу берем из памяти или ставим light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // 2. ЖЕЛЕЗНАЯ ЛОГИКА ТЕМЫ:
  // При любом изменении 'theme', мы принудительно красим сайт
  useEffect(() => {
    const themeObj = theme === "light" ? lightTheme : darkTheme;

    // Применяем CSS переменные
    Object.keys(themeObj).forEach((key) => {
      document.documentElement.style.setProperty(key, themeObj[key]);
    });

    // Сохраняем в память
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    // Просто меняем значение, useEffect сделает остальное
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
    { code: "ar", name: "Арабский" },
  ];

  const handleTargetChange = (code) => {
    setTargets((prev) => {
      // Если язык уже есть — убираем его
      if (prev.includes(code)) return prev.filter((c) => c !== code);
      // Если нет — добавляем в конец
      return [...prev, code];
    });
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
    const apiUrl = "";

    try {
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

          setTranslations((prev) => ({ ...prev, [target]: output }));
        } catch (err) {
          console.error(`Ошибка ${target}:`, err);
          setTranslations((prev) => ({
            ...prev,
            [target]: "Не удалось перевести",
          }));
        }
      });

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
      {/* Кнопка смены темы */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          style={{ marginBottom: 10 }}>
          {theme === "light" ? "🌙 Тёмная тема" : "☀️ Светлая тема"}
        </button>
      </div>

      <h2>KAMI Menu Translator</h2>
      <p className="small">Переводчик для электронных меню</p>

      <textarea
        className="input-box"
        rows={4}
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

      {/* --- ИСПРАВЛЕНИЕ ПОРЯДКА ВЫВОДА --- */}
      {/* Мы проверяем targets (список языков), а не translations. 
          Это гарантирует правильный порядок. */}
      {Object.keys(translations).length > 0 && (
        <div className="result-block">
          {targets.map((lang) => {
            // Если перевода для этого языка еще нет — пропускаем пока
            if (!translations[lang]) return null;

            const result = translations[lang];
            const langName =
              languages.find((l) => l.code === lang)?.name || lang;

            return (
              <div key={lang} className="result-item" style={{ marginTop: 15 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}>
                  <span
                    className="result-title"
                    style={{ fontWeight: "bold", opacity: 0.7 }}>
                    {langName}
                  </span>
                  <button
                    onClick={(e) => {
                      handleCopy(result);
                      e.target.innerText = "Скопировано!";
                      setTimeout(
                        () => (e.target.innerText = "Копировать"),
                        1000
                      );
                    }}
                    className="btn btn-primary"
                    style={{ padding: "4px 12px", fontSize: "0.75rem" }}>
                    Копировать
                  </button>
                </div>
                <div className="result-text" style={{ whiteSpace: "pre-wrap" }}>
                  {result}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
