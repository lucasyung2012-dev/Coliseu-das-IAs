"""
Gera as falas do Pretor Supremo com vozes neurais do Piper (gratuito e aberto,
roda no próprio GitHub Actions, sem servidor e sem custo).

Saída: public/vozes/<voz>/<id>.mp3 e public/vozes/vozes.json (vozes que deram certo).
Os ids batem com os de src/ui/voz.ts (falasDoVeredito e afins).

Rodar (no CI):  python scripts/vozes/gerar.py
"""

import json
import os
import subprocess
import sys
import urllib.request
import wave

from piper import PiperVoice  # piper-tts==1.2.0

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODELOS = os.path.join(RAIZ, "scripts", "vozes", ".modelos")
SAIDA = os.path.join(RAIZ, "public", "vozes")
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR"

# As três vozes masculinas em português do Brasil do Piper.
VOZES = {
    "faber": f"{HF}/faber/medium/pt_BR-faber-medium.onnx",
    "cadu": f"{HF}/cadu/medium/pt_BR-cadu-medium.onnx",
    "jeff": f"{HF}/jeff/medium/pt_BR-jeff-medium.onnx",
}

# Nomes escritos do jeito que se fala, para a voz pronunciar certo.
IAS = {"claude": "Clôd", "chatgpt": "Chat gê pê tê", "gemini": "Jêmini"}
JURADOS = {
    "logico": "Lógico",
    "cetico": "Cético",
    "empatico": "Empático",
    "tradicionalista": "Tradicionalista",
    "estrategista": "Estrategista",
    "cientista": "Cientista",
    "comerciante": "Comerciante",
    "artista": "Artista",
}
NUMEROS = ["zero", "um", "dois", "três", "quatro", "cinco"]


def falas():
    f = {
        "amostra": "Eu sou o Pretor Supremo. Que vença o melhor argumento!",
        "abertura": "A sessão está aberta!",
        "silencio": "Silêncio no tribunal! O júri vai votar.",
        "declara-empate": "o tribunal declara: empate!",
    }
    for j, nome in JURADOS.items():
        for ia, falado in IAS.items():
            f[f"voto-{j}-{ia}"] = f"O {nome} vota em {falado}."
        f[f"voto-{j}-ninguem"] = f"O {nome} não escolhe ninguém."
    for ia, falado in IAS.items():
        f[f"declara-{ia}"] = f"o tribunal declara a vitória de {falado}!"
    for a in range(6):
        for b in range(a + 1):
            if a + b <= 5:
                f[f"placar-{a}-{b}"] = f"Por {NUMEROS[a]} {'voto' if a == 1 else 'votos'} a {NUMEROS[b]},"
    return f


def baixar(url, destino):
    if not os.path.exists(destino):
        print("baixando", url)
        urllib.request.urlretrieve(url, destino)


def main():
    os.makedirs(MODELOS, exist_ok=True)
    os.makedirs(SAIDA, exist_ok=True)
    lista = falas()
    prontas = []
    for voz, url in VOZES.items():
        modelo = os.path.join(MODELOS, os.path.basename(url))
        try:
            baixar(url, modelo)
            baixar(url + ".json", modelo + ".json")
            piper = PiperVoice.load(modelo, config_path=modelo + ".json")
        except Exception as erro:  # uma voz que falhar não derruba as outras
            print(f"voz {voz} indisponível: {erro}", file=sys.stderr)
            continue
        pasta = os.path.join(SAIDA, voz)
        os.makedirs(pasta, exist_ok=True)
        for id_, texto in lista.items():
            wav = os.path.join(pasta, id_ + ".wav")
            with wave.open(wav, "wb") as arquivo:
                # length_scale > 1: fala mais devagar, com peso de juiz.
                piper.synthesize(texto, arquivo, length_scale=1.12, sentence_silence=0.1)
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-ac", "1", "-b:a", "48k", os.path.join(pasta, id_ + ".mp3")],
                check=True,
            )
            os.remove(wav)
        prontas.append(voz)
        print(f"voz {voz}: {len(lista)} falas")
    with open(os.path.join(SAIDA, "vozes.json"), "w", encoding="utf-8") as arq:
        json.dump(prontas, arq)
    if not prontas:
        sys.exit("nenhuma voz foi gerada")


if __name__ == "__main__":
    main()
