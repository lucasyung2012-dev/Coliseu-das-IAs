# Baralho do Duelo (proposta para revisar com o Lucas)

**Atualizado: 2026-11-20** · Status: **proposta**. Nada disto foi construído.

## O que o Lucas pediu
- Coleção de **16 cartas**, com bastante variedade e estratégias diferentes.
- **Nenhum baralho que vence todos**: toda carta tem uma resposta (equilíbrio entre cartas e combinações).
- A IA usa **baralhos diferentes**, mas com um padrão, para não ficar repetitivo nem aleatório demais.

## Regras do baralho
- O baralho tem **8 cartas** (como no Clash Royale), sem repetir carta.
- Na mão ficam 4; a carta jogada volta para o fim da fila (igual hoje).
- Ninguém ganha carta por tempo jogado: **todas as 16 ficam liberadas desde o começo** (nada dá vantagem).

## As 16 cartas
| # | Carta | Tropa | 💨 | Força | O que faz | Perde para |
|---|---|---|---|---|---|---|
| 1 | ⚔️ Frase rápida | Legionário | 2 | 2 | Rápida e barata (já existe) | Tese, Muralha |
| 2 | 👥 Exemplos | 2 legionários pequenos | 2 | 1 + 1 | Dois de uma vez | Pergunta retórica |
| 3 | 🐎 Analogia | Cavaleiro | 3 | 2 | A tropa mais rápida | Contra-argumento |
| 4 | 🃏 Piada | Bobo da corte | 1 | 1 | Baratíssima, para girar o baralho | Qualquer tropa |
| 5 | 🛡️ Tese | Centurião | 4 | 4 | Lenta e resistente (já existe) | Exemplos, Refutação |
| 6 | 🐘 Discurso épico | Elefante | 7 | 8 | Muito lenta, aguenta muito | Muralha + tropas baratas |
| 7 | 🏛️ Citação de autoridade | Senador | 4 | 3 | Suas tropas perto dele ganham +1 de força | Fato, Refutação |
| 8 | 🏹 Fato | Arqueiro | 4 | 1 | Atira de longe (já existe) | Analogia |
| 9 | 📊 Estatística | Balista | 5 | 2 | Fica parada no seu campo e atira mais longe; some em 15 s | Analogia, Exemplos |
| 10 | 🎯 Prova | Catapulta | 6 | 2 | Só atira na torre, de longe | Cavaleiro, Frase rápida |
| 11 | 🧱 Muralha de lógica | Barricada | 3 | 5 | Não anda nem ataca: segura as tropas; some em 12 s | Prova, Fato |
| 12 | 🔄 Contra-argumento | Escudeiro | 3 | 3 | Fica na frente da sua torre e luta com quem chega | Fato, Estatística |
| 13 | ❗ Refutação | (feitiço) | 3 | – | Tira 2 de força da tropa inimiga mais perto da sua torre | Exemplos |
| 14 | ❓ Pergunta retórica | (feitiço) | 4 | – | Tira 1 de força de todas as tropas inimigas numa área | Tese, Elefante |
| 15 | ⏸️ Pausa dramática | (feitiço) | 3 | – | As tropas inimigas ficam paradas 2 s | — |
| 16 | 📣 Aplauso | (feitiço) | 3 | – | Suas tropas em campo andam mais rápido por 4 s | — |

Números para começar; a gente ajusta jogando.

## Baralhos da IA: 4 estilos
A cada partida a IA sorteia um **estilo** e monta 8 cartas daquele estilo, trocando 1 ou 2 por sorte. Cada IA tem um estilo preferido, para ter personalidade:
- **Pressa** (ChatGPT gosta): Frase rápida, Exemplos, Analogia, Piada, Aplauso…
- **Muralha** (Claude gosta): Tese, Muralha de lógica, Contra-argumento, Refutação…
- **Artilharia** (Gemini gosta): Fato, Estatística, Prova, Pausa dramática…
- **Equilibrado** (todas): um pouco de cada.

## Perguntas para o Lucas
1. As 16 cartas e os nomes estão bons? Quer trocar, tirar ou criar alguma?
2. Baralho de **8 cartas** está bom?
3. Os 4 estilos da IA (com o preferido de cada IA) fazem sentido?
4. A tela de montar o baralho fica onde: antes de cada Duelo ou numa aba "Meu baralho"?

## Decisões do Lucas (20/11/2026, depois)
- **Aprovados:** baralho de 8, nomes, o que cada carta faz, o fôlego de cada uma e os 4 estilos da IA.
- **Equilíbrio não é só "perde para":** cada carta tem uma **personalidade** que muda a partida:
  Frase rápida pressiona (chega primeiro) · Exemplos distraem (dois corpos) · Analogia **pula** a primeira tropa inimiga · Piada faz rir (quem luta com ela para 0,6 s) · Tese é firme (flecha tira metade) · Discurso épico empolga (enquanto vivo, seu fôlego volta mais rápido) · Citação de autoridade lidera (+1 nas suas tropas perto) · Fato atira de longe · Estatística é posto fixo · Prova é cerco (só ataca a torre) · Muralha de lógica segura · Contra-argumento devolve 1 a cada golpe (some em 15 s) · Refutação é precisa · Pergunta retórica é em área · Pausa dramática congela · Aplauso empurra.
- **Estatística mais fraca** (o Lucas achou que parada atirando seria forte demais): atira só 4 vezes ou some em 10 s, tem só 2 de vida, máximo 1 em campo, custa 5. *(proposta, aguardando OK)*
- **Arena continua deitada** (visão de lado = essência própria, não cópia do Clash Royale), mais detalhada e organizada.
- **Meu baralho:** aba onde se monta as 8 cartas uma vez; fica salvo (progresso e Dropbox) para os próximos duelos.
- **Estatística: aprovada** (4 tiros ou 10 s, 2 de vida, máx. 1 em campo, 5 de fôlego).
- **Rodadas (decisão do Lucas, revista):** 2 rodadas de 1 min 30 s e depois sempre a **Prorrogação**: 20 s com gotas +25% para os dois. Não existe mais a "virada" (quem perdia ganhava +25% na rodada final). Empate na vida no fim = empate.
- **Trocar a torre** (não existia no Coliseu): opções Rostra (tribuna dos oradores, recomendada: combina com debate), Águia da legião (estandarte) ou Portão do Coliseu. Aguardando a escolha do Lucas.
