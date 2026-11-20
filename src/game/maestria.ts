import type { IaId } from './personagens';

/**
 * Maestria: cada combatente sobe de nível com o XP das partidas que valem
 * (vitória +40, empate +20, derrota +20). Pedido do Lucas (20/11/2026): tudo
 * personalizado por combatente. Cada um tem o seu tema:
 * Cassius (Claude) = o Sábio do Fórum; Octavius (ChatGPT) = o General do Porto;
 * Helios (Gemini) = o Vidente das Estrelas. Os níveis são os mesmos para os três.
 */
export interface Titulo {
  nivel: number;
  nome: string;
  frase: string;
}

const NIVEIS_TITULO = [1, 5, 10, 20, 30, 50, 75, 100] as const;

function titulos(lista: [string, string][]): Titulo[] {
  return lista.map(([nome, frase], i) => ({ nivel: NIVEIS_TITULO[i]!, nome, frase }));
}

export const TITULOS_POR_IA: Record<IaId, Titulo[]> = {
  claude: titulos([
    ['Aluno da Ágora', 'Acabou de chegar à praça onde os sábios conversam.'],
    ['Leitor de Pergaminhos', 'Já leu mais rolos do que muito senador.'],
    ['Orador do Fórum', 'Quando fala, a praça para para ouvir.'],
    ['Conselheiro', 'Até os juízes pedem a opinião dele.'],
    ['Mestre da Retórica', 'Ensina a arte de convencer com calma.'],
    ['Guardião da Biblioteca', 'Tem a chave de todos os livros de Roma.'],
    ['Sábio de Roma', 'Tem uma estátua com um livro na mão.'],
    ['Filósofo Imortal', 'As escolas ainda estudam as ideias dele.'],
  ]),
  chatgpt: titulos([
    ['Grumete do Porto', 'Ainda está aprendendo a amarrar as cordas.'],
    ['Marinheiro', 'Já atravessou o mar sem enjoar.'],
    ['Timoneiro', 'Segura o leme mesmo com vento contra.'],
    ['Capitão da Galera', 'Tem o seu próprio navio e um plano para cada onda.'],
    ['Comandante da Frota', 'Dez navios obedecem ao seu sinal.'],
    ['General das Legiões', 'Planeja batalhas em terra e no mar.'],
    ['Senhor dos Mares', 'Os portos de Roma levam o seu nome.'],
    ['Almirante Eterno', 'Até hoje os navios saúdam a sua estátua.'],
  ]),
  gemini: titulos([
    ['Olhar Curioso', 'Passa as noites olhando para o céu.'],
    ['Contador de Estrelas', 'Já sabe o nome de cem estrelas.'],
    ['Leitor do Céu', 'Lê nas estrelas o que vai acontecer.'],
    ['Guardião da Lua', 'A lua parece brilhar mais quando ele luta.'],
    ['Astrônomo da Arena', 'Calcula cada golpe como a órbita de um planeta.'],
    ['Mestre das Constelações', 'Desenhou um mapa do céu inteiro.'],
    ['Oráculo de Roma', 'O Senado consulta as previsões dele.'],
    ['Sol de Roma', 'Quando ele entra, a arena inteira se ilumina.'],
  ]),
};

export function titulosDe(ia: IaId): Titulo[] {
  return TITULOS_POR_IA[ia];
}

export function tituloDoNivel(nivel: number, ia: IaId): Titulo {
  const lista = titulosDe(ia);
  return [...lista].reverse().find((t) => nivel >= t.nivel) ?? lista[0]!;
}

export function proximoTitulo(nivel: number, ia: IaId): Titulo | null {
  return titulosDe(ia).find((t) => t.nivel > nivel) ?? null;
}

// ---------- Recompensas de Maestria (só visual: nunca dão vantagem na partida) ----------

export type TipoRecompensa = 'moldura' | 'titulo' | 'fala' | 'armadura' | 'aura' | 'pose' | 'entrada' | 'coroa';

export interface Recompensa {
  nivel: number;
  tipo: TipoRecompensa;
  nome: string;
  descricao: string;
  icone: string;
}

// Os mesmos níveis e tipos para os três (trilha aprovada em 19/11/2026); nomes e desenhos de cada um.
const TRILHA: [number, TipoRecompensa][] = [
  [2, 'moldura'],
  [5, 'titulo'],
  [5, 'fala'],
  [10, 'armadura'],
  [15, 'aura'],
  [20, 'moldura'],
  [20, 'pose'],
  [30, 'entrada'],
  [50, 'armadura'],
  [50, 'moldura'],
  [75, 'aura'],
  [100, 'coroa'],
];

function trilha(lista: [string, string, string][]): Recompensa[] {
  return lista.map(([nome, descricao, icone], i) => ({ nivel: TRILHA[i]![0], tipo: TRILHA[i]![1], nome, descricao, icone }));
}

