import test from "node:test"
import assert from "node:assert/strict"
import { RODADAS, TIMES, MATA_MATA } from "../src/data.js"

test("a fase de liga tem 10 rodadas e 30 partidas", () => {
  assert.equal(RODADAS.length, 10)
  assert.equal(RODADAS.reduce((total, rodada) => total + rodada.jogos.length, 0), 30)
})

test("cada par de equipes se enfrenta exatamente duas vezes", () => {
  const confrontos = new Map()
  for (const rodada of RODADAS) {
    for (const [casa, fora] of rodada.jogos) {
      assert.notEqual(casa, fora)
      const chave = [casa, fora].sort().join("::")
      confrontos.set(chave, (confrontos.get(chave) || 0) + 1)
    }
  }
  assert.equal(confrontos.size, 15)
  for (const [chave, quantidade] of confrontos) {
    assert.equal(quantidade, 2, `${chave} deve ocorrer duas vezes`)
  }
})

test("todas as equipes da tabela existem no cadastro", () => {
  const nomes = new Set(TIMES.map(time => time.nome))
  for (const rodada of RODADAS) {
    for (const [casa, fora] of rodada.jogos) {
      assert.ok(nomes.has(casa), `Equipe da casa desconhecida: ${casa}`)
      assert.ok(nomes.has(fora), `Equipe visitante desconhecida: ${fora}`)
    }
  }
})

test("mata-mata possui ida, volta e final", () => {
  assert.ok(MATA_MATA.some(fase => fase.fase.toLowerCase().includes("ida")))
  assert.ok(MATA_MATA.some(fase => fase.fase.toLowerCase().includes("volta")))
  assert.ok(MATA_MATA.some(fase => fase.fase === "Final"))
})
