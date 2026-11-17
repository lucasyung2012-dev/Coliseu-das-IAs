import { Route, Routes } from 'react-router-dom';
import Home from './features/home/Home';
import EmConstrucao from './features/home/EmConstrucao';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/arena" element={<EmConstrucao area="arcade" titulo="Imperium Arcade" etapa="Etapa 1" />} />
      <Route path="/ludus" element={<EmConstrucao area="ludus" titulo="Ludus" etapa="Etapa 3" />} />
      <Route path="/coliseu" element={<EmConstrucao area="coliseu" titulo="Coliseu" etapa="Etapa 5" />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
