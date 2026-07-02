import { torneio, times, jogadores, rodadas, regras } from './data'

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Temporada {torneio.temporada}</p>
          <h1>{torneio.nome}</h1>
          <p>{torneio.descricao}</p>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Resumo do torneio">
        <article className="metric-card">
          <span>Times</span>
          <strong>{times.length}</strong>
        </article>
        <article className="metric-card">
          <span>Jogadores</span>
          <strong>{jogadores.length}</strong>
        </article>
        <article className="metric-card">
          <span>Rodadas</span>
          <strong>{rodadas.length}</strong>
        </article>
        <article className="metric-card">
          <span>Regras</span>
          <strong>{regras.length}</strong>
        </article>
      </section>
    </main>
  )
}
