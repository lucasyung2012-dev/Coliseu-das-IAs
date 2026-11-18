#!/usr/bin/perl
# Gera o logo do Coliseu das IAs em pixel art (grade 32x32) e os ícones do app:
#   public/logo.svg        (ícone da aba e logo dentro do jogo)
#   public/icone-180.png   (tela inicial do iPhone/iPad)
#   public/icone-192.png, public/icone-512.png (Android / instalar o app)
# Rodar na raiz do projeto:  perl scripts/gerar-icones.pl
# Desenho: o Coliseu (com o lado direito em ruína) na frente de um sol neon
# de fliperama, chão neon e uma bandeira vermelha no topo.
use strict;
use warnings;
use Compress::Zlib;

my $N = 32;
my @g;    # $g[$y][$x] = '#rrggbb'

sub pinta { my ($x, $y, $c) = @_; $g[$y][$x] = $c if $x >= 0 && $x < $N && $y >= 0 && $y < $N }

# Fundo: noite roxa, mais escura embaixo
my @fundo = ('#2a1240', '#241038', '#1f0e31', '#1a0c2a', '#150a23', '#11081c', '#0e0717', '#0c0613');
for my $y (0 .. $N - 1) { pinta($_, $y, $fundo[int($y / 4)]) for 0 .. $N - 1 }

# Estrelinhas
pinta(@$_, '#9a88c8') for ([2, 2], [28, 3], [5, 7], [27, 9], [1, 12], [30, 14], [9, 1], [23, 1]);

# Sol neon grande, com listras na metade de baixo
my ($cx, $cy, $r) = (15.5, 13, 11.5);
for my $y (0 .. 26) {
  for my $x (0 .. $N - 1) {
    next if sqrt(($x - $cx)**2 + ($y - $cy)**2) > $r;
    next if $y >= 10 && $y % 3 == 0;
    my $c = $y < 5 ? '#fff07a' : $y < 8 ? '#ffd04a' : $y < 11 ? '#ffa94a' : $y < 14 ? '#ff7f5a' : $y < 18 ? '#ff5a82' : '#e0449a';
    pinta($x, $y, $c);
  }
}

# Chão neon com linhas em perspectiva
pinta($_, 27, '#3fe0d0') for 0 .. $N - 1;
for my $y (28 .. $N - 1) { pinta($_, $y, '#1a0d2a') for 0 .. $N - 1 }
for my $x (1, 6, 11, 16, 21, 26, 30) {
  for my $y (28 .. $N - 1) { pinta($x + int(($x - 15.5) * ($y - 27) / 6 + ($x > 15.5 ? 0.5 : -0.5)), $y, '#2c6f80') }
}

# O Coliseu: altura de cada coluna (o lado direito desce em degraus, em ruína)
my %topo;
$topo{$_} = 13 for 3 .. 20;
@topo{21, 22} = (15, 15);
@topo{23, 24} = (17, 17);
@topo{25, 26} = (19, 19);
@topo{27, 28} = (22, 22);
sub pedra { my $d = abs($_[0] - 14); $d > 10 ? '#9c6a36' : $d > 7 ? '#c08a4c' : $d > 3 ? '#d8a462' : '#e6b672' }
for my $x (3 .. 28) {
  for my $y ($topo{$x} .. 26) {
    my $c = pedra($x);
    $c = '#f2c14e' if $y == 13 || $y == 17 || $y == 22;    # cornija e faixas douradas
    $c = '#7c522c' if $y == $topo{$x} && $topo{$x} > 13;     # pedra quebrada da ruína
    pinta($x, $y, $c);
  }
  pinta($x, $topo{$x} - 1, '#0b0710');                       # contorno em cima
}
for my $y (13 .. 26) { pinta(2, $y, '#0b0710') }
for my $x (21 .. 28) { pinta($x, $_, "#0b0710") for $topo{$x - 1} - 1 .. $topo{$x} - 1 }
pinta(29, $_, '#0b0710') for 21 .. 26;

# Janelinhas do sótão e os arcos dos dois andares (alguns acesos, com luz lá dentro)
for (my $x = 5; $x <= 18; $x += 4) { pinta($x, 15, '#2a1430'); pinta($x + 1, 15, '#2a1430') }
my %aceso = map { $_ => 1 } ('9,1', '21,1', '5,2', '17,2', '25,2');
my $andar = 0;
for my $faixa ([18, 21], [23, 26]) {
  $andar++;
  for (my $x = 5; $x <= 26; $x += 4) {
    my $c = $aceso{"$x,$andar"} ? '#ffb347' : '#2a1430';
    for my $y ($faixa->[0] .. $faixa->[1]) {
      next if $y <= $topo{$x} || $y <= $topo{$x + 1};
      # topo arredondado do arco: a 1ª linha do vão fica só no meio
      pinta($x, $y, $c);
      pinta($x + 1, $y, $c);
    }
    pinta($x, $faixa->[0], pedra($x)) if $faixa->[0] > $topo{$x};
    pinta($x + 1, $faixa->[0], pedra($x + 1)) if $faixa->[0] > $topo{$x + 1};
  }
}

# Bandeira vermelha no topo
pinta(11, $_, '#efe6d2') for 6 .. 11;
pinta(@$_, '#ff4a5a') for [12, 6], [13, 6], [14, 6], [12, 7], [13, 7];
pinta(12, 8, '#d6303f');

my $pub = 'public';
mkdir $pub unless -d $pub;

# PNG feito à mão (sem bibliotecas de imagem): pixels nítidos, sem borrar.
sub bloco { my ($tipo, $dados) = @_; pack('N', length $dados) . $tipo . $dados . pack('N', crc32($tipo . $dados)) }
for my $t (180, 192, 512) {
  my $raw = '';
  for my $py (0 .. $t - 1) {
    my $y = int($py * $N / $t);
    $raw .= "\0";
    for my $px (0 .. $t - 1) {
      my $c = $g[$y][int($px * $N / $t)];
      $raw .= pack('C3', map { hex } $c =~ /#(..)(..)(..)/);
    }
  }
  open my $f, '>:raw', "$pub/icone-$t.png" or die $!;
  print $f "\x89PNG\r\n\x1a\n", bloco('IHDR', pack('NNCCCCC', $t, $t, 8, 2, 0, 0, 0)), bloco('IDAT', compress($raw, 9)), bloco('IEND', '');
  close $f;
}

# SVG: um retângulo por trecho de pixels iguais na mesma linha
my $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">';
for my $y (0 .. $N - 1) {
  my $x = 0;
  while ($x < $N) {
    my $c = $g[$y][$x];
    my $w = 1;
    $w++ while $x + $w < $N && $g[$y][$x + $w] eq $c;
    $svg .= qq(<rect x="$x" y="$y" width="$w" height="1" fill="$c"/>);
    $x += $w;
  }
}
open my $s, '>', "$pub/logo.svg" or die $!;
print $s "$svg</svg>\n";
close $s;
print "Ícones gerados em public/\n";
