import { useState, useEffect } from 'react'
import { ref, onValue, set, push } from 'firebase/database'
import { db } from './firebase'
import { TIMES, JOGADORES, GOLEIROS, RODADAS, TABS, TIMES_INCOMPLETOS, REGRAS, MATA_MATA } from './data'

// ── senha de admin (só quem souber pode lançar resultados) ──
const SENHA_ADMIN = "3417"

export default function App() {
  const [tab, setTab] = useState(0)
  const [resultados, setResultados] = useState({})
  const [gols, setGols] = useState({})
  const [assistencias, setAssistencias] = useState({})
  const [mvps, setMvps] = useState({})
  const [sumulas, setSumulas] = useState({})
  const [modalJogo, setModalJogo] = useState(null)
  const [formGol, setFormGol] = useState({ jogador: "", assistencia: "" })
  const [golsPartida, setGolsPartida] = useState([])
  const [placar, setPlacar] = useState({ casa: "", fora: "" })
  const [mvpSelecionado, setMvpSelecionado] = useState("")
  const [sumulaObservacoes, setSumulaObservacoes] = useState("")
  const [timeSelecionado, setTimeSelecionado] = useState(1)
  const [jogadorSelecionado, setJogadorSelecionado] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [senhaInput, setSenhaInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [fotos, setFotos] = useState({})
  const [novaFotoUrl, setNovaFotoUrl] = useState("")
  const [novaFotoLegenda, setNovaFotoLegenda] = useState("")
  const [rodadaFotoSelecionada, setRodadaFotoSelecionada] = useState(1)

  // ── carregar dados do Firebase em tempo real ──
  useEffect(() => {
    const refs = [
      { key: 'resultados', setter: setResultados },
      { key: 'gols', setter: setGols },
      { key: 'assistencias', setter: setAssistencias },
      { key: 'mvps', setter: setMvps },
      { key: 'sumulas', setter: setSumulas },
      { key: 'fotos', setter: setFotos },
    ]
    const unsubs = refs.map(({ key, setter }) =>
      onValue(ref(db, key), snap => {
        setter(snap.val() || {})
        setLoading(false)
      })
    )
    return () => unsubs.forEach(u => u())
  }, [])

  const getTimeByNome = (nome) => TIMES.find(t => t.nome === nome)
  const getTimeDoJogador = (nome) => JOGADORES.find(j => j.nome === nome)?.time
  const contarGolsPorTime = (lista, casaNome, foraNome) => {
    const casaId = getTimeByNome(casaNome)?.id
    const foraId = getTimeByNome(foraNome)?.id
    const total = { casa: 0, fora: 0 }

    lista.forEach(g => {
      if (g.time === casaId) total.casa++
      if (g.time === foraId) total.fora++
    })

    return { casa: String(total.casa), fora: String(total.fora) }
  }

  const calcClassificacao = () => {
    const tabela = TIMES.map(t => ({ ...t, pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }))
    Object.values(resultados).forEach(r => {
      if (r?.placar) {
        const casa = tabela.find(t => t.nome === r.casa)
        const fora = tabela.find(t => t.nome === r.fora)
        if (!casa || !fora) return
        const gc = parseInt(r.placar.casa) || 0
        const gf = parseInt(r.placar.fora) || 0
        casa.j++; fora.j++
        casa.gp += gc; casa.gc += gf
        fora.gp += gf; fora.gc += gc
        casa.sg = casa.gp - casa.gc
        fora.sg = fora.gp - fora.gc
        if (gc > gf) { casa.v++; casa.pts += 3; fora.d++ }
        else if (gc < gf) { fora.v++; fora.pts += 3; casa.d++ }
        else { casa.e++; fora.e++; casa.pts++; fora.pts++ }
      }
    })
    return tabela.sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp)
  }

  const calcArtilheiros = () => {
    const art = {}
    Object.values(gols).forEach(lista => {
      if (!Array.isArray(lista)) return
      lista.forEach(g => {
        if (!art[g.jogador]) art[g.jogador] = { gols: 0, time: g.time }
        art[g.jogador].gols++
      })
    })
    return Object.entries(art).map(([nome, d]) => ({ nome, ...d })).sort((a, b) => b.gols - a.gols)
  }

  const calcAssistencias = () => {
    const ass = {}
    Object.values(assistencias).forEach(lista => {
      if (!Array.isArray(lista)) return
      lista.forEach(a => {
        if (a?.jogador) {
          if (!ass[a.jogador]) ass[a.jogador] = { assists: 0, time: a.time }
          ass[a.jogador].assists++
        }
      })
    })
    return Object.entries(ass).map(([nome, d]) => ({ nome, ...d })).sort((a, b) => b.assists - a.assists)
  }

  const calcMvps = () => {
    const mv = {}
    Object.values(mvps).forEach(m => {
      if (m) {
        if (!mv[m]) mv[m] = { count: 0, time: JOGADORES.find(j => j.nome === m)?.time }
        mv[m].count++
      }
    })
    return Object.entries(mv).map(([nome, d]) => ({ nome, ...d })).sort((a, b) => b.count - a.count)
  }

  const abrirModal = (rodada, jogoIdx, casa, fora) => {
    if (!isAdmin) return
    const key = `${rodada}-${jogoIdx}`
    const r = resultados[key] || {}
    const golsSalvos = Array.isArray(gols[key]) ? gols[key] : []
    const assistenciasSalvas = Array.isArray(assistencias[key]) ? assistencias[key] : []
    const golsComAssistencias = golsSalvos.map((g, i) => ({
      ...g,
      assistencia: g.assistencia || assistenciasSalvas[i]?.jogador || "",
      assistenciaTime: g.assistenciaTime || assistenciasSalvas[i]?.time || getTimeDoJogador(assistenciasSalvas[i]?.jogador) || "",
    }))
    setModalJogo({ key, rodada, jogoIdx, casa, fora })
    setPlacar({ casa: r.placar?.casa || "", fora: r.placar?.fora || "" })
    setGolsPartida(golsComAssistencias)
    setMvpSelecionado(mvps[key] || "")
    setSumulaObservacoes(sumulas[key]?.observacoes || "")
    setFormGol({ jogador: "", assistencia: "" })
  }

  const salvarGol = () => {
    if (!formGol.jogador || !modalJogo) return
    const jog = JOGADORES.find(j => j.nome === formGol.jogador)
    const assJog = JOGADORES.find(j => j.nome === formGol.assistencia)
    const novoGol = {
      jogador: formGol.jogador,
      time: jog?.time || "",
      assistencia: formGol.assistencia || "",
      assistenciaTime: formGol.assistencia ? (assJog?.time || "") : "",
    }
    const novosGols = [...golsPartida, novoGol]
    setGolsPartida(novosGols)
    setPlacar(contarGolsPorTime(novosGols, modalJogo.casa, modalJogo.fora))
    setFormGol({ jogador: "", assistencia: "" })
  }

  const removerGol = (idxGol) => {
    if (!modalJogo) return
    const novosGols = golsPartida.filter((_, idx) => idx !== idxGol)
    setGolsPartida(novosGols)
    setPlacar(contarGolsPorTime(novosGols, modalJogo.casa, modalJogo.fora))
  }

  const salvarPartida = async () => {
    if (!modalJogo) return
    const key = modalJogo.key
    const golsNormalizados = golsPartida.map(g => ({
      jogador: g.jogador,
      time: g.time || getTimeDoJogador(g.jogador) || "",
      assistencia: g.assistencia || "",
      assistenciaTime: g.assistencia ? (g.assistenciaTime || getTimeDoJogador(g.assistencia) || "") : "",
    }))
    const assistenciasPartida = golsNormalizados
      .filter(g => g.assistencia)
      .map(g => ({ jogador: g.assistencia, time: g.assistenciaTime }))
    const placarFinal = { casa: String(placar.casa || 0), fora: String(placar.fora || 0) }
    const resultado = { casa: modalJogo.casa, fora: modalJogo.fora, placar: placarFinal }
    const sumula = {
      rodada: modalJogo.rodada,
      jogoIdx: modalJogo.jogoIdx,
      casa: modalJogo.casa,
      fora: modalJogo.fora,
      placar: placarFinal,
      gols: golsNormalizados,
      assistencias: assistenciasPartida,
      mvp: mvpSelecionado || "",
      observacoes: sumulaObservacoes.trim(),
      atualizadaEm: new Date().toISOString(),
    }

    await set(ref(db, `resultados/${key}`), resultado)
    await set(ref(db, `gols/${key}`), golsNormalizados)
    await set(ref(db, `assistencias/${key}`), assistenciasPartida)
    await set(ref(db, `mvps/${key}`), mvpSelecionado)
    await set(ref(db, `sumulas/${key}`), sumula)
    setModalJogo(null)
  }

  const entrarAdmin = () => {
    if (senhaInput === SENHA_ADMIN) { setIsAdmin(true); setSenhaInput("") }
    else alert("Senha incorreta!")
  }

  const adicionarFoto = async () => {
    if (!novaFotoUrl.trim()) return
    const novaRef = push(ref(db, `fotos/${rodadaFotoSelecionada}`))
    await set(novaRef, { url: novaFotoUrl.trim(), legenda: novaFotoLegenda.trim() })
    setNovaFotoUrl("")
    setNovaFotoLegenda("")
  }

  const removerFoto = async (rodada, fotoId) => {
    await set(ref(db, `fotos/${rodada}/${fotoId}`), null)
  }

  // ── confronto direto entre dois times (turno + returno) ──
  const calcConfrontoDireto = (nomeTimeA, nomeTimeB) => {
    let golsA = 0, golsB = 0, vitoriasA = 0, vitoriasB = 0, jogos = 0
    Object.values(resultados).forEach(r => {
      if (!r?.placar) return
      const ehAxB = r.casa === nomeTimeA && r.fora === nomeTimeB
      const ehBxA = r.casa === nomeTimeB && r.fora === nomeTimeA
      if (!ehAxB && !ehBxA) return
      jogos++
      const gc = parseInt(r.placar.casa) || 0
      const gf = parseInt(r.placar.fora) || 0
      if (ehAxB) { golsA += gc; golsB += gf; if (gc > gf) vitoriasA++; else if (gf > gc) vitoriasB++ }
      else { golsB += gc; golsA += gf; if (gc > gf) vitoriasB++; else if (gf > gc) vitoriasA++ }
    })
    return { jogos, golsA, golsB, vitoriasA, vitoriasB }
  }

  const classificacao = calcClassificacao()

  // ── próxima rodada sem resultados lançados ──
  const getProximaRodada = () => {
    for (const r of RODADAS) {
      const algumPendente = r.jogos.some((_, ji) => !resultados[`${r.rodada}-${ji}`]?.placar)
      if (algumPendente) return r
    }
    return null
  }
  const proximaRodada = getProximaRodada()

  // ── evolução da classificação rodada a rodada (posição de cada time após cada rodada) ──
  const calcEvolucao = () => {
    const posicoesPorRodada = {} // { timeId: [pos_r1, pos_r2, ...] }
    TIMES.forEach(t => { posicoesPorRodada[t.id] = [] })

    RODADAS.forEach(r => {
      const tabela = TIMES.map(t => ({ ...t, pts: 0, sg: 0, gp: 0 }))
      // acumula resultados até essa rodada (inclusive)
      RODADAS.filter(rr => rr.rodada <= r.rodada).forEach(rr => {
        rr.jogos.forEach((jogo, ji) => {
          const res = resultados[`${rr.rodada}-${ji}`]
          if (!res?.placar) return
          const casa = tabela.find(t => t.nome === res.casa)
          const fora = tabela.find(t => t.nome === res.fora)
          if (!casa || !fora) return
          const gc = parseInt(res.placar.casa) || 0
          const gf = parseInt(res.placar.fora) || 0
          casa.gp += gc; fora.gp += gf
          casa.sg += gc - gf; fora.sg += gf - gc
          if (gc > gf) casa.pts += 3
          else if (gc < gf) fora.pts += 3
          else { casa.pts++; fora.pts++ }
        })
      })
      const ordenado = [...tabela].sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp)
      ordenado.forEach((t, idx) => posicoesPorRodada[t.id].push(idx + 1))
    })
    return posicoesPorRodada
  }
  const artilheiros = calcArtilheiros()
  const assLista = calcAssistencias()
  const mvpLista = calcMvps()

  // ── última rodada jogada (para destaque "Jogador da Semana") ──
  const getUltimaRodadaInfo = () => {
    const keysComResultado = Object.keys(resultados).filter(k => resultados[k]?.placar)
    if (keysComResultado.length === 0) return null
    const ultimaRodadaNum = Math.max(...keysComResultado.map(k => parseInt(k.split('-')[0])))
    const keysDaRodada = keysComResultado.filter(k => parseInt(k.split('-')[0]) === ultimaRodadaNum)
    let mvpDaRodada = null
    keysDaRodada.forEach(k => {
      if (mvps[k]) mvpDaRodada = mvps[k]
    })
    let golsDaRodada = []
    keysDaRodada.forEach(k => {
      if (Array.isArray(gols[k])) golsDaRodada = [...golsDaRodada, ...gols[k]]
    })
    const artilheiroRodada = golsDaRodada.length > 0
      ? Object.entries(golsDaRodada.reduce((acc, g) => { acc[g.jogador] = (acc[g.jogador] || 0) + 1; return acc }, {}))
          .sort((a, b) => b[1] - a[1])[0]
      : null
    return { rodada: ultimaRodadaNum, mvp: mvpDaRodada, artilheiro: artilheiroRodada }
  }
  const ultimaRodadaInfo = getUltimaRodadaInfo()

  // ── compartilhar resultado de um jogo ──
  const compartilharResultado = (key, jogo) => {
    const res = resultados[key]
    if (!res) return
    const golsJogo = Array.isArray(gols[key]) ? gols[key] : []
    const sumulaJogo = sumulas[key]
    const mvpJogo = mvps[key]
    let texto = `📋 SÚMULA OFICIAL - CHAMPIONS LEAGUE ATLÉTICO PARAÍSO\n\n`
    texto += `${jogo[0]} ${res.placar.casa} x ${res.placar.fora} ${jogo[1]}\n\n`
    if (golsJogo.length > 0) {
      texto += `⚽ Gols:\n`
      golsJogo.forEach(g => {
        texto += g.assistencia ? `${g.jogador} (assist: ${g.assistencia})\n` : `${g.jogador}\n`
      })
      texto += `\n`
    }
    if (mvpJogo) texto += `🌟 MVP: ${mvpJogo}\n`
    if (sumulaJogo?.observacoes) texto += `📝 Observações: ${sumulaJogo.observacoes}\n`
    if (navigator.share) {
      navigator.share({ text: texto }).catch(() => {})
    } else {
      navigator.clipboard.writeText(texto)
      alert("Súmula copiada! Cole no WhatsApp do grupo 📋")
    }
  }

  const jogadoresCasa = modalJogo ? JOGADORES.filter(j => { const t = getTimeByNome(modalJogo.casa); return t && j.time === t.id }) : []
  const jogadoresFora = modalJogo ? JOGADORES.filter(j => { const t = getTimeByNome(modalJogo.fora); return t && j.time === t.id }) : []
  const todosJogadores = [...jogadoresCasa, ...jogadoresFora]

  const S = {
    page: { minHeight: "100vh", background: "#0a0e1a", color: "#fff", fontFamily: "'Segoe UI', sans-serif" },
    header: { background: "linear-gradient(135deg, #1a1f3a 0%, #0d1228 100%)", borderBottom: "1px solid #1e2d5a", padding: "20px 16px 0" },
    inner: { maxWidth: 700, margin: "0 auto" },
    card: { background: "#111827", border: "1px solid #1e2d5a", borderRadius: 10, padding: "12px 16px", marginBottom: 8 },
    row: { display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #1e2d5a" },
    empty: { textAlign: "center", color: "#6b7db3", padding: 40 },
    select: { width: "100%", padding: "8px 10px", background: "#1a1f3a", border: "1px solid #1e2d5a", borderRadius: 6, color: "#fff", marginBottom: 8, fontSize: 13 },
    btn: { width: "100%", padding: "9px", background: "#FFD700", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#0a0e1a" },
    btnSalvar: { width: "100%", padding: "12px", background: "linear-gradient(135deg, #FFD700, #FFA500)", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: "pointer", color: "#0a0e1a" },
  }

  if (loading) return (
    <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🏆</div>
      <div style={{ color: "#FFD700", fontWeight: 700 }}>Carregando campeonato...</div>
    </div>
  )

  return (
    <div style={S.page}>
      {/* HEADER */}
      <div style={S.header}>
        <div style={S.inner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 36 }}>🏆</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, color: "#FFD700" }}>CHAMPIONS LEAGUE</div>
              <div style={{ fontSize: 12, color: "#6b7db3", letterSpacing: 2 }}>ATLÉTICO PARAÍSO • 2026</div>
            </div>
            {!isAdmin ? (
              <div style={{ display: "flex", gap: 6 }}>
                <input placeholder="Senha admin" type="password" value={senhaInput}
                  onChange={e => setSenhaInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && entrarAdmin()}
                  style={{ width: 110, padding: "6px 8px", background: "#1a1f3a", border: "1px solid #1e2d5a", borderRadius: 6, color: "#fff", fontSize: 12 }} />
                <button onClick={entrarAdmin} style={{ padding: "6px 10px", background: "#FFD700", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", color: "#0a0e1a" }}>
                  Entrar
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#4caf50", fontWeight: 700 }}>✓ ADMIN</span>
                <button onClick={() => setIsAdmin(false)} style={{ padding: "4px 8px", background: "none", border: "1px solid #f44336", borderRadius: 6, color: "#f44336", fontSize: 11, cursor: "pointer" }}>Sair</button>
              </div>
            )}
          </div>

          {proximaRodada && (
            <div onClick={() => setTab(4)} style={{
              cursor: "pointer", background: "linear-gradient(135deg, #FFD70022, #FFA50011)",
              border: "1px solid #FFD70044", borderRadius: 10, padding: "10px 14px", marginBottom: 14
            }}>
              <div style={{ fontSize: 10, color: "#FFD700", letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>
                ⏭️ PRÓXIMO • RODADA {proximaRodada.rodada} • {proximaRodada.data}/2026
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {proximaRodada.jogos.map((jogo, ji) => {
                  const key = `${proximaRodada.rodada}-${ji}`
                  const jaTemResultado = resultados[key]?.placar
                  if (jaTemResultado) return null
                  return (
                    <div key={ji} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{jogo[0]}</span>
                      <span style={{ color: "#6b7db3" }}>x</span>
                      <span style={{ fontWeight: 600 }}>{jogo[1]}</span>
                      <span style={{ fontSize: 10, color: "#FFD700" }}>⏰ {jogo[2]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                padding: "10px 14px", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                fontSize: 12, fontWeight: 600, borderRadius: "8px 8px 0 0",
                background: tab === i ? "#FFD700" : "transparent",
                color: tab === i ? "#0a0e1a" : "#6b7db3",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...S.inner, padding: 16 }}>

        {/* CLASSIFICAÇÃO */}
        {tab === 0 && (
          <div>
            {ultimaRodadaInfo && (ultimaRodadaInfo.mvp || ultimaRodadaInfo.artilheiro) && (
              <div style={{
                background: "linear-gradient(135deg, #c084fc22, #FFD70022)", border: "1px solid #c084fc55",
                borderRadius: 12, padding: 14, marginBottom: 16
              }}>
                <div style={{ fontSize: 10, color: "#c084fc", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>
                  ⭐ DESTAQUES DA RODADA {ultimaRodadaInfo.rodada}
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  {ultimaRodadaInfo.mvp && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🌟</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{ultimaRodadaInfo.mvp}</div>
                        <div style={{ fontSize: 10, color: "#6b7db3" }}>MVP da rodada</div>
                      </div>
                    </div>
                  )}
                  {ultimaRodadaInfo.artilheiro && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>⚽</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{ultimaRodadaInfo.artilheiro[0]}</div>
                        <div style={{ fontSize: 10, color: "#6b7db3" }}>{ultimaRodadaInfo.artilheiro[1]} gol(s) na rodada</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: "#6b7db3", fontSize: 11, letterSpacing: 1 }}>
                  <th style={{ textAlign: "left", padding: "8px 4px" }}>#</th>
                  <th style={{ textAlign: "left", padding: "8px 4px" }}>TIME</th>
                  <th style={{ padding: "8px 4px" }}>J</th>
                  <th style={{ padding: "8px 4px" }}>V</th>
                  <th style={{ padding: "8px 4px" }}>E</th>
                  <th style={{ padding: "8px 4px" }}>D</th>
                  <th style={{ padding: "8px 4px" }}>SG</th>
                  <th style={{ padding: "8px 4px", color: "#FFD700" }}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {classificacao.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #1e2d5a", background: i < 4 ? "rgba(255,215,0,0.04)" : "transparent" }}>
                    <td style={{ padding: "12px 4px", color: i < 4 ? "#FFD700" : "#6b7db3", fontWeight: 700 }}>{i < 4 ? "●" : i + 1}</td>
                    <td style={{ padding: "12px 4px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.cor }} />
                        <span style={{ fontWeight: 600 }}>{t.nome}</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#6b7db3" }}>{t.capitao}</div>
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 4px", color: "#8899cc" }}>{t.j}</td>
                    <td style={{ textAlign: "center", padding: "12px 4px", color: "#4caf50" }}>{t.v}</td>
                    <td style={{ textAlign: "center", padding: "12px 4px", color: "#ff9800" }}>{t.e}</td>
                    <td style={{ textAlign: "center", padding: "12px 4px", color: "#f44336" }}>{t.d}</td>
                    <td style={{ textAlign: "center", padding: "12px 4px" }}>{t.sg > 0 ? `+${t.sg}` : t.sg}</td>
                    <td style={{ textAlign: "center", padding: "12px 4px", fontWeight: 800, color: "#FFD700", fontSize: 15 }}>{t.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 12, fontSize: 11, color: "#6b7db3", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#FFD700" }}>●</span> Top 4 avança para o mata-mata
            </div>

            {/* Evolução na tabela */}
            {(() => {
              const evolucao = calcEvolucao()
              const temDados = Object.values(evolucao).some(arr => arr.length > 0)
              if (!temDados) return null
              const maxPos = 6
              const largura = 280
              const altura = 110
              const passoX = largura / Math.max(RODADAS.length - 1, 1)
              const passoY = altura / (maxPos - 1)
              return (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 10, color: "#6b7db3", letterSpacing: 2, marginBottom: 10 }}>📈 EVOLUÇÃO NA TABELA</div>
                  <div style={{ ...S.card, overflowX: "auto" }}>
                    <svg width={largura + 30} height={altura + 24} style={{ display: "block" }}>
                      {/* linhas guia */}
                      {[1, 2, 3, 4, 5, 6].map(pos => (
                        <line key={pos} x1={20} y1={(pos - 1) * passoY + 8} x2={largura + 20} y2={(pos - 1) * passoY + 8}
                          stroke="#1e2d5a" strokeWidth="1" />
                      ))}
                      {/* labels de posição */}
                      {[1, 4, 6].map(pos => (
                        <text key={pos} x={0} y={(pos - 1) * passoY + 12} fill="#6b7db3" fontSize="9">{pos}º</text>
                      ))}
                      {/* linhas dos times */}
                      {TIMES.map(t => {
                        const posicoes = evolucao[t.id]
                        if (!posicoes || posicoes.length === 0) return null
                        const pontos = posicoes.map((pos, i) => `${i * passoX + 20},${(pos - 1) * passoY + 8}`).join(" ")
                        const corLinha = t.cor === "#FFFFFF" ? "#cccccc" : t.cor === "#000000" ? "#888888" : t.cor
                        return (
                          <g key={t.id}>
                            <polyline points={pontos} fill="none" stroke={corLinha} strokeWidth="2" opacity="0.85" />
                            {posicoes.map((pos, i) => (
                              <circle key={i} cx={i * passoX + 20} cy={(pos - 1) * passoY + 8} r="2.5" fill={corLinha} />
                            ))}
                          </g>
                        )
                      })}
                    </svg>
                    {/* legenda */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                      {TIMES.map(t => {
                        const posicoes = evolucao[t.id]
                        if (!posicoes || posicoes.length === 0) return null
                        const corLinha = t.cor === "#FFFFFF" ? "#cccccc" : t.cor === "#000000" ? "#888888" : t.cor
                        const ultima = posicoes[posicoes.length - 1]
                        const primeira = posicoes[0]
                        const tendencia = ultima < primeira ? "↑" : ultima > primeira ? "↓" : "→"
                        const corTendencia = ultima < primeira ? "#4caf50" : ultima > primeira ? "#f44336" : "#6b7db3"
                        return (
                          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: corLinha }} />
                            <span>{t.nome}</span>
                            <span style={{ color: corTendencia, fontWeight: 800 }}>{tendencia}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ARTILHEIROS */}
        {tab === 1 && (
          <div>
            {artilheiros.length === 0 ? (
              <div style={S.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>⚽</div><div>Nenhum gol registrado ainda</div></div>
            ) : artilheiros.map((a, i) => {
              const t = TIMES.find(t => t.id === a.time)
              return (
                <div key={a.nome} style={S.row}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: i === 0 ? "#FFD700" : "#6b7db3", width: 30, textAlign: "center" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{a.nome}</div>
                    <div style={{ fontSize: 11, color: t?.cor }}>{t?.nome}</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#FFD700" }}>{a.gols}</div>
                  <div style={{ fontSize: 11, color: "#6b7db3" }}>gols</div>
                </div>
              )
            })}
          </div>
        )}

        {/* ASSISTÊNCIAS */}
        {tab === 2 && (
          <div>
            {assLista.length === 0 ? (
              <div style={S.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div><div>Nenhuma assistência ainda</div></div>
            ) : assLista.map((a, i) => {
              const t = TIMES.find(t => t.id === a.time)
              return (
                <div key={a.nome} style={S.row}>
                  <div style={{ fontSize: 20, width: 30, textAlign: "center" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{a.nome}</div>
                    <div style={{ fontSize: 11, color: t?.cor }}>{t?.nome}</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#6CABDD" }}>{a.assists}</div>
                  <div style={{ fontSize: 11, color: "#6b7db3" }}>assists</div>
                </div>
              )
            })}
          </div>
        )}

        {/* MVP */}
        {tab === 3 && (
          <div>
            {mvpLista.length === 0 ? (
              <div style={S.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div><div>Nenhum MVP ainda</div></div>
            ) : mvpLista.map((m, i) => {
              const t = TIMES.find(t => t.id === m.time)
              return (
                <div key={m.nome} style={S.row}>
                  <div style={{ fontSize: 20, width: 30, textAlign: "center" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{m.nome}</div>
                    <div style={{ fontSize: 11, color: t?.cor }}>{t?.nome}</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#c084fc" }}>{m.count}x</div>
                  <div style={{ fontSize: 11, color: "#6b7db3" }}>MVP</div>
                </div>
              )
            })}
          </div>
        )}

        {/* JOGOS */}
        {tab === 4 && (
          <div>
            {!isAdmin && (
              <div style={{ background: "#1a1f3a", border: "1px solid #1e2d5a", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#6b7db3", textAlign: "center" }}>
                👁️ Modo visualização — Entre como admin para lançar resultados
              </div>
            )}
            {RODADAS.map(r => (
              <div key={r.rodada} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 13, letterSpacing: 1 }}>RODADA {r.rodada}</div>
                  <div style={{ fontSize: 11, color: "#6b7db3" }}>📅 {r.data}/2026</div>
                </div>
                {r.jogos.map((jogo, ji) => {
                  const key = `${r.rodada}-${ji}`
                  const res = resultados[key]
                  const tCasa = getTimeByNome(jogo[0])
                  const tFora = getTimeByNome(jogo[1])
                  const horario = jogo[2]
                  return (
                    <div key={ji} style={{ ...S.card, display: "flex", alignItems: "center", gap: 8 }}>
                      <div onClick={() => abrirModal(r.rodada, ji, jogo[0], jogo[1])}
                        style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: isAdmin ? "pointer" : "default" }}
                      >
                        <div style={{ flex: 1, textAlign: "right" }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{jogo[0]}</div>
                          <div style={{ fontSize: 10, color: tCasa?.cor }}>{tCasa?.capitao}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ padding: "4px 10px", background: res ? "#1e2d5a" : "#1a1f3a", borderRadius: 6, minWidth: 56, fontWeight: 800, fontSize: 15, color: res ? "#FFD700" : "#6b7db3" }}>
                            {res ? `${res.placar.casa} x ${res.placar.fora}` : "vs"}
                          </div>
                          <div style={{ fontSize: 9, color: "#6b7db3", marginTop: 3 }}>⏰ {horario}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{jogo[1]}</div>
                          <div style={{ fontSize: 10, color: tFora?.cor }}>{tFora?.capitao}</div>
                        </div>
                      </div>
                      {res && (
                        <button onClick={(e) => { e.stopPropagation(); compartilharResultado(key, jogo) }}
                          style={{ background: "none", border: "1px solid #1e2d5a", borderRadius: 6, padding: "6px 8px", cursor: "pointer", color: "#6b7db3", fontSize: 14 }}
                        >📤</button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {/* ELENCOS */}
        {tab === 5 && (
          <div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {TIMES.map(t => (
                <button key={t.id} onClick={() => setTimeSelecionado(t.id)} style={{
                  padding: "7px 13px", border: `2px solid ${timeSelecionado === t.id ? t.cor : "#1e2d5a"}`,
                  borderRadius: 20, background: timeSelecionado === t.id ? t.cor + "22" : "transparent",
                  color: timeSelecionado === t.id ? t.cor : "#6b7db3",
                  fontWeight: 700, fontSize: 12, cursor: "pointer",
                }}>{t.nome}</button>
              ))}
            </div>
            {TIMES.filter(t => t.id === timeSelecionado).map(time => {
              const jogadoresTime = JOGADORES.filter(j => j.time === timeSelecionado)
              const goleiro = GOLEIROS[timeSelecionado]
              const incompleto = TIMES_INCOMPLETOS[timeSelecionado]
              const artMap = calcArtilheiros()
              const assMap = calcAssistencias()
              const mvpMap = calcMvps()
              return (
                <div key={time.id}>
                  <div style={{ background: `linear-gradient(135deg, ${time.cor}33, ${time.corSecundaria}22)`, border: `1px solid ${time.cor}55`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 12, height: 40, borderRadius: 3, background: time.cor }} />
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: time.cor === "#FFFFFF" || time.cor === "#000000" ? "#fff" : time.cor }}>{time.nome}</div>
                        <div style={{ fontSize: 12, color: "#8899cc" }}>Capitão: {time.capitao} • Goleiro: {goleiro}</div>
                      </div>
                      <div style={{ marginLeft: "auto", fontSize: 28, fontWeight: 800, color: "#8899cc" }}>{jogadoresTime.length + 1}</div>
                    </div>
                    {incompleto && (
                      <div style={{ marginTop: 10, fontSize: 11, color: "#FFD700", background: "#1a1f3a", borderRadius: 6, padding: "6px 10px", display: "inline-block" }}>
                        ⏳ Time incompleto — aguardando reforços
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7db3", letterSpacing: 2, marginBottom: 6 }}>GOLEIRO</div>
                  <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 20 }}>🧤</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{goleiro}</div>
                      <div style={{ fontSize: 11, color: "#6b7db3" }}>Goleiro</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "#6b7db3", letterSpacing: 2, marginBottom: 6 }}>LINHA</div>
                  {jogadoresTime.map(j => {
                    const gols = artMap.find(a => a.nome === j.nome)?.gols || 0
                    const assists = assMap.find(a => a.nome === j.nome)?.assists || 0
                    const mvps = mvpMap.find(m => m.nome === j.nome)?.count || 0
                    const funcaoCor = j.funcao === "Capitão" ? "#FFD700" : "#6b7db3"
                    return (
                      <div key={j.nome} onClick={() => setJogadorSelecionado(j)}
                        style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", transition: "border-color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#FFD700"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2d5a"}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700 }}>{j.nome}</span>
                            {j.funcao !== "Jogador" && (
                              <span style={{ fontSize: 10, color: funcaoCor, border: `1px solid ${funcaoCor}55`, borderRadius: 4, padding: "1px 5px" }}>{j.funcao}</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 800, color: "#FFD700" }}>{gols}</div>
                            <div style={{ fontSize: 10, color: "#6b7db3" }}>⚽</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 800, color: "#6CABDD" }}>{assists}</div>
                            <div style={{ fontSize: 10, color: "#6b7db3" }}>🎯</div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontWeight: 800, color: "#c084fc" }}>{mvps}</div>
                            <div style={{ fontSize: 10, color: "#6b7db3" }}>🌟</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {incompleto && (
                    <div style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #6b7db3", color: "#6b7db3", fontSize: 13 }}>
                      + Vaga(s) em aberto
                    </div>
                  )}

                  {/* Histórico de confrontos do time */}
                  {(() => {
                    const jogosDoTime = Object.entries(resultados)
                      .filter(([k, r]) => r?.placar && (r.casa === time.nome || r.fora === time.nome))
                      .sort((a, b) => {
                        const ra = parseInt(a[0].split('-')[0])
                        const rb = parseInt(b[0].split('-')[0])
                        return rb - ra
                      })
                    if (jogosDoTime.length === 0) return null
                    return (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 10, color: "#6b7db3", letterSpacing: 2, marginBottom: 6 }}>HISTÓRICO DE CONFRONTOS</div>
                        {jogosDoTime.map(([key, r]) => {
                          const ehCasa = r.casa === time.nome
                          const adversario = ehCasa ? r.fora : r.casa
                          const golsTime = parseInt(ehCasa ? r.placar.casa : r.placar.fora) || 0
                          const golsAdv = parseInt(ehCasa ? r.placar.fora : r.placar.casa) || 0
                          const tAdv = getTimeByNome(adversario)
                          const resultado = golsTime > golsAdv ? "V" : golsTime < golsAdv ? "D" : "E"
                          const corResultado = resultado === "V" ? "#4caf50" : resultado === "D" ? "#f44336" : "#ff9800"
                          return (
                            <div key={key} style={{ ...S.card, display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 22, height: 22, borderRadius: 5, background: corResultado + "33",
                                color: corResultado, fontWeight: 800, fontSize: 11,
                                display: "flex", alignItems: "center", justifyContent: "center"
                              }}>{resultado}</div>
                              <div style={{ fontSize: 11, color: "#6b7db3" }}>{ehCasa ? "vs" : "@"}</div>
                              <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: tAdv?.cor }}>{adversario}</div>
                              <div style={{ fontWeight: 800, fontSize: 14 }}>{golsTime} x {golsAdv}</div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        )}

        {/* MATA-MATA */}
        {tab === 6 && (
          <div>
            <div style={{ background: "#1a1f3a", border: "1px solid #1e2d5a", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: "#6b7db3", textAlign: "center" }}>
              📋 Os 4 melhores colocados da fase de liga avançam para o mata-mata
            </div>

            {/* Confronto direto entre times empatados em pontos */}
            {(() => {
              const empates = []
              for (let i = 0; i < classificacao.length - 1; i++) {
                if (classificacao[i].pts === classificacao[i + 1].pts && classificacao[i].pts > 0) {
                  empates.push([classificacao[i], classificacao[i + 1]])
                }
              }
              if (empates.length === 0) return null
              return (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontWeight: 700, color: "#ff9800", fontSize: 13, letterSpacing: 1, marginBottom: 10 }}>
                    ⚖️ DESEMPATE — CONFRONTO DIRETO
                  </div>
                  {empates.map(([tA, tB], idx) => {
                    const cd = calcConfrontoDireto(tA.nome, tB.nome)
                    return (
                      <div key={idx} style={{ ...S.card, border: "1px solid #ff980055" }}>
                        <div style={{ fontSize: 11, color: "#6b7db3", marginBottom: 8 }}>
                          {tA.nome} e {tB.nome} empatados em {tA.pts} pts
                        </div>
                        {cd.jogos === 0 ? (
                          <div style={{ fontSize: 12, color: "#6b7db3" }}>Ainda não se enfrentaram nesta fase de liga</div>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, fontSize: 13 }}>{tA.nome}</span>
                              <span style={{ fontWeight: 800, fontSize: 15, color: "#FFD700" }}>{cd.golsA} x {cd.golsB}</span>
                              <span style={{ fontWeight: 700, fontSize: 13 }}>{tB.nome}</span>
                            </div>
                            <div style={{ fontSize: 11, color: "#8899cc", textAlign: "center" }}>
                              {cd.vitoriasA > cd.vitoriasB
                                ? `✅ ${tA.nome} leva vantagem no confronto direto`
                                : cd.vitoriasB > cd.vitoriasA
                                ? `✅ ${tB.nome} leva vantagem no confronto direto`
                                : cd.golsA !== cd.golsB
                                ? `✅ ${cd.golsA > cd.golsB ? tA.nome : tB.nome} leva vantagem por saldo no confronto`
                                : "Confronto direto também empatado — vale o próximo critério"}
                              {cd.jogos < 2 && " (faltando jogo de volta)"}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Semifinais */}
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 13, letterSpacing: 1, marginBottom: 10 }}>SEMIFINAIS (29+1+29 min)</div>

            {MATA_MATA.filter(f => f.fase.includes("Semi")).slice(0,1).map((fase, fi) => (
              <div key={fi}>
                {fase.jogos.map((jogo, ji) => (
                  <div key={ji} style={{ ...S.card, marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: "#6b7db3" }}>SEMI {ji + 1} — ida {fase.data} / volta 18/09</div>
                      <div style={{ fontSize: 11, color: "#FFD700" }}>⏰ {jogo[2]}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#FFD700" }}>{jogo[0]}</div>
                      <div style={{ color: "#6b7db3", fontSize: 14 }}>x</div>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#FFD700" }}>{jogo[1]}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Final */}
            <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 13, letterSpacing: 1, marginBottom: 10, marginTop: 8 }}>FINAL (30+1+30 min)</div>
            {MATA_MATA.filter(f => f.fase === "Final").map((fase, fi) => (
              <div key={fi} style={{
                background: "linear-gradient(135deg, #1a1f3a, #0d1228)", border: "1px solid #FFD700AA",
                borderRadius: 10, padding: 20, textAlign: "center"
              }}>
                <div style={{ fontSize: 11, color: "#6b7db3", marginBottom: 6 }}>📅 {fase.data} • ⏰ {fase.jogos[0][2]}</div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
                <div style={{ fontSize: 13, color: "#6b7db3" }}>Vencedor Semi 1 <span style={{ color: "#FFD700" }}>x</span> Vencedor Semi 2</div>
              </div>
            ))}
          </div>
        )}

        {/* REGRAS */}
        {tab === 7 && (
          <div>
            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 4 }}>LOCAL E HORÁRIO</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>📍 {REGRAS.local}</div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 4 }}>INVESTIMENTO</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>💵 {REGRAS.investimento}</div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 4 }}>FORMATO</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{REGRAS.formato}</div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 8 }}>PONTUAÇÃO</div>
              <div style={{ display: "flex", gap: 16 }}>
                <div><span style={{ color: "#4caf50", fontWeight: 800 }}>{REGRAS.pontuacao.vitoria}</span> <span style={{ fontSize: 12, color: "#6b7db3" }}>vitória</span></div>
                <div><span style={{ color: "#ff9800", fontWeight: 800 }}>{REGRAS.pontuacao.empate}</span> <span style={{ fontSize: 12, color: "#6b7db3" }}>empate</span></div>
                <div><span style={{ color: "#f44336", fontWeight: 800 }}>{REGRAS.pontuacao.derrota}</span> <span style={{ fontSize: 12, color: "#6b7db3" }}>derrota</span></div>
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 8 }}>CRITÉRIOS DE DESEMPATE</div>
              {REGRAS.desempate.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13 }}>
                  <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 11 }}>{i + 1}º</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, border: "1px solid #FFD70044" }}>
              <div style={{ fontSize: 11, color: "#FFD700", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>🏅 PREMIAÇÕES</div>
              {REGRAS.premiacoes.map((p, i) => (
                <div key={i} style={{ fontSize: 13, padding: "4px 0", borderBottom: i < REGRAS.premiacoes.length - 1 ? "1px solid #1e2d5a" : "none" }}>{p}</div>
              ))}
            </div>

            <div style={{ ...S.card, border: "1px solid #f4433655" }}>
              <div style={{ fontSize: 11, color: "#f44336", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>⚠️ REGRA DE W.O.</div>
              <div style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>{REGRAS.wo.descricao}</div>
              <div style={{ fontSize: 12, color: "#8899cc", marginBottom: 6 }}>
                <strong>Mínimo de jogadores:</strong> {REGRAS.wo.minimoJogadores} (incluindo goleiro)
              </div>
              <div style={{ fontSize: 12, color: "#8899cc", marginBottom: 6 }}>
                <strong>Placar:</strong> {REGRAS.wo.placarWO}
              </div>
              <div style={{ fontSize: 12, color: "#8899cc" }}>
                <strong>Reforços:</strong> {REGRAS.wo.reforco}
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 4 }}>TOLERÂNCIA DE ATRASO</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>⏰ {REGRAS.tolerancia}</div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 4 }}>ARBITRAGEM</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>🧑‍⚖️ {REGRAS.arbitragem}</div>
            </div>

            <div style={{ ...S.card, border: "1px solid #4caf5055" }}>
              <div style={{ fontSize: 11, color: "#4caf50", letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>🤝 FAIR PLAY</div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{REGRAS.fairplay}</div>
            </div>
          </div>
        )}

        {/* FOTOS */}
        {tab === 8 && (
          <div>
            {isAdmin && (
              <div style={{ background: "#0d1228", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13, color: "#FFD700" }}>📸 Adicionar Foto</div>
                <select value={rodadaFotoSelecionada} onChange={e => setRodadaFotoSelecionada(parseInt(e.target.value))} style={S.select}>
                  {RODADAS.map(r => <option key={r.rodada} value={r.rodada}>Rodada {r.rodada} ({r.data})</option>)}
                </select>
                <input placeholder="Cole o link da imagem (URL)" value={novaFotoUrl} onChange={e => setNovaFotoUrl(e.target.value)}
                  style={{ ...S.select, marginBottom: 8 }} />
                <input placeholder="Legenda (opcional)" value={novaFotoLegenda} onChange={e => setNovaFotoLegenda(e.target.value)}
                  style={{ ...S.select, marginBottom: 8 }} />
                <button onClick={adicionarFoto} style={S.btn}>+ Adicionar Foto</button>
                <div style={{ fontSize: 10, color: "#6b7db3", marginTop: 8 }}>
                  💡 Dica: suba a foto no Google Fotos, Imgur ou WhatsApp Web e cole o link direto da imagem aqui.
                </div>
              </div>
            )}

            {Object.keys(fotos).length === 0 ? (
              <div style={S.empty}><div style={{ fontSize: 48, marginBottom: 12 }}>📸</div><div>Nenhuma foto adicionada ainda</div></div>
            ) : (
              [...RODADAS].reverse().map(r => {
                const fotosRodada = fotos[r.rodada]
                if (!fotosRodada) return null
                return (
                  <div key={r.rodada} style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 700, color: "#FFD700", fontSize: 13, letterSpacing: 1, marginBottom: 10 }}>
                      RODADA {r.rodada} • {r.data}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {Object.entries(fotosRodada).map(([fotoId, foto]) => (
                        <div key={fotoId} style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #1e2d5a" }}>
                          <img src={foto.url} alt={foto.legenda || "Foto da rodada"} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                          {foto.legenda && (
                            <div style={{ padding: "6px 8px", fontSize: 11, color: "#8899cc", background: "#111827" }}>{foto.legenda}</div>
                          )}
                          {isAdmin && (
                            <button onClick={() => removerFoto(r.rodada, fotoId)}
                              style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 6, color: "#f44336", width: 24, height: 24, cursor: "pointer", fontSize: 14 }}
                            >✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* MODAL PERFIL DO JOGADOR */}
      {jogadorSelecionado && (() => {
        const j = jogadorSelecionado
        const time = TIMES.find(t => t.id === j.time)
        const corTime = time?.cor === "#FFFFFF" || time?.cor === "#000000" ? "#8899cc" : time?.cor
        const artMap = calcArtilheiros()
        const assMap = calcAssistencias()
        const mvpMap = calcMvps()
        const gols = artMap.find(a => a.nome === j.nome)?.gols || 0
        const assists = assMap.find(a => a.nome === j.nome)?.assists || 0
        const mvpsTotal = mvpMap.find(m => m.nome === j.nome)?.count || 0

        // jogos disputados (partidas onde o time jogou)
        const jogosDoTime = Object.values(resultados).filter(r =>
          r?.placar && (r.casa === time?.nome || r.fora === time?.nome)
        )
        const totalJogos = jogosDoTime.length
        const mediaGols = totalJogos > 0 ? (gols / totalJogos).toFixed(2) : "0.00"
        const mediaAssists = totalJogos > 0 ? (assists / totalJogos).toFixed(2) : "0.00"

        // partidas com gol do jogador
        const golsPorPartida = Object.entries(Object.fromEntries(
          Object.entries(gols).map(([key, lista]) => [
            key,
            Array.isArray(lista) ? lista.filter(g => g.jogador === j.nome).length : 0
          ]).filter(([, v]) => v > 0)
        ))

        // historico de partidas
        const historico = Object.entries(resultados)
          .filter(([, r]) => r?.placar && (r.casa === time?.nome || r.fora === time?.nome))
          .sort((a, b) => {
            const ra = parseInt(a[0].split('-')[0])
            const rb = parseInt(b[0].split('-')[0])
            return rb - ra
          })
          .slice(0, 5)

        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
            <div style={{ background: "#111827", border: `1px solid ${corTime}55`, borderRadius: 16, width: "100%", maxWidth: 420, maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ padding: 20 }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{j.nome}</div>
                    <div style={{ fontSize: 12, color: corTime, marginTop: 2 }}>{time?.nome}</div>
                    {j.funcao !== "Jogador" && (
                      <div style={{ fontSize: 11, color: "#FFD700", marginTop: 4, border: "1px solid #FFD70055", borderRadius: 4, padding: "2px 7px", display: "inline-block" }}>{j.funcao}</div>
                    )}
                  </div>
                  <button onClick={() => setJogadorSelecionado(null)}
                    style={{ background: "none", border: "none", color: "#6b7db3", fontSize: 22, cursor: "pointer" }}>✕</button>
                </div>

                {/* Stats principais */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                  {[
                    { label: "Gols", value: gols, icon: "⚽", cor: "#FFD700" },
                    { label: "Assists", value: assists, icon: "🎯", cor: "#6CABDD" },
                    { label: "MVPs", value: mvpsTotal, icon: "🌟", cor: "#c084fc" },
                    { label: "Jogos", value: totalJogos, icon: "📅", cor: "#4caf50" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#0d1228", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 18 }}>{s.icon}</div>
                      <div style={{ fontWeight: 800, fontSize: 20, color: s.cor }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "#6b7db3" }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Médias */}
                <div style={{ background: "#0d1228", borderRadius: 10, padding: 14, marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 10 }}>MÉDIAS POR JOGO</div>
                  <div style={{ display: "flex", justifyContent: "space-around" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#FFD700" }}>{mediaGols}</div>
                      <div style={{ fontSize: 11, color: "#6b7db3" }}>gols/jogo</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#6CABDD" }}>{mediaAssists}</div>
                      <div style={{ fontSize: 11, color: "#6b7db3" }}>assists/jogo</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "#4caf50" }}>{totalJogos > 0 ? (gols + assists).toFixed(0) : 0}</div>
                      <div style={{ fontSize: 11, color: "#6b7db3" }}>contribuições</div>
                    </div>
                  </div>
                </div>

                {/* Últimas partidas */}
                {historico.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: "#6b7db3", letterSpacing: 1, marginBottom: 8 }}>ÚLTIMAS PARTIDAS DO TIME</div>
                    {historico.map(([key, r]) => {
                      const ehCasa = r.casa === time?.nome
                      const adversario = ehCasa ? r.fora : r.casa
                      const golsTime = parseInt(ehCasa ? r.placar.casa : r.placar.fora) || 0
                      const golsAdv = parseInt(ehCasa ? r.placar.fora : r.placar.casa) || 0
                      const resultado = golsTime > golsAdv ? "V" : golsTime < golsAdv ? "D" : "E"
                      const corRes = resultado === "V" ? "#4caf50" : resultado === "D" ? "#f44336" : "#ff9800"
                      const golsNaPartida = Array.isArray(gols[key]) ? gols[key].filter(g => g.jogador === j.nome).length : 0
                      const assistsNaPartida = Array.isArray(assistencias[key]) ? assistencias[key].filter(a => a.jogador === j.nome).length : 0
                      const mvpNaPartida = mvps[key] === j.nome
                      return (
                        <div key={key} style={{ ...S.card, display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 5, background: corRes + "33", color: corRes, fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{resultado}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{adversario}</div>
                            <div style={{ fontSize: 10, color: "#6b7db3" }}>{golsTime} x {golsAdv}</div>
                          </div>
                          <div style={{ display: "flex", gap: 6, fontSize: 11 }}>
                            {golsNaPartida > 0 && <span style={{ color: "#FFD700" }}>⚽{golsNaPartida}</span>}
                            {assistsNaPartida > 0 && <span style={{ color: "#6CABDD" }}>🎯{assistsNaPartida}</span>}
                            {mvpNaPartida && <span>🌟</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {historico.length === 0 && (
                  <div style={{ textAlign: "center", color: "#6b7db3", padding: 20, fontSize: 13 }}>
                    Nenhuma partida registrada ainda
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL ADMIN */}
      {modalJogo && isAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#111827", border: "1px solid #1e2d5a", borderRadius: 16, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>📋 Súmula do Jogo</div>
                <button onClick={() => setModalJogo(null)} style={{ background: "none", border: "none", color: "#6b7db3", fontSize: 20, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: getTimeByNome(modalJogo.casa)?.cor }}>{modalJogo.casa}</div>
                  <input type="number" min="0" value={placar.casa} onChange={e => setPlacar(p => ({ ...p, casa: e.target.value }))}
                    style={{ width: 60, textAlign: "center", fontSize: 28, fontWeight: 800, background: "#1a1f3a", border: "2px solid #1e2d5a", borderRadius: 8, color: "#FFD700", padding: "8px 0" }} />
                </div>
                <div style={{ color: "#6b7db3", fontSize: 20, fontWeight: 700 }}>x</div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: getTimeByNome(modalJogo.fora)?.cor }}>{modalJogo.fora}</div>
                  <input type="number" min="0" value={placar.fora} onChange={e => setPlacar(p => ({ ...p, fora: e.target.value }))}
                    style={{ width: 60, textAlign: "center", fontSize: 28, fontWeight: 800, background: "#1a1f3a", border: "2px solid #1e2d5a", borderRadius: 8, color: "#FFD700", padding: "8px 0" }} />
                </div>
              </div>
              <button
                onClick={() => setPlacar(contarGolsPorTime(golsPartida, modalJogo.casa, modalJogo.fora))}
                style={{ ...S.btn, background: "#1e2d5a", color: "#FFD700", marginBottom: 16 }}
              >
                Recalcular placar pelos gols
              </button>

              <div style={{ background: "#0d1228", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13, color: "#FFD700" }}>⚽ Lances da Súmula</div>
                <select value={formGol.jogador} onChange={e => setFormGol(f => ({ ...f, jogador: e.target.value }))} style={S.select}>
                  <option value="">Quem fez o gol?</option>
                  {todosJogadores.map(j => <option key={j.nome} value={j.nome}>{j.nome} ({TIMES.find(t => t.id === j.time)?.nome})</option>)}
                </select>
                <select value={formGol.assistencia} onChange={e => setFormGol(f => ({ ...f, assistencia: e.target.value }))} style={S.select}>
                  <option value="">Assistência? (opcional)</option>
                  {todosJogadores.filter(j => j.nome !== formGol.jogador).map(j => <option key={j.nome} value={j.nome}>{j.nome}</option>)}
                </select>
                <button onClick={salvarGol} style={S.btn}>+ Adicionar Lance</button>
              </div>
              {golsPartida.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#6b7db3", marginBottom: 8 }}>GOLS E ASSISTÊNCIAS</div>
                  {golsPartida.map((g, i) => {
                    const t = TIMES.find(t => t.id === g.time)
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #1e2d5a", fontSize: 13 }}>
                        <span>⚽</span>
                        <div style={{ flex: 1 }}>
                          <div><span style={{ fontWeight: 600 }}>{g.jogador}</span> <span style={{ fontSize: 11, color: t?.cor }}>{t?.nome}</span></div>
                          {g.assistencia && <div style={{ fontSize: 11, color: "#6CABDD" }}>Assistência: {g.assistencia}</div>}
                        </div>
                        <button onClick={() => removerGol(i)}
                          style={{ marginLeft: "auto", background: "none", border: "none", color: "#f44336", cursor: "pointer", fontSize: 16 }}>✕</button>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#6CABDD" }}>📝 Observações da Súmula</div>
                <textarea
                  placeholder="W.O., cartões, atraso, ocorrência ou observação da partida"
                  value={sumulaObservacoes}
                  onChange={e => setSumulaObservacoes(e.target.value)}
                  rows={3}
                  style={{ ...S.select, resize: "vertical", minHeight: 78 }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13, color: "#c084fc" }}>🌟 MVP da Partida</div>
                <select value={mvpSelecionado} onChange={e => setMvpSelecionado(e.target.value)} style={S.select}>
                  <option value="">Selecionar MVP</option>
                  {todosJogadores.map(j => <option key={j.nome} value={j.nome}>{j.nome} ({TIMES.find(t => t.id === j.time)?.nome})</option>)}
                </select>
              </div>
              <button onClick={salvarPartida} style={S.btnSalvar}>💾 Salvar Súmula e Atualizar Tudo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
