# Plano de recuperação e publicação segura

## O que esta branch prepara
- Remove o PIN administrativo do código cliente.
- Exige Firebase Authentication e autorização explícita em `admins/{uid} = true`.
- Restringe gravações administrativas às contas autorizadas.
- Suspende gravações públicas de votos até existir validação confiável no servidor.
- Corrige a rodada 6 da fase de liga.
- Inclui ida e volta das semifinais na visualização.
- Inclui exportação do histórico de súmulas no backup.
- Adiciona testes automatizados para consistência da tabela.

## Passos obrigatórios no Firebase antes da publicação
1. Exportar integralmente o Realtime Database atual e guardar o arquivo fora do repositório.
2. Identificar o UID da conta administrativa no Firebase Authentication.
3. Criar manualmente `admins/{UID}: true` no Realtime Database.
4. Testar login com a conta autorizada e com uma conta comum.
5. Testar que uma conta comum não consegue gravar resultados, gols, súmulas, fotos ou abrir/fechar votações.
6. Publicar `database.rules.json` somente após os testes de regras.
7. Confirmar os dados históricos e as permissões antes de publicar a aplicação.

**Importante:** as regras desta branch bloqueiam a escrita de votos por visitantes. A votação pública deve permanecer suspensa até ser substituída por um fluxo validado no servidor (por exemplo, verificação de identidade e proteção contra repetição). Hash de CPF calculado no navegador não é prova de identidade nem garante voto único.

## Dados que ainda exigem decisão do organizador
- Confirmar se as datas de 2026 e os horários atuais são oficiais.
- Confirmar se os jogos do mata-mata devem usar placar agregado e qual regra em caso de empate.
- Confirmar se o desempate por confronto direto deve usar pontos, saldo e gols no confronto entre os empatados; a implementação atual usa pontos, saldo e gols do confronto.
