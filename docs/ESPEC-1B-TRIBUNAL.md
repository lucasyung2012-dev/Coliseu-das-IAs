# Etapa 1b: Tribunal (especificação para revisar)

**Atualizado: 2026-11-18** · Status: **proposta, aguardando revisão do Lucas**. Nada disto foi construído ainda.

## 1. A partida em uma frase
Você defende um lado de um dilema contra uma IA rival, em 3 tempos. Cada carta que você joga puxa os jurados para o seu lado ou para o lado do rival. Ganha quem tiver mais jurados no fim.

## 2. Antes da partida (sorteio)
1. Você já escolheu a sua IA no Arcade.
2. Sorteio: **dilema** (entre 10), **seu lado** (a favor ou contra), **rival** (uma das outras 2 IAs) e **5 jurados** (entre 8).
3. O filminho de entrada roda (já existe).
4. Tela de briefing: o dilema, o seu lado, os 5 jurados com o que cada um **gosta** e **não gosta**. Botão "Começar".

## 3. A tela da partida (pensada para iPad)
- **Topo:** o dilema, o seu lado, o tempo (1/3, 2/3, 3/3) e o cronômetro de 90 s.
- **Meio:** o Pretor e os 5 jurados. Cada jurado tem um **ponteiro** com 7 posições:
  `◀◀◀ rival · · · meio · · · você ▶▶▶` (de −3 a +3). Todos começam no meio (0).
- **Baixo:** a sua mão com **4 cartas** e o botão da **habilidade** da sua IA.

## 4. O que tem numa carta
- **Título** curto e **texto** de 1 a 2 frases, escrito à mão (sem modelo de frase).
- **1 ou 2 temas**, mostrados como ícones. São 8 temas:

| Ícone | Tema | Exemplo de carta |
|---|---|---|
| 🧩 | Lógica | "Se A leva a B, e B leva a C…" |
| 🔬 | Prova | "Um estudo com 2 mil alunos mostrou…" |
| ❤️ | Pessoas | "Pense no avô que mora sozinho…" |
| 🏛️ | Tradição | "Sempre funcionou assim nas escolas…" |
| 🛠️ | Viabilidade | "Dá para começar já no próximo mês…" |
| 💰 | Custo | "Custa menos que um lanche por aluno…" |
| 🚀 | Inovação | "Ninguém tentou isso ainda…" |
| 🎨 | Imagem | "Imagine a cidade inteira acendendo…" |

- Embaixo da carta: **👍 nos jurados que ela agrada** e **👎 nos que ela irrita**, só entre os 5 que estão na sessão.

## 5. Como cada jurado reage (a tabela que decide tudo)
Cada jurado **ama** um tema (+2), **gosta** de outro (+1) e **não gosta** de um terceiro (−1). Os outros temas não mexem nele.

| Jurado | Ama (+2) | Gosta (+1) | Não gosta (−1) |
|---|---|---|---|
| Lógico | 🧩 Lógica | 🔬 Prova | 🎨 Imagem |
| Cético | 🔬 Prova | 🧩 Lógica | 🚀 Inovação |
| Empático | ❤️ Pessoas | 🎨 Imagem | 💰 Custo |
| Tradicionalista | 🏛️ Tradição | 🛠️ Viabilidade | 🚀 Inovação |
| Estrategista | 🛠️ Viabilidade | 💰 Custo | 🏛️ Tradição |
| Cientista | 🚀 Inovação | 🔬 Prova | 🏛️ Tradição |
| Comerciante | 💰 Custo | 🛠️ Viabilidade | 🎨 Imagem |
| Artista | 🎨 Imagem | 🚀 Inovação | 💰 Custo |

- Carta com 2 temas soma os dois efeitos, com limite de +3 e −2 por jurado.
- **Resistência:** o Cético é teimoso (ganhos −1, mínimo +1). O Empático e o Artista são fáceis de comover (ganhos +1).
- Por que assim: dá para **aprender jogando**. Depois de algumas partidas você sabe que, sem o Empático no júri, uma carta de ❤️ Pessoas rende pouco.

