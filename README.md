# Vila do Retorno

Protótipo 2D lateral para navegador móvel. Toque em qualquer ponto da cena para caminhar até a posição horizontal escolhida. Toque duas vezes perto do mesmo ponto para correr. Para voltar, toque à esquerda do personagem. A câmera acompanha o percurso. A orientação horizontal mostra uma área maior da rua.

## Abrir no iPhone pelo GitHub Pages

1. Salve o ZIP no app Arquivos e toque nele para descompactar.
2. Coloque o conteúdo da pasta vila em um repositório do GitHub. O arquivo index.html deve ficar na raiz, ao lado das pastas assets, codigo e dados. Se o seletor de arquivos do Safari não permitir enviar pastas inteiras, importe o repositório em um cliente Git para iOS, copie os arquivos descompactados para a cópia local, faça commit e envie as alterações.
3. No GitHub, abra Settings → Pages. Em Build and deployment, escolha Deploy from a branch, selecione a branch que recebeu os arquivos e a pasta /(root). Salve e abra o endereço indicado pelo GitHub após a publicação.

O projeto é estático e usa caminhos relativos. Para testar em um computador, execute python3 -m http.server dentro da pasta vila e abra http://localhost:8000. O jogo carrega imagens e JSON por HTTP.

## Editar

- assets/fachadas contém seis pastas, cada uma com a estrutura e detalhes sobrepostos em PNG. As coordenadas desses detalhes em dados/fachadas.json são medidas em pixels da imagem original, a partir do canto superior esquerdo.
- assets/objetos contém o carro com capô aberto, árvore, poste, fiação, vaso, caixa e sacos. Cada arquivo tem fundo transparente.
- assets/cenario contém o horizonte panorâmico e o trecho repetível de calçada e rua.
- assets/personagem contém as direções direita e esquerda. Cada direção tem pose parada e seis quadros para cada ação. Os quadros usam uma tela de 362 × 362 px com a linha dos pés em y = 350. A direção esquerda é espelhada.
- dados/rua.json controla a posição e a altura das fachadas e objetos na rua. A ordem das seis fachadas corresponde à de dados/fachadas.json.
- codigo/jogo.js controla toque, aceleração, frenagem, enquadramento e animação. codigo/estilo.css define a apresentação.

Para trocar uma peça pelo iPhone, preserve nome, caminho, dimensões e transparência do PNG. Texturas e detalhes pintados na própria estrutura podem ser editados no PNG correspondente.
