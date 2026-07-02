export const TIMES = [
  { id: 1, nome: "Chelsea", capitao: "Eduardo Siqueira", cor: "#034694", corSecundaria: "#DBA111" },
  { id: 2, nome: "Juventus", capitao: "Enrique Magalhães", cor: "#333333", corSecundaria: "#FFFFFF" },
  { id: 3, nome: "Real Madrid", capitao: "G. Baia", cor: "#00529F", corSecundaria: "#FFD700" },
  { id: 4, nome: "Milan", capitao: "Riquelme Batista", cor: "#FB090B", corSecundaria: "#000000" },
  { id: 5, nome: "Barcelona", capitao: "Gabriel Honorato", cor: "#A50044", corSecundaria: "#004D98" },
  { id: 6, nome: "Roma", capitao: "Gleyck Isídio", cor: "#8E1F2F", corSecundaria: "#F0BC42" },
]

export const JOGADORES = [
  // Chelsea ✅ (7 linha + goleiro)
  { nome: "Eduardo Siqueira", time: 1, funcao: "Capitão", posicao: null },
  { nome: "Maguila", time: 1, funcao: "Jogador", posicao: null },
  { nome: "Wesley Victor", time: 1, funcao: "Jogador", posicao: null },
  { nome: "Vitor Ratinho", time: 1, funcao: "Jogador", posicao: null },
  { nome: "G. Queiroz", time: 1, funcao: "Jogador", posicao: null },
  { nome: "Japa", time: 1, funcao: "Jogador", posicao: null },
  { nome: "Rômulo", time: 1, funcao: "Jogador", posicao: null },

  // Juventus ✅ (7 linha + goleiro)
  { nome: "Enrique Magalhães", time: 2, funcao: "Capitão", posicao: null },
  { nome: "Dioguinho", time: 2, funcao: "Jogador", posicao: null },
  { nome: "Jorge Isídio", time: 2, funcao: "Jogador", posicao: null },
  { nome: "Niel Cabelos", time: 2, funcao: "Jogador", posicao: null },
  { nome: "Edgar Isídio", time: 2, funcao: "Jogador", posicao: null },
  { nome: "Zé Victor", time: 2, funcao: "Jogador", posicao: null },
  { nome: "Dorgi", time: 2, funcao: "Jogador", posicao: null },

  // Real Madrid ✅ (7 linha + goleiro)
  { nome: "G. Baia", time: 3, funcao: "Capitão", posicao: null },
  { nome: "Bielzinho", time: 3, funcao: "Jogador", posicao: null },
  { nome: "Gugu", time: 3, funcao: "Jogador", posicao: null },
  { nome: "Jean Telles", time: 3, funcao: "Jogador", posicao: null },
  { nome: "Lukas Honorato", time: 3, funcao: "Jogador", posicao: null },
  { nome: "Boquinha", time: 3, funcao: "Jogador", posicao: null },
  { nome: "David", time: 3, funcao: "Jogador", posicao: null },

  // Milan ✅ (7 linha + goleiro)
  { nome: "Riquelme Batista", time: 4, funcao: "Capitão", posicao: null },
  { nome: "Kimzeira", time: 4, funcao: "Jogador", posicao: null },
  { nome: "L. Magalhães", time: 4, funcao: "Jogador", posicao: null },
  { nome: "Jair", time: 4, funcao: "Jogador", posicao: null },
  { nome: "Maguilinha", time: 4, funcao: "Jogador", posicao: null },
  { nome: "Alerrandro", time: 4, funcao: "Jogador", posicao: null },
  { nome: "Dedé Isídio", time: 4, funcao: "Jogador", posicao: null },

  // Barcelona ✅ (7 linha + goleiro)
  { nome: "Gabriel Honorato", time: 5, funcao: "Capitão", posicao: null },
  { nome: "Bruno Elves", time: 5, funcao: "Jogador", posicao: null },
  { nome: "Fagner Forasteiro", time: 5, funcao: "Jogador", posicao: null },
  { nome: "Chico", time: 5, funcao: "Jogador", posicao: null },
  { nome: "Panchuca", time: 5, funcao: "Jogador", posicao: null },
  { nome: "Cosmim", time: 5, funcao: "Jogador", posicao: null },
  { nome: "Renato", time: 5, funcao: "Jogador", posicao: null },

  // Roma ✅ (7 linha + goleiro)
  { nome: "Gleyck Isídio", time: 6, funcao: "Capitão", posicao: null },
  { nome: "Henrique Neguin", time: 6, funcao: "Jogador", posicao: null },
  { nome: "G. Carequinha", time: 6, funcao: "Jogador", posicao: null },
  { nome: "Wagner", time: 6, funcao: "Jogador", posicao: null },
  { nome: "Leonardo", time: 6, funcao: "Jogador", posicao: null },
  { nome: "Dandao", time: 6, funcao: "Jogador", posicao: null },
  { nome: "José", time: 6, funcao: "Jogador", posicao: null },
]

