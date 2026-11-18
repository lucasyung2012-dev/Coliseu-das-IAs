/**
 * Chave do app no Dropbox ("App key"). Não é segredo: o login usa PKCE, que não
 * tem chave secreta. Fica vazia até o app ser registrado no Dropbox
 * (passo a passo em docs/DROPBOX.md). Enquanto estiver vazia, não existe conta e
 * o jogo continua valendo troféus neste aparelho, como antes.
 */
export const DROPBOX_APP_KEY = '0vnz534ifxzbv7b';
