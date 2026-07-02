export const torneio = {
  nome: 'Champions League Atlético Paraíso 2026',
  temporada: 2026,
  descricao: 'Elenco oficial final com 6 times completos, 42 jogadores de linha e 4 goleiros.'
}

export const times = [
  {
    nome: 'Chelsea',
    goleiro: 'F. Cigano',
    jogadoresLinha: ['Eduardo', 'Maguila', 'Wesley', 'Vitor', 'G. Queiroz', 'Japa', 'Rômulo']
  },
  {
    nome: 'Juventus',
    goleiro: 'F. Cigano',
    jogadoresLinha: ['Enrique', 'Dioguinho', 'Jorge', 'Niel', 'Edgar', 'Zé Victor', 'Dorgi']
  },
  {
    nome: 'Real Madrid',
    goleiro: 'Victor Coutinho',
    jogadoresLinha: ['G. Baia', 'Bielzinho', 'Gugu', 'Jean', 'Lukas', 'Boquinha', 'David']
  },
  {
    nome: 'Milan',
    goleiro: 'Eugênio',
    jogadoresLinha: ['Riquelme', 'Kimzeira', 'L. Magalhães', 'Jair', 'Maguilinha', 'Alerrandro', 'Dedé']
  },
  {
    nome: 'Barcelona',
    goleiro: 'F. Cigano',
    jogadoresLinha: ['Gabriel', 'Bruno', 'Fagner', 'Chico', 'Panchuca', 'Cosmim', 'Renato']
  },
  {
    nome: 'Roma',
    goleiro: 'Vini',
    jogadoresLinha: ['Gleyck', 'Henrique', 'G. Carequinha', 'Wagner', 'Leonardo', 'Dandao', 'José']
  }
]

export const jogadores = times.flatMap((time) =>
  time.jogadoresLinha.map((nome) => ({
    nome,
    time: time.nome,
    posicao: 'Linha'
  }))
)

export const goleiros = [...new Set(times.map((time) => time.goleiro))]

export const resumo = {
  times: times.length,
  jogadoresLinha: jogadores.length,
  goleiros: goleiros.length,
  participantes: jogadores.length + goleiros.length,
  vagaExtra: 'Vaga 8 em aberto para expansão futura.'
}

export const rodadas = []
export const regras = [
  'Todos os times completos com 7 jogadores de linha.',
  'Goleiros podem atuar em mais de um elenco conforme definido pela organização.',
  'A vaga 8 permanece aberta para expansão.'
]