export const GOLEIROS = {
  1: "F. Cigano",
  2: "F. Cigano",
  3: "Victor Coutinho",
  4: "Eugênio",
  5: "F. Cigano",
  6: "Vini",
}

export const TIMES_INCOMPLETOS = {
  1: false, 2: false, 3: false, 4: false, 5: false, 6: false
}

export const RODADAS = [
  { rodada: 1, data: "03/07", jogos: [["Chelsea","Juventus","19:30"],["Real Madrid","Milan","20:10"],["Barcelona","Roma","20:51"]] },
  { rodada: 2, data: "10/07", jogos: [["Chelsea","Real Madrid","19:30"],["Juventus","Barcelona","20:10"],["Milan","Roma","20:51"]] },
  { rodada: 3, data: "17/07", jogos: [["Chelsea","Milan","19:30"],["Juventus","Roma","20:10"],["Real Madrid","Barcelona","20:51"]] },
  { rodada: 4, data: "24/07", jogos: [["Chelsea","Barcelona","19:30"],["Juventus","Milan","20:10"],["Real Madrid","Roma","20:51"]] },
  { rodada: 5, data: "31/07", jogos: [["Chelsea","Roma","19:30"],["Juventus","Real Madrid","20:10"],["Milan","Barcelona","20:51"]] },
  { rodada: 6, data: "07/08", jogos: [["Juventus","Chelsea","19:30"],["Milan","Juventus","20:10"],["Roma","Chelsea","20:51"]] },
  { rodada: 7, data: "14/08", jogos: [["Real Madrid","Chelsea","19:30"],["Barcelona","Juventus","20:10"],["Roma","Milan","20:51"]] },
  { rodada: 8, data: "21/08", jogos: [["Milan","Chelsea","19:30"],["Roma","Juventus","20:10"],["Barcelona","Real Madrid","20:51"]] },
  { rodada: 9, data: "28/08", jogos: [["Barcelona","Chelsea","19:30"],["Milan","Juventus","20:10"],["Roma","Real Madrid","20:51"]] },
  { rodada: 10, data: "04/09", jogos: [["Roma","Chelsea","19:30"],["Real Madrid","Juventus","20:10"],["Barcelona","Milan","20:51"]] },
]

export const MATA_MATA = [
  { fase: "Semifinais — Ida", data: "11/09", jogos: [["1º","4º","19:30"],["2º","3º","20:30"]] },
  { fase: "Semifinais — Volta", data: "18/09", jogos: [["1º","4º","19:30"],["2º","3º","20:30"]] },
  { fase: "Final", data: "02/10", jogos: [["Vencedor SF1","Vencedor SF2","19:30"]] },
]

export const TABS = ["🏆 Classificação", "⚽ Artilheiros", "🎯 Assistências", "🌟 MVP", "📅 Jogos", "👥 Elencos", "🔥 Mata-Mata", "📜 Regras", "📸 Fotos"]

export const REGRAS = {
  formato: "Fase de grupos (ida e volta, 25 min) + Mata-Mata (Semis 15+15 min, Final 30+30 min)",
  duracaoJogo: "25 minutos (fase de grupos) • Semis: 15+15 min • Final: 30+30 min",
  local: "Quadra Life • Quintas-feiras às 20:30h",
  investimento: "R$ 7,00 por quinta-feira (pagamento antecipado)",
  pontuacao: { vitoria: 3, empate: 1, derrota: 0 },
  desempate: ["Pontos", "Saldo de gols", "Gols pró", "Confronto direto", "Sorteio"],
  premiacoes: ["🏆 Campeão", "⭐ Melhor Jogador", "⚽ Artilheiro", "🧤 Melhor Goleiro", "🌟 Certificado MVP da Rodada"],
  wo: {
    minimoJogadores: 4,
    descricao: "Cada time precisa entrar em quadra com no mínimo 4 jogadores (incluindo goleiro). Se não atingir o mínimo até 15 minutos após o horário marcado, o jogo é dado como W.O.",
    placarWO: "3 x 0 para o time presente",
    reforco: "Times incompletos podem usar reforços de fora do campeonato — nunca de outro time já inscrito.",
  },
  tolerancia: "10 minutos de tolerância após o horário marcado antes de iniciar a contagem para W.O.",
  arbitragem: "3 árbitros por partida: 2 em campo + 1 na súmula. Respeito às decisões é inegociável.",
  fairplay: "Fair Play é a maior regra. Conduta antidesportiva sujeita a punição.",
}

export const ARBITROS_POOL = []
