import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { iniciarConta } from './game/conta';
import './styles/index.css';
import './styles/arcade.css';

// Antes do roteador: a volta do login do Dropbox chega no endereço e precisa ser lida primeiro.
iniciarConta();

// Funcionar sem internet: depois da primeira visita, o jogo fica guardado no aparelho (public/sw.js).
// Só no site publicado: no desenvolvimento e nos testes, o service worker atrapalharia.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      /* sem service worker: o jogo funciona, só não fica guardado */
    });
  });
}

// HashRouter: o GitHub Pages não sabe responder a /arena, então as rotas ficam depois do #.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
