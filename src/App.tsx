import { Route, Routes } from 'react-router-dom';
import Home from './features/home/Home';
import EmConstrucao from './features/home/EmConstrucao';
import ArcadeHub from './features/arcade/ArcadeHub';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/arena" element={<ArcadeHub />} />
      <Route path="/arena/duelo" element={<EmConstrucao area="arcade" titulo="Duelo" etapa="Etapa 1c" voltar="/arena" />} />
      <Route path="/arena/tribunal" element={<EmConstrucao area="arcade" titulo="Tribunal" etapa="Etapa 1b" voltar="/arena" />} />
      <Route path="/ludus" element={<EmConstrucao area="ludus" titulo="Ludus" etapa="Etapa 3" />} />
      <Route path="/coliseu" element={<EmConstrucao area="coliseu" titulo="Coliseu" etapa="Etapa 5" />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
