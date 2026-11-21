import { useEffect, useMemo, useState } from 'react';
import Icone from '@/ui/pixel/Icones';
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
import { MundoAberto } from './MundoAberto';
import { mundoDoLudus } from '@/game/historia/mundos';
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
    icone: 'raio',
    efeito: 'Golpe logo depois de bloquear: dano dobrado e ele fica tonto',
    evento: 'riposta',
    quantos: 3,
    rotulo: 'CONTRA-ATAQUES',
    explica: 'Segura o ESCUDO quando a espada vier e, assim que bloquear, GOLPE na hora! Três vezes.',
  },
  'quebra-guarda': {
    id: 'quebra-guarda',
    nome: 'QUEBRA-GUARDA',
    icone: 'explosao',
    efeito: 'Três golpes seguidos na guarda quebram a defesa dele',
    evento: 'quebra',
    quantos: 2,
    rotulo: 'GUARDAS QUEBRADAS',
    explica: 'Enquanto eu estiver na guarda (sem sinal, sem ABERTO): GOLPE, GOLPE, GOLPE, rápido! Duas vezes.',
  },
  'espelho-de-sol': {
    id: 'espelho-de-sol',
    nome: 'ESPELHO DE SOL',
    icone: 'sol',
    efeito: 'Escudo levantado bem na hora do golpe reflete o ataque de volta (até o fogo)',
    evento: 'reflexo',
    quantos: 3,
    rotulo: 'REFLEXOS',
    explica: 'Vidente, você vê as coisas antes de acontecer, né? Então levanta o ESCUDO BEM na hora em que a minha espada chegar. Nem antes, nem depois. Três vezes.',
  },
  'esquiva-dupla': {
    id: 'esquiva-dupla',
    nome: 'ESQUIVA DUPLA',
    icone: 'rolar',
    efeito: 'A esquiva recarrega na metade do tempo; golpe logo depois de esquivar entra dobrado',
    evento: 'riposta',
    quantos: 3,
    rotulo: 'ESQUIVA E GOLPE',
    explica: 'Tagarela, você é rápido de boca. Agora seja rápido de perna: ESQUIVA do meu golpe e, na hora, GOLPE! Três vezes.',
  },
};

const TREINOS_ATRIBUTO: DefTreino[] = [
  { id: 'forca', nome: 'FORÇA', icone: 'gladio', efeito: '+1 Força (mais dano)', evento: 'acerto', quantos: 10, rotulo: 'GOLPES', explica: 'Acerta dez golpes em mim. Bate no ABERTO, que entra mais!' },
  { id: 'defesa', nome: 'DEFESA', icone: 'escudo', efeito: '+1 Defesa (apanha menos)', evento: 'bloqueio', quantos: 5, rotulo: 'BLOQUEIOS', explica: 'Bloqueia cinco golpes meus. Cuidado com as fintas!' },
  { id: 'vida', nome: 'RESISTÊNCIA', icone: 'coracao', efeito: '+10 Vida', evento: 'esquiva', quantos: 5, rotulo: 'ESQUIVAS', explica: 'Esquiva cinco golpes meus. Pernas leves!' },
  { id: 'carisma', nome: 'CARISMA', icone: 'estrela', efeito: '+1 Carisma (Ânimo e plateia enchem mais rápido)', evento: 'especial', quantos: 1, rotulo: 'ESPECIAIS', explica: 'Enche o Ânimo com boas jogadas e solta o SEU especial em mim: a Muralha do Lata de Biblioteca, a Rede do Tagarela ou o Eclipse do Vidente.' },
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
  const [treinando, setTreinando] = useState<DefTreino | null>(null);
  const [painel, setPainel] = useState<'treinos' | 'ferreiro'>('treinos');
  const [ganhou, setGanhou] = useState<Equipamento | null>(null);
  // O pátio visto de cima (22/11/2026): anda livre, fala com quem está lá, examina o boneco
  // (abre os treinos) e a forja (abre o ferreiro).
  const patio = useMemo(() => mundoDoLudus(conversas, lugar, objetivo), [conversas, lugar, objetivo]);
  const abrirPainel = (p: 'treinos' | 'ferreiro') => {
    desbloquear();
    tocar('selecionar');
    setPainel(p);
    window.setTimeout(() => document.getElementById('paineis-ludus')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

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

  return (
    <div className="flex flex-col gap-2">
      {/* O presente (o elmo do Brutus) aparece por cima de tudo até tocar */}
      {ganhou && (
        <button type="button" onClick={() => setGanhou(null)} className="border-2 border-[#f2c14e] bg-black/90 p-3 text-center">
          <span className="block font-pixel text-[10px] text-[#f2c14e] sm:text-sm">VOCÊ GANHOU: {ganhou === 'elmo-brutus' ? 'O ELMO DAS 99 VITÓRIAS' : ganhou.toUpperCase()}</span>
          <span className="mt-1 block text-xs text-white/80">+20 Vida · +1 Defesa · toque para fechar</span>
        </button>
      )}
      <MundoAberto
        mundo={patio}
        heroi={heroi}
        onFim={() => undefined}
        onCoisa={(id) => {
          if (id === 'boneco') abrirPainel('treinos');
          else if (id === 'forja') abrirPainel('ferreiro');
          else return false;
          return true;
        }}
      />
      <p className="text-center text-xs text-muted">Examine o BONECO para treinar com o Brutus e a FORJA para falar com o ferreiro. Quando estiver pronto, siga lá embaixo.</p>

      {/* Os atributos do gladiador */}
      <div id="paineis-ludus" className="pixel-box flex flex-wrap items-center justify-center gap-x-4 gap-y-1 p-2 font-pixel text-[8px] sm:text-[10px]">
        <span>VIDA {at.vida}</span>
        <span>FORÇA {at.forca}</span>
        <span>DEFESA {at.defesa}</span>
        <span>CARISMA {at.carisma}</span>
        <span className="text-[#f2c14e]">PEÇAS {save.pecas ?? 0}</span>
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
            {p === 'treinos' ? 'TREINAR COM O BRUTUS' : 'FERREIRO'}
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
                    <Icone nome={t.icone} className="inline-block w-[1.4em]" />
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
                    <Icone nome={f.icone} className="inline-block w-[1.4em]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-pixel text-[9px] text-[#f2c14e]">{f.nome}</span>
                    <span className="block text-xs text-muted">{f.efeito}</span>
                  </span>
                  <span className="font-pixel text-[8px]">{tem ? '✔ SEU' : `${f.custo}`}</span>
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
          disabled={!!falta}
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
