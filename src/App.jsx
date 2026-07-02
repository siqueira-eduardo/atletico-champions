import { torneio, times, resumo, regras } from './data'

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
          <strong>{resumo.times}</strong>
        </article>
        <article className="metric-card">
          <span>Jogadores de linha</span>
          <strong>{resumo.jogadoresLinha}</strong>
        </article>
        <article className="metric-card">
          <span>Goleiros</span>
          <strong>{resumo.goleiros}</strong>
        </article>
        <article className="metric-card">
          <span>Participantes</span>
          <strong>{resumo.participantes}</strong>
        </article>
      </section>

      <section className="teams-section" aria-labelledby="teams-title">
        <div className="section-heading">
          <p className="eyebrow">Elenco oficial</p>
          <h2 id="teams-title">Times confirmados</h2>
          <p>{resumo.vagaExtra}</p>
        </div>

        <div className="teams-grid">
          {times.map((time) => (
            <article className="team-card" key={time.nome}>
              <div className="team-card-header">
                <h3>{time.nome}</h3>
                <span>Completo</span>
              </div>

              <div className="goalkeeper-row">
                <span>Goleiro</span>
                <strong>{time.goleiro}</strong>
              </div>

              <ul className="player-list" aria-label={`Jogadores de linha do ${time.nome}`}>
                {time.jogadoresLinha.map((jogador) => (
                  <li key={jogador}>{jogador}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="rules-section" aria-label="Regras e observações">
        {regras.map((regra) => (
          <p key={regra}>{regra}</p>
        ))}
      </section>
    </main>
  )
}
