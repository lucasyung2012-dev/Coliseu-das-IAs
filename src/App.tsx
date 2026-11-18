import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './features/home/Home';
import EmConstrucao from './features/home/EmConstrucao';
import ArcadeHub from './features/arcade/ArcadeHub';
import EntradaCombate from './features/arcade/EntradaCombate';
import BotaoSom from './ui/BotaoSom';
import Configuracoes from './features/config/Configuracoes';
import PerfilCombatente from './features/arcade/PerfilCombatente';
import MapaTrofeus from './features/arcade/MapaTrofeus';
import SalaDoDuelo from './features/arcade/duelo/MeuBaralho';
import DoisJogadores from './features/arcade/duelo/DoisJogadores';
import { registrarAbandono } from './game/progresso';
import AberturaApp, { precisaAbertura } from './features/abertura/AberturaApp';

export default function App() {
  const [abertura, setAbertura] = useState(precisaAbertura);
  // Fechou o app ou recarregou no meio de uma partida? Ela vale como derrota.
  useEffect(() => {
    registrarAbandono();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arena" element={<ArcadeHub />} />
        {/* Duelo: primeiro a sala (baralho, Jogar, 2 jogadores); depois a partida. */}
        <Route path="/arena/duelo" element={<SalaDoDuelo />} />
        <Route path="/arena/duelo/jogar" element={<EntradaCombate modo="duelo" />} />
        <Route path="/arena/duelo/2j" element={<DoisJogadores />} />
        <Route path="/arena/tribunal" element={<EntradaCombate modo="tribunal" />} />
        <Route path="/arena/baralho" element={<Navigate to="/arena/duelo" replace />} />
        <Route path="/arena/mapa/:ia" element={<MapaTrofeus />} />
        <Route path="/arena/perfil/:ia" element={<PerfilCombatente />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/ludus" element={<EmConstrucao area="ludus" titulo="Ludus" etapa="Etapa 3" />} />
        <Route path="/coliseu" element={<EmConstrucao area="coliseu" titulo="Coliseu" etapa="Etapa 5" />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <BotaoSom />
      {abertura && <AberturaApp onFim={() => setAbertura(false)} />}
    </>
  );
}
