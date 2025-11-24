import { useState } from "react";

export default function Translator() {
  const [text, setText] = useState("");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [targets, setTargets] = useState(["kk"]);
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { code: "ru", name: "Русский" },
    { code: "kk", name: "Казахский" },
    { code: "ky", name: "Киргизский" },
    { code: "az", name: "Азербайджанский" },
    { code: "uz", name: "Узбекский" },
    { code: "uk", name: "Украинский" },
    { code: "hi", name: "Хинди (Индийский)" },
    { code: "en", name: "Английский" },
    { code: "tr", name: "Турецкий" },
    { code: "fr", name: "Французский" },
    { code: "de", name: "Немецкий" },
    { code: "es", name: "Испанский" },
    { code: "zh", name: "Китайский" },
    { code: "ja", name: "Японский" },
  ];

  const handleTargetChange = (langCode) => {
    setTargets((prev) =>
      prev.includes(langCode)
        ? prev.filter((c) => c !== langCode)
        : [...prev, langCode]
    );
  };

  // 🔥 Улучшенный детектор языка
  function detectLanguageImproved(text) {
    const t = text.trim().toLowerCase();

    // чистый английский
    if (/^[a-z0-9.,!?'"()\-\s]+$/i.test(t)) return "en";

    // кириллица → русский
    if (/[а-яёүұқғәіһңө]/i.test(t)) return "ru";

    // турецкие специальные буквы
    if (/[çğıöşü]/i.test(t)) return "tr";

    return "auto";
  }

  // Латинизация турецкого
  const toLatin = (str) =>
    str
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

    // 🔥 Новый детектор стоит здесь
    const detectedSource = detectLanguageImproved(text);

    try {
      const results = {};

      for (const target of targets) {
        const res = await fetch(
          "https://ai-menu-translator-server.onrender.com",
          {
            method: "POST",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              source: detectedSource,
              target,
              forceTarget: true,
            }),
          }
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({
            error: "Ошибка сервера",
          }));
          throw new Error(err.error || "Ошибка ответа от сервера");
        }

        const data = await res.json();
        let output = data.translation || "(нет перевода)";

        if (target === "tr") output = toLatin(output);

        results[target] = output;
      }

      setTranslations(results);
    } catch (e) {
      setError(e.message || "Не удалось перевести");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="translator-container">
      <h1 style={{ marginBottom: 10 }}>🌐 KAMI Menu Translator</h1>

      <textarea
        placeholder="Введите текст для перевода..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          background: "#111827",
          color: "white",
          border: "1px solid #374151",
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          resize: "none",
        }}
      />

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
        <span style={{ color: "#9ca3af" }}>Язык → Цели:</span>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            style={{
              background: "#1f2937",
              color: "white",
              border: "1px solid #374151",
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
            }}>
            {targets.length > 0
              ? `Выбрано: ${targets.length}`
              : "Выбрать языки"}
          </button>

          {showDropdown && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                background: "#1f2937",
                border: "1px solid #374151",
                borderRadius: 8,
                padding: 10,
                zIndex: 10,
                maxHeight: 200,
                overflowY: "auto",
                width: 180,
              }}>
              {languages.map((lang) => (
                <label
                  key={lang.code}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "white",
                    fontSize: 14,
                    marginBottom: 6,
                    cursor: "pointer",
                  }}>
                  <input
                    type="checkbox"
                    checked={targets.includes(lang.code)}
                    onChange={() => handleTargetChange(lang.code)}
                  />
                  {lang.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleTranslate}
          disabled={loading}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
          }}>
          {loading ? "Перевожу..." : "Перевести"}
        </button>

        <button
          style={{
            background: "#374151",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
          }}
          onClick={() => {
            setText("");
            setTranslations({});
            setError("");
          }}>
          Очистить
        </button>
      </div>

      {error && (
        <div style={{ color: "#f87171", marginTop: 12, fontWeight: 500 }}>
          {error}
        </div>
      )}

      {Object.keys(translations).length > 0 && (
        <div
          style={{
            marginTop: 16,
            background: "#1f2937",
            padding: 12,
            borderRadius: 8,
            color: "white",
            whiteSpace: "pre-wrap",
          }}>
          <strong>Результаты перевода:</strong>

          <div style={{ marginTop: 8 }}>
            {Object.entries(translations).map(([lang, result]) => {
              const langName =
                languages.find((l) => l.code === lang)?.name || lang;
              return (
                <div key={lang} style={{ marginBottom: 10 }}>
                  <b>{langName}:</b>
                  <div>{result}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
