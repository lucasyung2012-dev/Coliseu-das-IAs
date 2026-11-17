# Coliseu das IAs: análise do app do Lovable e plano da versão GitHub

**Atualizado: 2026-11-15** · Dono do produto: Lucas · Base: app publicado em coliseu-das-ias.lovable.app (jogado e lido em 02/11 e 15/11/2026)

## O que tem dentro do app do Lovable
- **Arcade:** 30 dilemas (`referencia/dilemas-lovable.json`). Cada dilema tem só 5 campos (pergunta, tema, princípio, risco, exemplo). Todas as cartas e teses são **montadas por modelo de frase**, com esses campos encaixados. Por isso os textos saem estranhos ("reconheça confundir...", frase repetida em toda carta).
- **Jurados:** 5, cada um com sensibilidade e resistência (Cético = 3, Empático = 1, os outros = 2).
- **Ludus:** os 20 desafios usam só **5 mecânicas** repetidas (`target`, `memory`, `sequence`, `sort`, `balance`). O nome técnico `target` aparece na tela por engano.
- **Fossa:** 7 minigames definidos no código, mas a tela só mostra as tochas.
- **Coliseu:** usa a IA do Lovable (créditos da conta). Fora do Lovable não funciona sem servidor.
- O código todo do jogo tem ~50 KB. **Decisão: recomeçar limpo** e aproveitar dilemas, nomes e regras. Remendar o código do Lovable sairia mais caro do que refazer.

## Decisões (acertadas com o Lucas em 02/11 e 15/11/2026)
| # | Decisão |
|---|---|
| D1 | Sai do Lovable: repositório no GitHub, publicado pelo GitHub Pages, custo zero (mesmo esquema do ROUTIG). |
| D2 | Coliseu sem IA ao vivo por enquanto: **Modo Colar** (cola as respostas, dá notas, pódio). Gemini ao vivo grátis fica como opção futura. |
| D3 | Sem login e sem nuvem por enquanto: progresso salvo no aparelho. |
| D4 | Fossa e tochas saem. XP de Maestria vem de todas as partidas. |
| D5 | Ludus vira 4 treinos (um por equipamento, 3 níveis); os atributos dão bônus com os jurados no Arcade. |
| D6 | Textos escritos de verdade, sem modelo de frase. |
| D7 | Dois visuais: Coliseu em mármore e ouro; Arcade em neon. |
| D8 | (17/11) **Primeiro refazer bem tudo que o jogo já tem**, com as melhorias aprovadas. Aprofundar Duelo e Tribunal depois. |
| D9 | (17/11) Tribunal: lado sorteado, ponteiro por jurado, cartas mostram quem agradam e quem irritam, explicação por jurado, 4 cartas por tempo, **jurados que mudam** (5 de 8). Ficam para depois: testemunha. Rejeitados por enquanto: eventos do Pretor. |
| D10 | (17/11) Duelo: 5 cartas, escolhe 2 quaisquer, fusão costurada, veredito explicado, rival melhor nas ligas altas, animação de choque, habilidade por IA, revanche com um toque. A roda de estilos, a abertura/fecho e o humor da plateia ficaram complexos: **voltam à mesa depois**. |
| D11 | (17/11) Um nome de gladiador por IA nos dois modos. Habilidades: Claude acalma um jurado ou vira empate em vitória; ChatGPT troca uma carta; Gemini espia uma carta do rival. |
| D12 | (17/11) Em aberto: Torneios, Truques (ex-Códex), 2 Jogadores, Dilema do Dia, Criador de Dilemas (aceito em princípio) e o teste de IA no navegador (Lucas não precisa fazer nada; viabilidade só testando no iPad). |

## Etapas
0. **Base:** esqueleto do site, CI e publicação no GitHub Pages.
1. **Arcade justo**, em três partes, cada uma publicada e testada:
   - 1a. Personagens, ligas, troféus, Maestria, histórico e a tela do Arcade.
   - 1b. Tribunal com as regras aprovadas e 10 dilemas escritos à mão.
   - 1c. Duelo com as regras aprovadas.
2. **Bonito:** neon, portões, transições, sons, reações ao toque.
3. **Ludus novo.**
4. **Mapa do Caminho de Troféus.**
5. **Coliseu com Modo Colar.**
6. **Revisão final:** iPad, celular, instalar como app, Dilema do Dia, 30 dilemas completos.

## Limite técnico desta máquina
O computador não roda Node. O site só é montado e testado no GitHub (CI). **Até existir o repositório no GitHub, nada pode ser visto funcionando.**