export const RECOMPENSAS_POR_IA: Record<IaId, Recompensa[]> = {
  claude: trilha([
    ['Moldura de pergaminho', 'O retrato ganha uma moldura de pergaminho com bronze.', '📜'],
    ['Título do Sábio', 'O seu título aparece no VS do Duelo e na faixa do Tribunal.', '🏷️'],
    ['Frase do filósofo', 'Quando vence, Cassius diz uma frase sábia.', '💬'],
    ['Toga de combate', 'A armadura ganha a cor laranja de Cassius.', '🧥'],
    ['Folhas de oliveira', 'Folhas de oliveira giram em volta dele.', '🌿'],
    ['Moldura de mármore', 'A moldura do retrato vira mármore branco.', '⬜'],
    ['Reverência do sábio', 'Na vitória, ele pula de alegria e faz uma reverência.', '🙇'],
    ['Entrada dos pergaminhos', 'Entra no Coliseu com pergaminhos voando em volta.', '📚'],
    ['Armadura de bronze antigo', 'Armadura de bronze das estátuas antigas.', '🟫'],
    ['Moldura de ouro do Fórum', 'A moldura do retrato vira ouro.', '🖼️'],
    ['Luz da sabedoria', 'Uma luz quente de lamparina brilha em volta dele.', '🕯️'],
    ['Louros do Filósofo', 'Coroa de louros dourada e estandarte imperial no Mapa de troféus.', '🌿'],
  ]),
  chatgpt: trilha([
    ['Moldura de corda', 'O retrato ganha uma moldura de corda de navio.', '🪢'],
    ['Título do Capitão', 'O seu título aparece no VS do Duelo e na faixa do Tribunal.', '🏷️'],
    ['Grito de vitória', 'Quando vence, Octavius grita uma ordem de comandante.', '💬'],
    ['Uniforme da frota', 'A armadura ganha a cor verde de Octavius.', '🧥'],
    ['Engrenagens', 'Engrenagens de máquina giram em volta dele.', '⚙️'],
    ['Moldura de prata do porto', 'A moldura do retrato vira prata.', '⬜'],
    ['Saudação do capitão', 'Na vitória, ele pula de alegria e bate continência.', '🫡'],
    ['Entrada com tambores', 'Entra no Coliseu ao som de tambores de guerra.', '🥁'],
    ['Armadura de almirante', 'Armadura azul-marinho com detalhes de ouro.', '⚓'],
    ['Moldura de ouro naval', 'A moldura do retrato vira ouro.', '🖼️'],
    ['Tempestade do mar', 'Ondas e relâmpagos azuis em volta dele.', '🌊'],
    ['Louros do Almirante', 'Coroa de louros dourada e estandarte imperial no Mapa de troféus.', '🌿'],
  ]),
  gemini: trilha([
    ['Moldura celeste', 'O retrato ganha uma moldura de bronze com estrelas.', '✴️'],
    ['Título do Vidente', 'O seu título aparece no VS do Duelo e na faixa do Tribunal.', '🏷️'],
    ['Profecia de vitória', 'Quando vence, Helios conta o que já tinha previsto.', '💬'],
    ['Manto do céu', 'A armadura ganha a cor azul de Helios.', '🧥'],
    ['Poeira de estrelas', 'Estrelinhas douradas giram em volta dele.', '✨'],
    ['Moldura de prata lunar', 'A moldura do retrato vira prata da lua.', '🌙'],
    ['Dança das estrelas', 'Na vitória, ele pula de alegria entre as estrelas.', '💫'],
    ['Raio de luz', 'Entra no Coliseu com um raio de luz caindo do céu.', '⚡'],
    ['Armadura de ouro solar', 'Armadura brilhante como o sol.', '☀️'],
    ['Moldura de ouro solar', 'A moldura do retrato vira ouro.', '🖼️'],
    ['Raios de sol', 'Raios de sol dourados brilham em volta dele.', '🌞'],
    ['Louros de Apolo', 'Coroa de louros dourada e estandarte imperial no Mapa de troféus.', '🌿'],
  ]),
};

export function recompensasDe(ia: IaId): Recompensa[] {
  return RECOMPENSAS_POR_IA[ia];
}

export interface Visual {
  moldura: 'nenhuma' | 'bronze' | 'prata' | 'ouro';
  armadura: 'padrao' | 'cor' | 'ouro';
  aura: 'nenhuma' | 'faiscas' | 'raios';
  titulo: boolean;
  fala: boolean;
  pose: boolean;
  entrada: boolean;
  coroa: boolean;
}

/**
 * O visual do gladiador num nível: sempre a melhor recompensa já liberada de cada tipo.
 * Os níveis são iguais para todos; o desenho de cada um (aura, armadura, entrada)
 * muda pela IA na hora de desenhar.
 */
export function visualDoNivel(nivel: number): Visual {
  const tem = (n: number) => nivel >= n;
  return {
    moldura: tem(50) ? 'ouro' : tem(20) ? 'prata' : tem(2) ? 'bronze' : 'nenhuma',
    armadura: tem(50) ? 'ouro' : tem(10) ? 'cor' : 'padrao',
    aura: tem(75) ? 'raios' : tem(15) ? 'faiscas' : 'nenhuma',
    titulo: tem(5),
    fala: tem(5),
    pose: tem(20),
    entrada: tem(30),
    coroa: tem(100),
  };
}

/** Recompensas liberadas ao passar de um nível para outro (para o aviso de nível novo). */
export function recompensasNovas(antes: number, depois: number, ia: IaId): Recompensa[] {
  return recompensasDe(ia).filter((r) => r.nivel > antes && r.nivel <= depois);
}

export const FALAS_VITORIA: Record<IaId, string> = {
  claude: 'O meio-termo venceu de novo. Ave!',
  chatgpt: 'Plano A, plano B, plano C... e vitória!',
  gemini: 'Eu já tinha visto esse final nas estrelas.',
};
