export type JuradoId =
  | 'logico'
  | 'cetico'
  | 'empatico'
  | 'tradicionalista'
  | 'estrategista'
  | 'cientista'
  | 'comerciante'
  | 'artista';

export interface Jurado {
  id: JuradoId;
  nome: string;
  sensibilidade: string;
  /** Quanto custa mudar a opinião dele: 1 = fácil, 3 = difícil. */
  resistencia: number;
  toga: string;
  cabelo: string;
  /** Cor do acessório (óculos, louros, chapéu...) e do objeto que ele segura. */
  corAcessorio: string;
  corObjeto: string;
  /** Uma frase de personalidade, mostrada na ficha do jurado. */
  jeito: string;
}

// Os 5 primeiros vêm do app do Lovable; os 3 últimos são novos (jurados que mudam, decisão D9).
export const JURADOS: Record<JuradoId, Jurado> = {
  logico: { id: 'logico', nome: 'Lógico', sensibilidade: 'Consistência e premissas', resistencia: 2, toga: '#3d6fd8', cabelo: '#2a1a12', corAcessorio: '#9fe8ff', corObjeto: '#3a5fb0', jeito: 'Quer ver cada passo do raciocínio, sem pular nenhum.' },
  cetico: { id: 'cetico', nome: 'Cético', sensibilidade: 'Evidência e limites', resistencia: 3, toga: '#7d8296', cabelo: '#e6e6ea', corAcessorio: '#000000', corObjeto: '#000000', jeito: 'Desconfia de tudo que vem sem prova. Difícil de convencer.' },
  empatico: { id: 'empatico', nome: 'Empático', sensibilidade: 'Consequências humanas', resistencia: 1, toga: '#e0587e', cabelo: '#6b3a1e', corAcessorio: '#000000', corObjeto: '#e83a5a', jeito: 'Pensa primeiro nas pessoas que serão afetadas.' },
  tradicionalista: { id: 'tradicionalista', nome: 'Tradicionalista', sensibilidade: 'Continuidade e princípios', resistencia: 2, toga: '#7a4bc4', cabelo: '#d8d8d8', corAcessorio: '#f2c14e', corObjeto: '#000000', jeito: 'Gosta do que já funcionou e de regras claras.' },
  estrategista: { id: 'estrategista', nome: 'Estrategista', sensibilidade: 'Viabilidade e riscos', resistencia: 2, toga: '#1f9e8f', cabelo: '#141018', corAcessorio: '#c0283c', corObjeto: '#e8d6a8', jeito: 'Pergunta sempre: dá para fazer? E o que pode dar errado?' },
  cientista: { id: 'cientista', nome: 'Cientista', sensibilidade: 'Experimentos e dados novos', resistencia: 2, toga: '#e8ecf4', cabelo: '#b0582a', corAcessorio: '#5ce0ff', corObjeto: '#5ee07a', jeito: 'Adora um teste, um experimento, um dado novo.' },
  comerciante: { id: 'comerciante', nome: 'Comerciante', sensibilidade: 'Custos e benefícios', resistencia: 2, toga: '#d9902a', cabelo: '#3a2414', corAcessorio: '#5a3a1e', corObjeto: '#8a5a2e', jeito: 'Faz a conta: quanto custa e quanto rende.' },
  artista: { id: 'artista', nome: 'Artista', sensibilidade: 'Criatividade e boas imagens', resistencia: 1, toga: '#c23cc8', cabelo: '#141018', corAcessorio: '#e83a4a', corObjeto: '#f2c14e', jeito: 'Se encanta com uma boa imagem ou história.' },
};

export const TODOS_JURADOS = Object.keys(JURADOS) as JuradoId[];

/** Sorteia jurados diferentes entre si (embaralhamento de Fisher-Yates). */
export function sortearJurados(quantidade = 5, aleatorio: () => number = Math.random): JuradoId[] {
  const lista = [...TODOS_JURADOS];
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [lista[i], lista[j]] = [lista[j]!, lista[i]!];
  }
  return lista.slice(0, quantidade);
}
