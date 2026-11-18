# Dropbox: registrar o app do Coliseu das IAs

**Atualizado: 2026-11-18.** Feito uma vez, pelo Lucas ou pelo pai, numa conta Dropbox. Leva uns 5 minutos.
É o mesmo esquema do ROUTIG (veja `docs/DROPBOX.md` do ROUTIG): login sem servidor, grátis, e no iPad
o jogo continua conectado sem pedir login de novo.

O jogo só enxerga a pasta **Aplicativos/Coliseu…** do Dropbox (acesso "App folder"). Nenhum outro arquivo é lido.
Lá dentro fica só um arquivo: `progresso.json` (troféus, Maestria e histórico).

## Passo a passo

1. Abra https://www.dropbox.com/developers/apps e entre na conta (dá para usar "Continuar com o Google").
2. **Create app**:
   - **Choose an API:** Scoped access.
   - **Choose the type of access:** **App folder**.
   - **Name your app:** um nome único no Dropbox inteiro, por exemplo `Coliseu-das-IAs-` seguido de umas letras.
   - **Create app**.
3. Aba **Permissions**: marque `files.content.read` e `files.content.write` (o `account_info.read` já vem marcado).
   Clique em **Submit** no fim da página. Faça isto **antes** de entrar pelo jogo.
4. Aba **Settings**:
   - **OAuth 2 → Redirect URIs:** adicione `https://lucasyung2012-dev.github.io/Coliseu-das-IAs/` e clique em **Add**.
   - **Allow public clients (Implicit Grant & PKCE):** deixe em **Allow**.
   - Copie o **App key** (letras e números). O **App secret** não é usado: não copie nem mande para ninguém.
5. Mande o **App key** para o Claude. Ele coloca a chave em `src/config.ts` (ela não é segredo) e publica.

O app fica em "Development" no Dropbox, o que basta para a família (até 500 contas).

## Como fica no jogo

- **Sem conta:** Modo Treino. A pessoa escolhe a dificuldade (Fácil, Médio, Difícil) e as partidas não valem troféus nem XP.
- **Com conta (Arcade → ☁ CONECTAR):** as partidas valem troféus e XP, e o progresso vai para a nuvem
  poucos segundos depois de cada partida, ao abrir o jogo e ao voltar para ele.
- **Primeira vez num aparelho:** o progresso do aparelho e o da nuvem são somados pelo melhor de cada um
  (maior troféu e XP de cada IA, histórico unido). Depois disso, vale a cópia alterada por último.
- **Se o login não voltar sozinho** (pode acontecer no app instalado no iPad): use **Entrar com código**.
  O Dropbox abre em outra aba e mostra um código; copie, volte ao jogo, cole e toque em **Confirmar**.
- **Desconectar** deixa o progresso no aparelho e na nuvem; as próximas partidas naquele aparelho viram treino.
- **Apagar progresso** com a conta conectada apaga também a cópia da nuvem.
