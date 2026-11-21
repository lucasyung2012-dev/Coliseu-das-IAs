import { useEffect, useState } from 'react';
import type { EventoLuta, Tecnica } from '@/game/historia/luta';
import type { ConversaLudus, Falante, Lugar } from '@/game/historia/roteiro';
import {
  aprender,
  atributosDoSave,
  FERREIRO,
  forjar,
  ganharEquipamento,
  treinar,
  treinoFeito,
  type Equipamento,
  type SaveHistoria,
  type Treino,
} from '@/game/historia/saves';
import { desbloquear } from '@/ui/som';
import { tocar } from '@/ui/somHistoria';
import { Falas, Palco } from './Cenas';
import { Retrato } from './Cenarios';
import { LutaHistoria } from './Luta';

/**
 * O Ludus, a base (docs/HISTORIA.md, seção 6): conversar com quem está no pátio,
 * treinar com o Brutus (golpes novos e atributos), forjar equipamento com as peças
 * das máquinas e, quando quiser, SEGUIR com o capítulo. Cada treino de atributo vale
 * uma vez por capítulo; os golpes ficam aprendidos para sempre no save.
 */
interface DefTreino {
  id: Treino | Tecnica;
  nome: string;
  icone: string;
  efeito: string;
  evento: EventoLuta['tipo'];
  quantos: number;
  rotulo: string;
  explica: string;
}

const TREINOS_GOLPE: Record<Tecnica, DefTreino> = {
  'contra-ataque': {
    id: 'contra-ataque',
    nome: 'CONTRA-ATAQUE',
    icone: '⚡',
    efeito: 'Golpe logo depois de bloquear: dano dobrado e ele fica tonto',
    evento: 'riposta',
    quantos: 3,
    rotulo: 'CONTRA-ATAQUES',
    explica: 'Segura o 🛡️ quando a espada vier e, assim que bloquear, ⚔️ na hora! Três vezes.',
  },
  'quebra-guarda': {
    id: 'quebra-guarda',
    nome: 'QUEBRA-GUARDA',
    icone: '💥',
    efeito: 'Três golpes seguidos na guarda quebram a defesa dele',
    evento: 'quebra',
    quantos: 2,
    rotulo: 'GUARDAS QUEBRADAS',
    explica: 'Enquanto eu estiver na guarda (sem sinal, sem ABERTO): ⚔️ ⚔️ ⚔️ rápido! Duas vezes.',
  },
  'espelho-de-sol': {
    id: 'espelho-de-sol',
    nome: 'ESPELHO DE SOL',
    icone: '☀️',
    efeito: 'Escudo levantado bem na hora do golpe reflete o ataque de volta (até o fogo)',
    evento: 'reflexo',
    quantos: 3,
    rotulo: 'REFLEXOS',
    explica: 'Vidente, você vê as coisas antes de acontecer, né? Então levanta o 🛡️ BEM na hora em que a minha espada chegar. Nem antes, nem depois. Três vezes.',
  },
  'esquiva-dupla': {
    id: 'esquiva-dupla',
    nome: 'ESQUIVA DUPLA',
    icone: '🌀',
    efeito: 'A esquiva recarrega na metade do tempo; golpe logo depois de esquivar entra dobrado',
    evento: 'riposta',
    quantos: 3,
    rotulo: 'ESQUIVA E GOLPE',
    explica: 'Tagarela, você é rápido de boca. Agora seja rápido de perna: 💨 esquiva do meu golpe e, na hora, ⚔️! Três vezes.',
  },
};

const TREINOS_ATRIBUTO: DefTreino[] = [
  { id: 'forca', nome: 'FORÇA', icone: '💪', efeito: '+1 Força (mais dano)', evento: 'acerto', quantos: 10, rotulo: 'GOLPES', explica: 'Acerta dez golpes em mim. Bate no ABERTO, que entra mais!' },
  { id: 'defesa', nome: 'DEFESA', icone: '🛡️', efeito: '+1 Defesa (apanha menos)', evento: 'bloqueio', quantos: 5, rotulo: 'BLOQUEIOS', explica: 'Bloqueia cinco golpes meus. Cuidado com as fintas!' },
  { id: 'vida', nome: 'RESISTÊNCIA', icone: '❤️', efeito: '+10 Vida', evento: 'esquiva', quantos: 5, rotulo: 'ESQUIVAS', explica: 'Esquiva cinco golpes meus. Pernas leves!' },
  { id: 'carisma', nome: 'CARISMA', icone: '📣', efeito: '+1 Carisma (Ânimo e plateia enchem mais rápido)', evento: 'especial', quantos: 1, rotulo: 'ESPECIAIS', explica: 'Enche o Ânimo com boas jogadas e solta o ⭐ especial em mim.' },
];

