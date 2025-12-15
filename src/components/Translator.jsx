import { useState, useEffect } from "react";

export default function Translator() {
  const [text, setText] = useState("");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState(["kk"]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.body.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.body.classList.toggle("dark", next === "dark");
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
    setTranslations({}); // Очищаем старые переводы

    const source = detectLanguageImproved(text);
    // const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const apiUrl = "";

    try {
      // Проходим по каждому языку по очереди
      for (const [index, target] of targets.entries()) {
        // Пауза перед запросом (кроме самого первого), чтобы не злить Google
        // Увеличили до 1500мс (1.5 сек) для надежности
        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        try {
          const res = await fetch(`${apiUrl}/api/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              source,
              target,
            }),
          });

          const json = await res.json();

          // Если сервер вернул ошибку (например, лимит), показываем её
          if (json.error) {
            throw new Error(json.error);
          }

          let output = json.translation;
          if (!output) output = "Ошибка сервера (пустой ответ)";

          if (target === "tr") output = toLatin(output);

          // Обновляем состояние СРАЗУ, не дожидаясь остальных языков
          setTranslations((prev) => ({
            ...prev,
            [target]: output,
          }));
        } catch (err) {
          console.error(`Ошибка для языка ${target}:`, err);
          // Записываем ошибку в поле перевода, чтобы было видно, что пошло не так
          setTranslations((prev) => ({
            ...prev,
            [target]: "Не удалось перевести (попробуйте позже)",
          }));
        }
      }
    } catch (globalErr) {
      setError("Общая ошибка приложения");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    const btn = document.activeElement;
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 800);
  };

  return (
    <div>
      <button
        onClick={toggleTheme}
        className="btn btn-secondary"
        style={{ marginBottom: 10 }}>
        {theme === "light" ? "Тёмная тема" : "Светлая тема"}
      </button>

      <h2>KAMI Menu Translator</h2>

      <textarea
        rows={4}
        className="input-box"
        placeholder="Введите текст для перевода..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div
        style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span style={{ opacity: 0.7 }}>Язык → Цели:</span>

        <div style={{ position: "relative" }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDropdown((prev) => !prev)}>
            {targets.length > 0
              ? `Выбрано: ${targets.length}`
              : "Выбрать языки"}
          </button>

          {showDropdown && (
            <div className="dropdown">
              {languages.map((l) => (
                <label key={l.code} style={{ display: "flex", gap: 6 }}>
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
          {loading ? "Перевожу..." : "Перевести"}
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

      {Object.keys(translations).length > 0 && (
        <div className="result-block" style={{ marginTop: 16 }}>
          <strong>Результаты перевода:</strong>

          {Object.entries(translations).map(([lang, result]) => {
            const langName =
              languages.find((l) => l.code === lang)?.name || lang;

            return (
              <div key={lang} style={{ marginTop: 12 }}>
                <b>{langName}:</b>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>{result}</div>
                  <button
                    onClick={() => handleCopy(result)}
                    className="copy-btn btn btn-primary">
                    Копировать
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
