export function App() {
  return (
    <main className="page">
      <header className="wordmark">gart.fit</header>

      <section className="hero">
        <h1>Гарт</h1>
        <p className="definition">
          <span className="lang">Belarusian</span> — the temper steel gets from
          fire; resilience and willpower earned through hard work.
        </p>
        <p className="pitch">
          Open-source gym training companion. Log your sets, and let your own AI
          assistant plan sessions and track progress — connected directly over
          MCP, no copy-paste.
        </p>
        <p className="status">Under construction — first sets being logged.</p>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Gart</span>
      </footer>
    </main>
  )
}
