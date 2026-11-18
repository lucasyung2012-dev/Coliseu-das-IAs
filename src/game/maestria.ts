/**
 * Títulos de Maestria: cada IA ganha um título novo conforme sobe de nível.
 * O XP vem das partidas que valem (vitória +40, empate +20, derrota +20).
 */
export interface Titulo {
  nivel: number;
  nome: string;
  frase: string;
}

export const TITULOS: Titulo[] = [
  { nivel: 1, nome: 'Novato', frase: 'Acabou de entrar na escola de gladiadores.' },
  { nivel: 5, nome: 'Aprendiz do Ludus', frase: 'Já sabe segurar o escudo dos argumentos.' },
  { nivel: 10, nome: 'Legionário', frase: 'Marcha firme em qualquer debate.' },
  { nivel: 20, nome: 'Veterano', frase: 'Já viu de tudo na arena.' },
  { nivel: 30, nome: 'Campeão da Arena', frase: 'A plateia grita o nome dele.' },
  { nivel: 50, nome: 'Lenda do Coliseu', frase: 'Contam histórias das suas vitórias.' },
  { nivel: 75, nome: 'Herói de Roma', frase: 'Tem uma estátua no Fórum.' },
  { nivel: 100, nome: 'Imortal', frase: 'O Senado inteiro se levanta quando ele entra.' },
];

export function tituloDoNivel(nivel: number): Titulo {
  return [...TITULOS].reverse().find((t) => nivel >= t.nivel) ?? TITULOS[0]!;
}

export function proximoTitulo(nivel: number): Titulo | null {
  return TITULOS.find((t) => t.nivel > nivel) ?? null;
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

// Trilha aprovada pelo Lucas em 19/11/2026.
export const RECOMPENSAS: Recompensa[] = [
  { nivel: 2, tipo: 'moldura', nome: 'Moldura de bronze', descricao: 'O retrato do gladiador ganha uma moldura de bronze.', icone: '🟫' },
  { nivel: 5, tipo: 'titulo', nome: 'Título no combate', descricao: 'O seu título de Maestria aparece no VS do Duelo e na faixa do Tribunal.', icone: '🏷️' },
  { nivel: 5, tipo: 'fala', nome: 'Fala de vitória', descricao: 'Quando vence, o gladiador comemora com uma frase só dele.', icone: '💬' },
  { nivel: 10, tipo: 'armadura', nome: 'Armadura colorida', descricao: 'A armadura ganha a cor da sua IA.', icone: '🛡️' },
  { nivel: 15, tipo: 'aura', nome: 'Aura de faíscas', descricao: 'Faíscas douradas giram em volta do gladiador.', icone: '✨' },
  { nivel: 20, tipo: 'moldura', nome: 'Moldura de prata', descricao: 'A moldura do retrato vira prata.', icone: '⬜' },
  { nivel: 20, tipo: 'pose', nome: 'Pose de vitória', descricao: 'O gladiador pula de alegria na tela de vitória.', icone: '🙌' },
  { nivel: 30, tipo: 'entrada', nome: 'Entrada especial', descricao: 'Entra no Coliseu com um raio de luz e faíscas.', icone: '⚡' },
  { nivel: 50, tipo: 'armadura', nome: 'Armadura dourada', descricao: 'Armadura toda de ouro.', icone: '🟨' },
  { nivel: 50, tipo: 'moldura', nome: 'Moldura de ouro', descricao: 'A moldura do retrato vira ouro.', icone: '🖼️' },
  { nivel: 75, tipo: 'aura', nome: 'Aura de raios', descricao: 'Raios elétricos em volta do gladiador.', icone: '🌩️' },
  { nivel: 100, tipo: 'coroa', nome: 'Coroa de louros', descricao: 'Coroa de louros dourada e estandarte imperial no Mapa de troféus.', icone: '👑' },
];

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

/** O visual do gladiador num nível: sempre a melhor recompensa já liberada de cada tipo. */
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
export function recompensasNovas(antes: number, depois: number): Recompensa[] {
  return RECOMPENSAS.filter((r) => r.nivel > antes && r.nivel <= depois);
}

export const FALAS_VITORIA: Record<'claude' | 'chatgpt' | 'gemini', string> = {
  claude: 'O meio-termo venceu de novo. Ave!',
  chatgpt: 'Plano A, plano B, plano C... e vitória!',
  gemini: 'Eu já tinha visto esse final nas estrelas.',
};
