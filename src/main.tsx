import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { iniciarConta } from './game/conta';
import './styles/index.css';
import './styles/arcade.css';

// Antes do roteador: a volta do login do Dropbox chega no endereço e precisa ser lida primeiro.
iniciarConta();

// HashRouter: o GitHub Pages não sabe responder a /arena, então as rotas ficam depois do #.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