## 6. Um tempo, passo a passo
1. Você escolhe 1 das 4 cartas (90 s). Ao mesmo tempo, o rival escolhe a dele, escondido.
2. **Revelação:** as duas cartas aparecem, com som e animação.
3. Os ponteiros andam: a sua carta puxa para o seu lado e a do rival puxa para o lado dele.
4. **Cada jurado que se mexeu diz uma frase**, ligada ao tema. Exemplo do Cético: *"Isso tem número de verdade. Gostei."*
5. As cartas jogadas saem da mão e entram cartas novas para o próximo tempo.
- **Se o tempo acabar**, o jogo joga uma carta sua aleatória (o Pretor diz *"Silêncio não é argumento!"*).

## 7. Os 3 tempos
- **Tempo 1, Sustentação oral:** cartas que apresentam a sua tese.
- **Tempo 2, Réplica:** cartas que respondem ao rival (*"Meu rival promete, mas…"*).
- **Tempo 3, Alegações finais:** cartas de fechamento, mais fortes. **Neste tempo os efeitos valem 1,5×**, para a virada ser possível até o fim.

## 8. Habilidade da IA (uma vez por partida)
- **Claude, Diplomacia:** escolhe um jurado que está do lado do rival e o traz de volta ao meio (0).
- **ChatGPT, Improviso:** troca a sua mão inteira por 4 cartas novas.
- **Gemini, Visão:** vê a carta do rival **antes** de escolher a sua, neste tempo.

## 9. O rival (IA do jogo)
- Ele olha os jurados e calcula qual carta rende mais.
- **Erro de propósito, por liga:** Recrutas acerta a melhor carta em 40% das vezes; Gladiadores 55%; Centuriões 70%; Pretorianos 80%; Imperadores 90%. Nas outras vezes, joga uma carta qualquer.
- Ele também usa a habilidade dele uma vez, no momento em que for melhor para ele.

## 10. Veredito
1. O Pretor **bate o martelo** (som e tremor).
2. Os votos aparecem **cadeira por cadeira**, com uma pausa e um som em cada um:
   - ponteiro do seu lado → voto seu;
   - ponteiro do lado do rival → voto do rival;
   - ponteiro no meio → o jurado **se abstém**.
3. Ganha quem tiver mais votos. **Empate:** sem troféus, e metade do XP.
4. Tela final: vitória (com o som de vitória e confete) ou derrota (com o som de derrota). Mostra o placar de votos, os **troféus** (pela tabela da sua liga), o **XP**, e **uma frase por jurado explicando o voto**.
5. Botões: **Revanche** (mesmo rival, novo dilema) e **Voltar ao Arcade**. A partida entra no histórico.

## 11. Conteúdo que eu escrevo à mão
- **10 dilemas** (os mais legais dos 30 do Lovable): celulares na escola · robôs cuidando de idosos · IA em decisões médicas · provas trocadas por projetos · exploração espacial · jogos que ensinam cidadania · semana de 4 dias · corredores para animais na cidade · influenciadores marcando publicidade · reconhecimento facial nas escolas.
- **Por dilema:** 2 lados × 3 tempos × 6 cartas = **36 cartas** (o jogo sorteia 4). No total, **360 cartas**.
- **Reações dos jurados:** cada jurado tem frases para quando ama, gosta ou não gosta, por tema (cerca de 100 frases).
- **Frases do Pretor:** abertura, tempo esgotado, veredito.

## 12. Como vamos construir (dentro da 1b)
1. **Regras e motor**, com testes: sorteio, efeitos, resistência, rival, votos, troféus.
2. **Tela da partida** com 1 dilema completo, para você testar e opinar.
3. **Os outros 9 dilemas** e as frases.
4. **Animações e sons** de revelação, ponteiro, veredito, vitória e derrota.

## 13. Perguntas para o Lucas
1. Os **8 temas** e a **tabela dos jurados** fazem sentido? Quer trocar algum gosto?
2. O **Tempo 3 valendo 1,5×** é uma boa?
3. **Empate** sem troféus está bom?
4. Quer **outros dilemas** no lugar de algum dos 10?
5. A habilidade do ChatGPT: **trocar a mão inteira** ou **trocar 1 carta**?
