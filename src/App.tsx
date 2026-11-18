import { Route, Routes } from 'react-router-dom';
import Home from './features/home/Home';
import EmConstrucao from './features/home/EmConstrucao';
import ArcadeHub from './features/arcade/ArcadeHub';
import EntradaCombate from './features/arcade/EntradaCombate';
import BotaoSom from './ui/BotaoSom';
import Configuracoes from './features/config/Configuracoes';
import PerfilCombatente from './features/arcade/PerfilCombatente';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arena" element={<ArcadeHub />} />
        <Route path="/arena/duelo" element={<EntradaCombate modo="duelo" />} />
        <Route path="/arena/tribunal" element={<EntradaCombate modo="tribunal" />} />
        <Route path="/arena/perfil/:ia" element={<PerfilCombatente />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/ludus" element={<EmConstrucao area="ludus" titulo="Ludus" etapa="Etapa 3" />} />
        <Route path="/coliseu" element={<EmConstrucao area="coliseu" titulo="Coliseu" etapa="Etapa 5" />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <BotaoSom />
    </>
  );
}