const NOME_HEROI: Partial<Record<Falante, string>> = { cassius: 'Lata', octavius: 'Tagarela', helios: 'Vidente' };

export function Ludus({
  save,
  heroi,
  lugar,
  objetivo,
  conversas,
  obrigatorio,
  presente,
  onGravar,
  onFim,
}: {
  save: SaveHistoria;
  heroi: Falante;
  lugar: Lugar;
  objetivo: string;
  conversas: ConversaLudus[];
  obrigatorio?: Tecnica;
  presente?: Equipamento;
  onGravar: (s: SaveHistoria) => void;
  onFim: () => void;
}) {
  const [falando, setFalando] = useState<ConversaLudus | null>(null);
  const [treinando, setTreinando] = useState<DefTreino | null>(null);
  const [painel, setPainel] = useState<'treinos' | 'ferreiro'>('treinos');
  const [vistos, setVistos] = useState<string[]>([]);
  const [ganhou, setGanhou] = useState<Equipamento | null>(null);

  // O presente (o elmo do Brutus): entra no save assim que chega no Ludus.
  useEffect(() => {
    if (presente && !(save.equipamento ?? []).includes(presente)) {
      onGravar(ganharEquipamento(save, presente));
      setGanhou(presente);
      tocar('fanfarra');
    }
  }, []);

  const at = atributosDoSave(save);
  const falta = obrigatorio && !(save.tecnicas ?? []).includes(obrigatorio);
  const golpes: DefTreino[] = (Object.keys(TREINOS_GOLPE) as Tecnica[])
    .filter((t) => t === obrigatorio || (save.tecnicas ?? []).includes(t))
    .map((t) => TREINOS_GOLPE[t]);

  if (treinando) {
    const tecnica = treinando.id in TREINOS_GOLPE ? (treinando.id as Tecnica) : undefined;
    // No treino de golpe, o golpe já vale (é assim que se aprende).
    const atributos = tecnica ? { ...at, tecnicas: [...(at.tecnicas ?? []), tecnica] } : at;
    return (
      <LutaHistoria
        lugar="ludus-patio"
        inimigo="boneco-de-treino"
        heroi={heroi}
        atributos={atributos}
        treino={{ evento: treinando.evento, quantos: treinando.quantos, rotulo: treinando.rotulo }}
        antes={[{ quem: 'brutus', texto: treinando.explica }]}
        depois={[{ quem: 'brutus', texto: tecnica ? `Isso! Esse é o ${treinando.nome}. Agora é seu, ${NOME_HEROI[heroi] ?? 'garoto'}.` : `Hunf. ${treinando.efeito}. Amanhã tem mais.` }]}
        onFim={() => {
          onGravar(tecnica ? aprender(save, tecnica) : treinar(save, treinando.id as Treino));
          setTreinando(null);
        }}
      />
    );
  }

  const posicoes = conversas.map((_, k) => 28 + (k * 60) / Math.max(1, conversas.length - 1 || 1));

  return (
    <div className="flex flex-col gap-2">
      <p className="font-pixel text-[9px] text-[#f2c14e] sm:text-[10px]">🏛️ LUDUS · {objetivo}</p>
      <Palco lugar={lugar}>
        <div className="absolute bottom-[12%] left-[12%] z-10 w-[11%] -translate-x-1/2" aria-hidden>
          <div className="respirar">
            <Retrato quem={heroi} />
          </div>
        </div>
        {conversas.map((c, k) => (
          <button
            key={c.quem + k}
            type="button"
            onClick={() => {
              desbloquear();
              tocar('clique');
              setFalando(c);
            }}
            className="absolute bottom-[12%] z-10 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `${posicoes[k]}%`, width: c.quem === 'brutus' ? '13%' : '10%' }}
            aria-label={`Falar com ${c.rotulo}`}
          >
            <span className="respirar block w-full" aria-hidden>
              <Retrato quem={c.quem} espelhar />
            </span>
            <span
              className={`mt-1 whitespace-nowrap border-2 bg-black/80 px-1.5 py-0.5 font-pixel text-[7px] sm:text-[9px] ${vistos.includes(c.quem + k) ? 'border-white/30 text-white/60' : 'piscar border-[#f2c14e] text-white'}`}
            >
              💬 {c.rotulo}
            </span>
          </button>
        ))}
        {falando && (
          <Falas
            falas={falando.falas}
            onFim={() => {
              const id = falando.quem + conversas.indexOf(falando);
              setVistos((v) => (v.includes(id) ? v : [...v, id]));
              setFalando(null);
            }}
          />
        )}
        {ganhou && !falando && (
          <button
            type="button"
            onClick={() => setGanhou(null)}
            className="absolute inset-x-6 top-[30%] z-20 border-2 border-[#f2c14e] bg-black/90 p-3 text-center"
          >
            <span className="block font-pixel text-[10px] text-[#f2c14e] sm:text-sm">🎁 VOCÊ GANHOU: {ganhou === 'elmo-brutus' ? 'O ELMO DAS 99 VITÓRIAS' : ganhou.toUpperCase()}</span>
            <span className="mt-1 block text-xs text-white/80">+20 Vida · +1 Defesa · toque para fechar</span>
          </button>
        )}
      </Palco>

      {/* Os atributos do gladiador */}
      <div className="pixel-box flex flex-wrap items-center justify-center gap-x-4 gap-y-1 p-2 font-pixel text-[8px] sm:text-[10px]">
        <span>❤️ VIDA {at.vida}</span>
        <span>💪 FORÇA {at.forca}</span>
        <span>🛡️ DEFESA {at.defesa}</span>
        <span>📣 CARISMA {at.carisma}</span>
        <span className="text-[#f2c14e]">⚙️ PEÇAS {save.pecas ?? 0}</span>
        {(save.tecnicas ?? []).length > 0 && <span className="text-accent">GOLPES: {(save.tecnicas ?? []).map((t) => TREINOS_GOLPE[t].nome).join(', ')}</span>}
      </div>

      <div className="flex gap-2">
        {(['treinos', 'ferreiro'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPainel(p)}
            className={`pixel-box flex-1 py-2 font-pixel text-[9px] sm:text-[10px] ${painel === p ? 'text-[#f2c14e]' : 'text-muted'}`}
            aria-pressed={painel === p}
          >
            {p === 'treinos' ? '🏋️ TREINAR COM O BRUTUS' : '⚒️ FERREIRO'}
          </button>
        ))}
      </div>

      {painel === 'treinos' && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {[...golpes, ...TREINOS_ATRIBUTO].map((t) => {
            const feito = treinoFeito(save, t.id);
            const ehGolpe = t.id in TREINOS_GOLPE;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  disabled={feito}
                  onClick={() => {
                    desbloquear();
                    tocar('start');
                    setTreinando(t);
                  }}
                  className={`pixel-box pixel-hover flex w-full items-center gap-2 p-2 text-left disabled:opacity-50`}
                  style={ehGolpe && !feito ? { boxShadow: '0 0 0 2px #f2c14e' } : undefined}
                >
                  <span className="text-2xl" aria-hidden>
                    {t.icone}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-pixel text-[9px] text-[#f2c14e]">
                      {ehGolpe ? 'GOLPE NOVO: ' : ''}
                      {t.nome}
                      {ehGolpe && t.id === obrigatorio && !feito && ' (OBRIGATÓRIO)'}
                    </span>
                    <span className="block text-xs text-muted">{t.efeito}</span>
                  </span>
                  <span className="font-pixel text-[8px]">{feito ? (ehGolpe ? '✔ APRENDIDO' : '✔ HOJE JÁ FOI') : '▶'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {painel === 'ferreiro' && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {FERREIRO.map((f) => {
            const tem = (save.equipamento ?? []).includes(f.id);
            const da = (save.pecas ?? 0) >= f.custo;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  disabled={tem || !da}
                  onClick={() => {
                    tocar('escudoMetal');
                    onGravar(forjar(save, f.id));
                  }}
                  className="pixel-box pixel-hover flex w-full items-center gap-2 p-2 text-left disabled:opacity-50"
                >
                  <span className="text-2xl" aria-hidden>
                    {f.icone}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-pixel text-[9px] text-[#f2c14e]">{f.nome}</span>
                    <span className="block text-xs text-muted">{f.efeito}</span>
                  </span>
                  <span className="font-pixel text-[8px]">{tem ? '✔ SEU' : `⚙️ ${f.custo}`}</span>
                </button>
              </li>
            );
          })}
          <li className="text-center text-xs text-muted sm:col-span-2">As máquinas que você derrota deixam peças (chefões deixam mais). O equipamento só vale no modo História.</li>
        </ul>
      )}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted">{falta ? `Antes de seguir, aprenda o ${TREINOS_GOLPE[obrigatorio!].nome} com o Brutus.` : 'Quando estiver pronto, siga em frente.'}</p>
        <button
          type="button"
          disabled={!!falta || !!falando}
          onClick={() => {
            tocar('selecionar');
            onFim();
          }}
          className="pixel-box pixel-hover px-4 py-2 font-pixel text-[10px] text-accent disabled:opacity-40"
        >
          SEGUIR ▶
        </button>
      </div>
    </div>
  );
}
