let telaAtual = "inicio";
const BASE_W = 1400;
const BASE_H = 900;

let uiLayer;     // a div that sits on top of the canvas
let uiScale = 1;
let offsetX = 0;
let offsetY = 0;

let isTouchScrolling = false;
let lastTouchY = 0;
let touchStartY = 0;
let touchStartScrollY = 0;


let usuario, idadeUsuario, escolaridadeUsuario;
let inputUsuario, inputIdade, inputEscolaridade, botaoCriarUsuario;
let erroLogin = "";

let cartas = [];
let cartasPorPagina = 6;
let totalPaginas = 5;
let paginaAtual = 0;

let combinacaoAtual = [];
let historico = [];
let historicoGlobal = {};
let cartasSalvas = [];

let tempoInicio = 0;
let tempoJogo = 0;
let jogoFinalizado = false;
let cliqueBloqueado = false;

let instrucaoPaginaAtual = 0;
let instrucoesConteudo = [];
let imagensInstrucoes = [];

let grupos = [];
let grupoSelecionado;
let imagensCartas = [];
let idUsuario;

var myFont;

let imgMenu, imgFundo, imgHistoria, imgLogoLab;

let ranking = [];
let rankingCarregado = false;
let rankingErro = false;

let inputEmail = null;
let emailEnviado = false;
let erroEmail = "";


// --- SCROLL (apenas na tela de jogo) ---
let scrollY = 0;
let maxScrollY = 0;

// layout do grid (mantém as cartas grandes)
const GRID_COLUNAS = 3;
const CARD_W = 270;
const CARD_H = 185;
const CARD_GAP_X = 20;
const CARD_GAP_Y = 40;
const PANEL_GAP = 18;        // gap between grid and side panel
const PANEL_SIDE_PAD = 15;   // right margin for the panel
const PANEL_W_MIN = 260;     // keep your panel readable


// margens dentro da tela do jogo (pra não bater nos textos/botões)
const GRID_TOP = 100;
const GRID_BOTTOM_RESERVED = 190; // espaço reservado para UI fixa embaixo (combinação/botões)


function updateUIScale() {
  uiScale = min(width / BASE_W, height / BASE_H);
  offsetX = (width - BASE_W * uiScale) / 2;
  offsetY = (height - BASE_H * uiScale) / 2;applyUITransform();
}


// ---------- PRELOAD ----------
function preload() {
  myFont = loadFont("fontes/PressStart2P.ttf");
  
  imgMenu = loadImage("ImagensFundo/TelaMenu.png");
  imgFundo = loadImage("ImagensFundo/TelaFundo.png"); 
  //imgHistoria = loadImage('/ImagensFundo/TelaHistoria.png');
  
  // instruções (mantém)
  imagensInstrucoes[0] = loadImage('instrucao_1.png');
  imagensInstrucoes[1] = loadImage('instrucao_2.png');
  imagensInstrucoes[2] = loadImage('instrucao_3.png');
  imagensInstrucoes[3] = loadImage('instrucao_4.png');
  imagensInstrucoes[4] = loadImage('instrucao_5.png');
  imagensInstrucoes[5] = loadImage('instrucao_6.png');
  imgLogoLab = loadImage("logo_lab.png"); // Modificações de Chico #1
  
  grupos = [carregarGrupo1, carregarGrupo2, carregarGrupo3, carregarGrupo4, carregarGrupo5];
  
  preloadHistoria();
}

// ---------- SETUP ----------
function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('gameHolder'); // put canvas inside the holder DIV

  updateUIScale();
  textAlign(CENTER, CENTER);

  // --- UI overlay layer (DOM) inside the same holder ---
  uiLayer = createDiv('');
  uiLayer.id('uiLayer');
  uiLayer.parent('gameHolder');
  uiLayer.style('position', 'absolute');
  uiLayer.style('left', '0px');
  uiLayer.style('top', '0px');
  uiLayer.style('width', '100%');
  uiLayer.style('height', '100%');
  uiLayer.style('transform-origin', '0 0');
  uiLayer.style('pointer-events', 'auto');

  // Apply initial transform so it lines up immediately
  applyUITransform();

  criarCartas();
  carregarHistoricoLocal();

  grupoSelecionado = int(random(grupos.length));
  imagensCartas = grupos[grupoSelecionado]();

  instrucoesConteudo = [
    { titulo: "1. Selecionando Cartas", texto: "Clique em uma carta para selecioná-la (ela ganhará uma borda vermelha).\n\nSe clicar errado, clique nela novamente para desmarcar.", img: imagensInstrucoes[0] },
    { titulo: "2. Navegando entre Páginas", texto: "O jogo tem 5 páginas de cartas.\n\nUse as setas do teclado (← →) ou clique nas setas azuis na tela para mudar de página.", img: imagensInstrucoes[1] },
    { titulo: "3. Salvando uma Combinação", texto: "Após selecionar as cartas que formam um grupo, clique no botão 'Salvar Combinação'.\n\nIsso salvará seu progresso.", img: imagensInstrucoes[2] },
    { titulo: "4. Cartas Salvas", texto: "Uma vez salvas, as cartas ficarão transparentes e não poderão mais ser selecionadas.\n\nSeu progresso é mostrado no canto inferior esquerdo.", img: imagensInstrucoes[3] },
    { titulo: "5. Limpando a Seleção", texto: "Se você selecionou várias cartas mas mudou de ideia antes de salvar, clique em 'Limpar Seleção' para desmarcar todas de uma vez.", img: imagensInstrucoes[4] },
    { titulo: "6. Finalizando o Jogo", texto: "Continue salvando combinações até que todas as 30 cartas estejam transparentes. O botão 'Finalizar Jogo' ficará disponível para você parar o tempo e registrar sua pontuação.", img: imagensInstrucoes[5] }
  ];
}


// ---------- DRAW (Função principal) ----------
function draw() {
  background(255);

  push();
  translate(offsetX, offsetY);
  scale(uiScale);

  if (telaAtual === "inicio") {
    drawInicio();
  } else if (telaAtual === "historia") {
    drawHistoria();
  } else if (telaAtual === "instrucoes") {
    drawInstrucoes();
  } else if (telaAtual === "jogo") {
    drawJogo();
  } else if (telaAtual === "fim") {
    drawTelaFim();
  }

  pop();
}


// ---------- Tela Inicial (RESPONSIVO) ----------
function drawInicio() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  fill(0);
  textSize(20);
  textFont(myFont);

  // Background (virtual size)
  image(imgMenu, 0, 0, BASE_W, BASE_H);

  // Créditos no canto inferior direito (virtual)
  push();
  fill(0);
  textSize(11);
  textAlign(RIGHT, BOTTOM);
  let creditos = "Desenvolvido por: Julia Forli, Juliane Santos e Francisco Figueiredo";
  text(creditos, BASE_W - 20, BASE_H - 20);
  pop();

  // Logo no canto inferior esquerdo (virtual)
  if (imgLogoLab) {
    let logoW = 200;
    let logoH = imgLogoLab.height * (logoW / imgLogoLab.width);
    let logoX = 20;
    let logoY = BASE_H - logoH - 20;
    image(imgLogoLab, logoX, logoY, logoW, logoH);
  }

  // --- MENU LAYOUT (easy to tweak) ---
  let w = 240;      // button width
  let h = 60;       // button height
  let r = 12;       // corner radius
  let x = BASE_W / 2 - w / 2;

  // Move this up/down to avoid overlapping the title in your background image
  let y1 = 260;
  let gap = 80;

  let y2 = y1 + gap;
  let y3 = y1 + gap * 2;

  textAlign(CENTER, CENTER);
  textSize(15);

  // Button 1: Iniciar Jogo
  if (mx > x && mx < x + w && my > y1 && my < y1 + h) {
    fill(120, 220, 255);
    cursor(HAND);
  } else {
    fill(100, 200, 250);
  }
  rect(x, y1, w, h, r);
  fill(0);
  text("Iniciar Jogo", BASE_W / 2, y1 + h / 2)
}



// ---------- Tela Instruções (RESPONSIVO) ----------
function drawInstrucoes() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  fill(0);

  let totalPaginas = instrucoesConteudo.length;
  let pagina = instrucoesConteudo[instrucaoPaginaAtual];

  textSize(15);
  textAlign(CENTER, TOP);
  text(`📖 ${pagina.titulo}`, BASE_W / 2, 30);

  push();
  textSize(15);
  textAlign(LEFT, TOP);
  textLeading(20);
  let margem = 80;
  let larguraTexto = BASE_W - (margem * 2);
  text(pagina.texto, margem, 100, larguraTexto);
  pop();

  // imagem
  let imgY = 180;
  let imgW = 600;
  let imgH = 300;
  let imgX = (BASE_W - imgW) / 2;
  image(pagina.img, imgX, imgY, imgW, imgH);

  noFill();
  stroke(0);
  strokeWeight(2);
  rect(imgX, imgY, imgW, imgH, 10);

  textAlign(CENTER, CENTER);
  let btnY = BASE_H - 70, btnH = 50, btnR = 12;

  // anterior
  if (instrucaoPaginaAtual > 0) {
    let btnX = 50, btnW = 150;
    if (mx > btnX && mx < btnX + btnW && my > btnY && my < btnY + btnH) {
      fill(220, 220, 240); cursor(HAND);
    } else {
      fill(200, 200, 220);
    }
    rect(btnX, btnY, btnW, btnH, btnR);
    fill(0); textSize(15);
    text("Anterior", btnX + btnW / 2, btnY + btnH / 2);
  }

  // próximo
  if (instrucaoPaginaAtual < totalPaginas - 1) {
    let btnX = BASE_W - 200, btnW = 150;
    if (mx > btnX && mx < btnX + btnW && my > btnY && my < btnY + btnH) {
      fill(220, 220, 240); cursor(HAND);
    } else {
      fill(200, 200, 220);
    }
    rect(btnX, btnY, btnW, btnH, btnR);
    fill(0); textSize(15);
    text("Próximo", btnX + btnW / 2, btnY + btnH / 2);
  }

  // voltar ao início
  let btnX = BASE_W / 2 - 100, btnW = 200;
  if (mx > btnX && mx < btnX + btnW && my > btnY && my < btnY + btnH) {
    fill(200, 220, 255); cursor(HAND);
  } else {
    fill(180, 200, 250);
  }
  rect(btnX, btnY, btnW, btnH, btnR);
  fill(0); textSize(10);
  text("Voltar ao Início", BASE_W / 2, btnY + btnH / 2);

  fill(0);
  textSize(15);
  text(`Página ${instrucaoPaginaAtual + 1} de ${totalPaginas}`, BASE_W / 2, imgY + imgH + 20);
}


// ---------- Tela Jogo ----------
function drawJogo() {
  // Verifica por 'usuario' (nome)
  if (!usuario) {
    // Background for the login screen
    if (imgFundo) {
      image(imgFundo, 0, 0, BASE_W, BASE_H);
    } else {
      background(240);
    }

    textFont(myFont);
    textAlign(CENTER, CENTER);

    // --- Layout numbers (safe to tweak) ---
    const inputW = 260;     // requested
    const inputH = 34;      // visual height
    const gap = 14;

    const panelPadding = 24;
    const panelW = inputW + panelPadding * 2;
    const panelH = 270;

    const panelX = BASE_W / 2 - panelW / 2;
    const panelY = BASE_H / 2 - panelH / 2 + 10;

    // Panel behind inputs (canvas)
    noStroke();
    fill(255, 255, 255, 220);
    rect(panelX, panelY, panelW, panelH, 16);
    stroke(0);
    noFill();
    rect(panelX, panelY, panelW, panelH, 16);

    // Title ABOVE the panel
    fill(0);
    textSize(18);
    text("Insira seu nome para começar", BASE_W / 2, panelY - 25);

    // Create HTML elements once
    if (!inputUsuario) {
      // Nome
      inputUsuario = createInput('');
      inputUsuario.parent(uiLayer);
      inputUsuario.attribute('placeholder', 'Digite seu nome');

      // Idade
      inputIdade = createInput('');
      inputIdade.parent(uiLayer);
      inputIdade.attribute('placeholder', 'Digite sua idade');
      inputIdade.attribute('type', 'number');

      // Escolaridade
      inputEscolaridade = createInput('');
      inputEscolaridade.parent(uiLayer);
      inputEscolaridade.attribute('placeholder', 'Digite sua escolaridade');

      // Shared input styles (important: border-box + fixed height)
      const styleInput = (el) => {
        el.style('box-sizing', 'border-box');
        el.style('width', inputW + 'px');
        el.style('height', inputH + 'px');
        el.style('line-height', inputH + 'px');
        el.style('padding', '0 10px'); // horizontal padding only
        el.style('font-size', '13px');
        el.style('border', '2px solid #000');
        el.style('border-radius', '10px');
        el.style('outline', 'none');
        el.style('background', '#fff');
        el.style('display', 'block');
      };

      styleInput(inputUsuario);
      styleInput(inputIdade);
      styleInput(inputEscolaridade);

      // Button
      botaoCriarUsuario = createButton('Começar');
      botaoCriarUsuario.parent(uiLayer);
      botaoCriarUsuario.style('box-sizing', 'border-box');
      botaoCriarUsuario.style('padding', '10px 18px');
      botaoCriarUsuario.style('font-size', '14px');
      botaoCriarUsuario.style('border', '2px solid #000');
      botaoCriarUsuario.style('border-radius', '12px');
      botaoCriarUsuario.style('background', '#64c864');
      botaoCriarUsuario.style('cursor', 'pointer');

      botaoCriarUsuario.mouseOver(() => botaoCriarUsuario.style('background', '#78dc78'));
      botaoCriarUsuario.mouseOut(() => botaoCriarUsuario.style('background', '#64c864'));

      botaoCriarUsuario.mousePressed(criarUsuario);
    }

    // Ensure width (height is CSS-controlled)
    inputUsuario.size(inputW);
    inputIdade.size(inputW);
    inputEscolaridade.size(inputW);

    // Position HTML elements every frame using BASE coords (uiLayer handles scaling)
    const xLeft = panelX + panelPadding;
    const yStart = panelY + 55;

    const realH = inputUsuario.elt.offsetHeight || inputH;

    inputUsuario.position(xLeft, yStart);
    inputIdade.position(xLeft, yStart + (realH + gap));
    inputEscolaridade.position(xLeft, yStart + 2 * (realH + gap));

    // Button centred under inputs
    const btnY = yStart + 3 * (realH + gap) + 14;
    const btnW = botaoCriarUsuario.elt.offsetWidth || 120;
    botaoCriarUsuario.position(BASE_W / 2 - btnW / 2, btnY);

    // Error message inside panel (near bottom)
    if (erroLogin !== "") {
      fill(255, 0, 0);
      textSize(12);
      textAlign(CENTER, CENTER);
      text(erroLogin, BASE_W / 2, panelY + panelH - 18);
    }

    return;
  }

  // --------- Gameplay ---------
  if (!jogoFinalizado) tempoJogo = floor((millis() - tempoInicio) / 1000);

  drawCartasPagina();
  drawCombinacaoAtual();
  drawProgresso();
  drawNavegacao();
  drawBotaoSalvar();
  drawBotaoSemGrupo();
  drawBotaoLimpar();
  drawBotaoSelecionarRestantes();
  drawBotaoFinalizar();
  drawBotaoDesistir();
}



// ---------- Tela Final do Jogo (RESPONSIVO + RESULTADO) ----------
function drawTelaFim() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  // Fundo
  if (imgFundo) image(imgFundo, 0, 0, BASE_W, BASE_H);
  else background(255);

  // ---------- Textos ----------
  const perfil = calcularPerfilCognitivo(); // "lumper" | "splitter" | null

  const textoExplicacao =
    "Em atividades como esta, existem duas estratégias principais de organização: lumpers e splitters.\n\n" +
    "Lumpers são aqueles que criam poucos grupos, porém maiores, percebendo padrões amplos e semelhanças gerais antes dos detalhes. " +
    "Esse tipo de pensamento ajuda a identificar estruturas maiores e relações mais globais.\n\n" +
    "Splitters são aqueles que criam muitos grupos, porém menores, percebendo diferenças sutis e detalhes finos com muita clareza. " +
    "Esse tipo de pensamento é essencial para identificar pequenas variações dentro de sistemas complexos.";

  let textoResultado = "";
  if (perfil === "lumper") {
    textoResultado =
      "Com base nas suas escolhas, você tende a usar uma estratégia do tipo LUMPER.\n\n" +
      "Isso significa que você percebe padrões amplos e conexões gerais com facilidade.";
  } else if (perfil === "splitter") {
    textoResultado =
      "Com base nas suas escolhas, você tende a usar uma estratégia do tipo SPLITTER.\n\n" +
      "Isso significa que você percebe diferenças sutis e detalhes finos com muita clareza.";
  } else {
    textoResultado =
      "Com base nas suas escolhas, não foi possível identificar um estilo com segurança.";
  }

  const textoFechamento =
    "Estes estilos refletem formas diferentes de perceber e organizar padrões. " +
    "Na ciência, ambos são importantes e complementares.\n\n" +
    "Obrigada por contribuir com a pesquisa —\n" +
    "e por ajudar os golfinhos 💙";

  // ---------- Painel ----------
  const boxW = 880;
  const boxH = 520;
  const boxX = BASE_W / 2 - boxW / 2;
  const boxY = 78;

  noStroke();
  fill(255, 255, 255, 228);
  rect(boxX, boxY, boxW, boxH, 18);

  stroke(0);
  strokeWeight(2);
  noFill();
  rect(boxX, boxY, boxW, boxH, 18);

  // ---------- Título (pixel font) ----------
  textFont(myFont);
  textStyle(NORMAL);
  fill(0);
  textAlign(CENTER, TOP);
  textSize(30);
  text("Obrigada por participar!", BASE_W / 2, 28);

  // ---------- Conteúdo (fonte legível) ----------
  const bodyFont = "Verdana"; // ou "Arial" se preferir
  const margem = 34;

  // ⭐ Pequeno “respiro” extra = sensação de letras menos crammed
  const maxW = boxW - margem * 2 - 12;

  // Área interna disponível para texto
  const innerTop = boxY + 22;
  const innerBottom = boxY + boxH - 22;
  const innerH = innerBottom - innerTop;

  // ⭐ Um pouco mais de espaço vertical deixa MUITO mais legível
  let bodySize = 16;
  let leading = 24;

  // medir altura total (arrow function evita “function declaration in blocks” em alguns setups)
  const measureTotalHeight = () => {
    textFont(bodyFont);
    textStyle(NORMAL); // ⭐ garante que não está “bold”
    textSize(bodySize);
    textLeading(leading);

    const expLines = wrapTextLines(textoExplicacao, maxW);
    const resLines = wrapTextLines(textoResultado, maxW);
    const closeLines = wrapTextLines(textoFechamento, maxW);

    const expH = expLines.length * leading;
    const headerH = 30; // espaço para "Seu resultado"
    const resH = resLines.length * leading;
    const closeH = closeLines.length * leading;

    const gaps = 14 + 12 + 14; // após explicação + após header + após resultado

    return expH + headerH + resH + closeH + gaps;
  };

  // Encolhe até caber ou até um mínimo aceitável
  while (measureTotalHeight() > innerH && bodySize > 12) {
    bodySize -= 1;
    leading = Math.max(18, leading - 1);
  }

  // ---------- Desenhar conteúdo ----------
  let cursorY = innerTop;

  // Explicação (LEFT)
  textFont(bodyFont);
  textStyle(NORMAL); // ⭐ sem “bold”
  textSize(bodySize);
  textLeading(leading);
  textAlign(LEFT, TOP);
  fill(0);

  cursorY += drawWrappedText(textoExplicacao, boxX + margem, cursorY, maxW, leading);
  cursorY += 14;

  // Header "Seu resultado" (pixel font)
  textFont(myFont);
  textStyle(NORMAL);
  textAlign(CENTER, TOP);
  textSize(16);
  text("Seu resultado", BASE_W / 2, cursorY);
  cursorY += 30;

  // Resultado (CENTER, fonte legível)
  textFont(bodyFont);
  textStyle(NORMAL); // ⭐ sem “bold”
  textSize(bodySize);
  textLeading(leading);
  textAlign(CENTER, TOP);

  const resLines = wrapTextLines(textoResultado, maxW);
  for (let i = 0; i < resLines.length; i++) {
    text(resLines[i], BASE_W / 2, cursorY + i * leading);
  }
  cursorY += resLines.length * leading;
  cursorY += 14;

  // Fechamento (CENTER, fonte legível)
  const closeLines = wrapTextLines(textoFechamento, maxW);
  for (let i = 0; i < closeLines.length; i++) {
    text(closeLines[i], BASE_W / 2, cursorY + i * leading);
  }

  // ---------- Resumo ----------
  const m = floor(tempoJogo / 60), s = tempoJogo % 60;

  textFont(bodyFont);
  textStyle(NORMAL);
  textAlign(CENTER, TOP);
  textSize(12);
  textLeading(18);

  text(
    `Usuário: ${usuario}  •  Tempo: ${nf(m, 2)}:${nf(s, 2)}  •  Combinações: ${historico.length}`,
    BASE_W / 2,
    boxY + boxH + 10
  );
// ---------- Email opcional ----------
const emailY = boxY + boxH + 40;

textFont(myFont);
textAlign(CENTER, TOP);
textSize(14);
fill(0);
text(
  "Se quiser receber os resultados desta pesquisa no futuro,\n" +
  "deixe seu e-mail abaixo (opcional):",
  BASE_W / 2,
  emailY
);

// Cria o input uma única vez
if (!inputEmail && !emailEnviado) {
  inputEmail = createInput("");
  inputEmail.attribute("placeholder", "seuemail@exemplo.com");

  inputEmail.style("width", "320px");
  inputEmail.style("padding", "8px");
  inputEmail.style("font-size", "14px");
  inputEmail.style("border", "2px solid #000");
  inputEmail.style("border-radius", "8px");
  inputEmail.style("background", "#fff");
  inputEmail.style("box-sizing", "border-box");
  inputUsuario.style('pointer-events', 'auto');

  // IMPORTANT: parent to uiLayer so it scales with the game
  inputEmail.parent(uiLayer);
}

// Posiciona o input (BASE coords — NO toScreenX/toScreenY!)
if (inputEmail && !emailEnviado) {
  inputEmail.position(BASE_W / 2 - 160, emailY + 40);
}

// Botão enviar
const btnW = 180;
const btnH = 44;
const btnX = BASE_W / 2 - btnW / 2;
const btnY = emailY + 90;

if (!emailEnviado) {
  if (mx > btnX && mx < btnX + btnW && my > btnY && my < btnY + btnH) {
    fill(200, 240, 200);
    cursor(HAND);
  } else {
    fill(180, 220, 180);
  }

  stroke(0);
  strokeWeight(2);
  rect(btnX, btnY, btnW, btnH, 10);

  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Enviar e-mail", btnX + btnW / 2, btnY + btnH / 2);
} else {
  fill(0);
  textSize(14);
  textAlign(CENTER, TOP);
  text("Obrigada! 💙\nEnviaremos nossos achados :)", BASE_W / 2, emailY + 60);
}

// Erro de email
if (erroEmail !== "") {
  fill(255, 0, 0);
  textSize(12);
  textAlign(CENTER, TOP);
  text(erroEmail, BASE_W / 2, btnY + btnH + 8);
}


  // ---------- Botão Voltar ----------
  const bw = 240;
  const bh = 52;
  const r = 12;
  const bx = BASE_W / 2 - bw / 2;
  const by = BASE_H - 90;

  if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
    fill(200, 220, 255);
    cursor(HAND);
  } else {
    fill(180, 200, 250);
  }

  stroke(0);
  strokeWeight(2);
  rect(bx, by, bw, bh, r);

  fill(0);
  noStroke();
  textFont(myFont);
  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
  textSize(14);
  text("Voltar ao Início", bx + bw / 2, by + bh / 2);
}





// ---------- Criar usuário (Modificada com verificação) ----------
function criarUsuario() {
  let nome = inputUsuario.value().trim();
  let idade = inputIdade.value().trim();
  let escolaridade = inputEscolaridade.value().trim();
  
  // 1. Verifica se o nome está vazio
  if(nome === "") {
    erroLogin = "Por favor, insira um nome.";
    return;
  }
  
    // 2. Verifica se a idade está vazia ou inválida
  if(idade === "" || idade < 1) {
    erroLogin = "Por favor, insira uma idade válida.";
    return;
  }
  
  // 3. Verifica se selecionou a escolaridade
  if(escolaridade === "") {
    erroLogin = "Por favor, digite sua escolaridade.";
    return;
  }
  
  idUsuario = "player_" + int(random(1000, 9999)) + "_" + Date.now();
  
  // 3. Cria chave única combinando nome + ID
  let chaveUsuario = nome + "#" + idUsuario;
  
  // 4. Verifica se esta combinação exata já existe (praticamente impossível)
  if (chaveUsuario in historicoGlobal) {
    erroLogin = "Erro ao criar usuário. Tente novamente.";
    return;
  }
  
  // 3. Sucesso!
  erroLogin = ""; // Limpa qualquer erro anterior
  usuario = nome; // Define o nome =
  idadeUsuario = parseInt(idade);
  escolaridadeUsuario = escolaridade;
  
  inputUsuario.hide();
  inputIdade.hide();
  inputEscolaridade.hide();
  botaoCriarUsuario.hide();
  tempoInicio = millis();
  historico = [];
  cartasSalvas = []; 
  jogoFinalizado = false;
}

// ---------- Criar cartas (sem alteração) ----------
function criarCartas() {
  cartas = [];
  for(let i=0;i<30;i++){
    cartas.push({
      id:i,
      cor:color(random(80,255), random(80,255), random(80,255)),
      page:floor(i/cartasPorPagina),
      x:0,
      y:0
    });
  }
}

// ---------- Cartas com SCROLL (COM CLIP TOPO + RODAPÉ) ----------
function drawCartasPagina() {
  // (mantive o nome da função pra não precisar mudar drawJogo)
  const colunas = GRID_COLUNAS;

  const gridLargura = (colunas * CARD_W) + ((colunas - 1) * CARD_GAP_X);

// side panel position (same logic you used in mousePressed)
const panelX = BASE_W - PANEL_SIDE_PAD - PANEL_W_MIN;

// the grid area is everything from left edge up to the panel gap
const gridAreaX = 20; // left margin
const gridAreaW = (panelX - PANEL_GAP) - gridAreaX;

// centre grid inside that area
const xInicial = gridAreaX + (gridAreaW - gridLargura) / 2;


  // --- calcula altura total do conteúdo e limite do scroll ---
  const totalLinhas = Math.ceil(cartas.length / colunas);
  const contentH = totalLinhas * CARD_H + (totalLinhas - 1) * CARD_GAP_Y;
  const viewportH = (BASE_H - GRID_TOP - GRID_BOTTOM_RESERVED);

  maxScrollY = Math.max(0, contentH - viewportH);
  scrollY = constrain(scrollY, 0, maxScrollY);

  // --- posiciona as cartas em "world coords" (c.x/c.y) e desenha com offset de scroll ---
  let x = xInicial;
  let yWorld = GRID_TOP;

  // mouse em coords do jogo (BASE coords)
  const mx = scaledMouseX();
  const my = scaledMouseY();

  // ---------- CLIP: impede cartas de desenhar no topo e embaixo ----------
  // Topo: protege textos/indicadores
  const clipTop = 90;

  // Rodapé: protege botões/rodapé do jogo
  // Usa o que você já declarou como reservado (melhor do que "chutar número")
  const clipBottom = GRID_BOTTOM_RESERVED;

  const clipX = 0;
  const clipY = clipTop;
  const clipW = BASE_W;
  const clipH = BASE_H - clipTop - clipBottom;

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(clipX, clipY, clipW, clipH);
  drawingContext.clip();
  // ---------------------------------------------------------------

  for (let i = 0; i < cartas.length; i++) {
    const c = cartas[i];
    c.x = x;
    c.y = yWorld; // WORLD Y (sem scroll)

    const yDraw = yWorld - scrollY; // posição na tela

    // culling simples (não desenha se estiver bem fora da tela)
    if (yDraw > -CARD_H - 20 && yDraw < BASE_H + 20) {
      const estaSalva = cartasSalvas.includes(c.id);
      const img = imagensCartas[c.id];

      // desenha imagem com cantos arredondados
      push();
      drawingContext.save();
      drawingContext.beginPath();
      drawingContext.roundRect(c.x, yDraw, CARD_W, CARD_H, 10);
      drawingContext.clip();

      if (estaSalva) tint(255, 100);
      else noTint();

      image(img, c.x, yDraw, CARD_W, CARD_H);
      noTint();

      drawingContext.restore();
      pop();

      // moldura preta
      noFill();
      stroke(0);
      strokeWeight(2);
      rect(c.x, yDraw, CARD_W, CARD_H, 10);

      // cursor mão se estiver em cima e não salva
      if (!estaSalva && mx > c.x && mx < c.x + CARD_W && my > yDraw && my < yDraw + CARD_H) {
        cursor(HAND);
      }

      // borda vermelha se selecionada
      if (combinacaoAtual.includes(c.id)) {
        noFill();
        stroke(255, 0, 0);
        strokeWeight(4);
        rect(c.x - 5, yDraw - 5, CARD_W + 10, CARD_H + 10, 12);
      }
    }

    // avança grid
    x += CARD_W + CARD_GAP_X;
    if ((i + 1) % colunas === 0) {
      x = xInicial;
      yWorld += CARD_H + CARD_GAP_Y;
    }
  }

  // ---------- END CLIP ----------
  drawingContext.restore();
  pop();
  // ----------------------------

  // dica de scroll (opcional, mas ajuda MUITO)
  // (fora do clip pra sempre aparecer)
  if (maxScrollY > 0) {
    noStroke();
    fill(0, 140);
    textSize(12);
    textAlign(CENTER, CENTER)
  }
}


function mouseWheel(event) {
  // só scroll na tela de jogo, e só depois do usuário existir
  if (telaAtual === "jogo" && usuario) {
    // trackpad/mouse wheel friendly
    scrollY += event.delta;
    scrollY = constrain(scrollY, 0, maxScrollY);

    return false; // impede a página do browser de rolar
  }
}

// ---------- mousePressed (RESPONSIVO + SCROLL NO JOGO) ----------
function mousePressed() {
  const mx = scaledPointerX();
const my = scaledPointerY();

  // --------------------------
  // TELA INÍCIO
  // --------------------------
  if (telaAtual === "inicio") {
    const L = getMenuLayout();

    if (mx > L.x && mx < L.x + L.w) {
      if (my > L.y1 && my < L.y1 + L.h) {
        telaAtual = "historia";
        return;
      }
      if (my > L.y2 && my < L.y2 + L.h) {
        telaAtual = "instrucoes";
        instrucaoPaginaAtual = 0;
        return;
      }
    }
  }

  // --------------------------
  // TELA HISTÓRIA
  // --------------------------
  if (telaAtual === "historia") {
    if (mousePressedHistoria()) return;
  }

  // --------------------------
  // TELA INSTRUÇÕES
  // --------------------------
  if (telaAtual === "instrucoes") {
    const totalPaginasLocal = instrucoesConteudo.length;

    // voltar ao início
    if (mx > BASE_W / 2 - 100 && mx < BASE_W / 2 + 100 && my > BASE_H - 70 && my < BASE_H - 20) {
      telaAtual = "inicio";
      instrucaoPaginaAtual = 0;
      return;
    }

    // anterior
    if (instrucaoPaginaAtual > 0 && mx > 50 && mx < 200 && my > BASE_H - 70 && my < BASE_H - 20) {
      instrucaoPaginaAtual--;
      return;
    }

    // próxima
    if (instrucaoPaginaAtual < totalPaginasLocal - 1 && mx > BASE_W - 200 && mx < BASE_W - 50 && my > BASE_H - 70 && my < BASE_H - 20) {
      instrucaoPaginaAtual++;
      return;
    }
  }

  // --------------------------
  // TELA DE JOGO (SCROLL)
  // --------------------------
  if (telaAtual === "jogo" && usuario) {
    // botão "voltar"
    if (mx > 30 && mx < 150 && my > 20 && my < 60) {
      resetarParaInicio();
      return;
    }

    // -------------------------------------------------------
    // BOTÕES CENTRADOS EMBAIXO DO GRID (SEM + LIMPAR + SALVAR)
    // -------------------------------------------------------
    // (Tem que vir ANTES do clique nas cartas, senão você pode
    // clicar no botão e ele tentar clicar numa carta por baixo.)
    const btnW = 160, btnH = 50;
    const btnGap = 20;

    // largura do grid das cartas (3 colunas)
    const gridW = (GRID_COLUNAS * CARD_W) + ((GRID_COLUNAS - 1) * CARD_GAP_X);
    const xLeft = (BASE_W - gridW) / 2;

    // linha de 3 botões centralizada dentro do grid
    const totalRowW = (btnW * 3) + (btnGap * 2);
    const rowX = xLeft + (gridW - totalRowW) / 2;

    // posiciona dentro da área reservada de baixo
    // (ajuste o -120 se quiser mais alto/baixo)
    const btnY = BASE_H - 120;

    const xSemGrupo = rowX;
    const xLimpar = rowX + (btnW + btnGap);
    const xSalvar = rowX + 2 * (btnW + btnGap);

    // Clique em "Carta sem grupo"
    if (
      combinacaoAtual.length > 0 &&
      mx > xSemGrupo && mx < xSemGrupo + btnW &&
      my > btnY && my < btnY + btnH
    ) {
      for (let id of combinacaoAtual) {
        if (!cartasSalvas.includes(id)) cartasSalvas.push(id);
      }

      historico.push({
        numero: historico.length + 1,
        semGrupo: true,
        cartas: [...combinacaoAtual].map(id => `carta${grupoSelecionado + 1}_${id + 1}`)
      });

      combinacaoAtual = [];
      return;
    }

    // Clique em "Limpar seleção"
    if (
      combinacaoAtual.length > 0 &&
      mx > xLimpar && mx < xLimpar + btnW &&
      my > btnY && my < btnY + btnH
    ) {
      combinacaoAtual = [];
      return;
    }

    // Clique em "Salvar combinação"
    if (
      mx > xSalvar && mx < xSalvar + btnW &&
      my > btnY && my < btnY + btnH
    ) {
      if (combinacaoAtual.length > 0) {
        for (let id of combinacaoAtual) {
          if (!cartasSalvas.includes(id)) cartasSalvas.push(id);
        }

        historico.push({
          numero: historico.length + 1,
          cartas: [...combinacaoAtual].map(id => `carta${grupoSelecionado + 1}_${id + 1}`)
        });

        combinacaoAtual = [];
      }
      return;
    }
// -------------------------------------------------------
// -------------------------------------------------------
// BOTÃO: Selecionar restantes (SEM salvar)
// -------------------------------------------------------
{
  if (combinacaoAtual.length === 0) {
    const restantes = cartas.length - cartasSalvas.length;
    if (restantes > 0) {
      const gridW = (GRID_COLUNAS * CARD_W) + ((GRID_COLUNAS - 1) * CARD_GAP_X);
      const xLeft = (BASE_W - gridW) / 2;

      const w = 240;
      const h = 46;

      const x = xLeft + (gridW - w) / 2;
      const y = BASE_H - 180;

      if (mx > x && mx < x + w && my > y && my < y + h) {
        // Seleciona todas as cartas ainda não salvas
        combinacaoAtual = [];
        for (let i = 0; i < cartas.length; i++) {
          const id = cartas[i].id;
          if (!cartasSalvas.includes(id)) combinacaoAtual.push(id);
        }
        return;
      }
    }
  }
}

// if the user just dragged to scroll, don't treat it as a click
if (telaAtual === "jogo" && usuario) {
  if (isTouchScrolling) return;
}
    // -----------------------------------------
    // Clique nas cartas (COM SCROLL + CLIP)
    // -----------------------------------------
    {
      const clipTop = 90;
      const clipBottom = GRID_BOTTOM_RESERVED;

      const clicouNaAreaVisivelDasCartas =
        (my >= clipTop) && (my <= BASE_H - clipBottom);

      if (clicouNaAreaVisivelDasCartas) {
        const worldX = mx;
        const worldY = my + scrollY;

        for (let i = 0; i < cartas.length; i++) {
          const c = cartas[i];

          if (
            worldX > c.x && worldX < c.x + CARD_W &&
            worldY > c.y && worldY < c.y + CARD_H
          ) {
            if (!cartasSalvas.includes(c.id)) {
              if (!combinacaoAtual.includes(c.id)) combinacaoAtual.push(c.id);
              else combinacaoAtual = combinacaoAtual.filter(id => id !== c.id);
            }
            return;
          }
        }
      }
    }

    // ---------------------------------------------------------
    // REMOVER CARTA DA COMBINAÇÃO ATUAL (painel lateral - mini grid)
    // ---------------------------------------------------------
    {
      const B = getGridBounds();
      const panelX = B.xRight + 15;
      const panelW = BASE_W - panelX - 15;
      const panelY = 95;
      const panelH = BASE_H - panelY - 20;

      if (panelW >= 160) {
        const cols = 2;
        const pad = 12;
        const gap = 10;

        const availW = panelW - pad * 2;
        const miniW = Math.floor((availW - gap) / cols);
        const miniH = Math.round(miniW * (154 / 225));

        let startX = panelX + pad;
        let x = startX;
        let y = panelY + 40;

        for (let i = 0; i < combinacaoAtual.length; i++) {
          if (y + miniH > panelY + panelH - 30) break;

          if (mx > x && mx < x + miniW && my > y && my < y + miniH) {
            combinacaoAtual.splice(i, 1);
            return;
          }

          x += miniW + gap;
          if ((i + 1) % cols === 0) {
            x = startX;
            y += miniH + gap;
          }
        }
      }
    }

    // FINALIZAR
    if (mx > BASE_W - 180 && mx < BASE_W - 20 && my > BASE_H - 140 && my < BASE_H - 90) {
      if (cartasSalvas.length >= cartas.length) {
        let agora = new Date();
        const perfil = calcularPerfilCognitivo();

        let partida = {
          id_usuario: idUsuario,
          usuario: usuario,
          idade: idadeUsuario,
          escolaridade: escolaridadeUsuario,
          data: agora.toISOString(),
          tempo_total: tempoJogo,
          grupo: grupoSelecionado + 1,
          perfil_cognitivo: perfil, // <-- NEW
          combinacoes: historico
        };

        enviarPartidaWebhook(partida);

        if (!historicoGlobal[usuario]) {
          historicoGlobal[usuario] = [];
        }
        historicoGlobal[usuario].push(partida);
        salvarHistoricoLocal();

        jogoFinalizado = true;
        telaAtual = "fim";
      }
      return;
    }
  }

  // --------------------------
// TELA FIM
// --------------------------
if (telaAtual === "fim") {
  const bw = 240;
  const bh = 52;
  const bx = BASE_W / 2 - bw / 2;
  const by = BASE_H - 90;
  // Recria a mesma posição usada no drawTelaFim (localmente)
const boxY = 78;
const boxH = 520;

// Posição do campo de e-mail / botão (ajuste se necessário)
const emailAreaY = boxY + boxH + 40;

  // Enviar e-mail
if (!emailEnviado && inputEmail) {
  const btnW = 180;
  const btnH = 44;
  const btnX = BASE_W / 2 - btnW / 2;
  const btnY = boxY + boxH + 40 + 90;

  if (mx > btnX && mx < btnX + btnW && my > btnY && my < btnY + btnH) {
    const email = inputEmail.value().trim();

    if (!emailValido(email)) {
      erroEmail = "Por favor, insira um e-mail válido.";
      return;
    }

    enviarEmailPesquisa(email);
    inputEmail.remove();
    inputEmail = null;
    return;
  }
}


  if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
    resetarParaInicio();
    return;
  }
}
}

// ---------- keyPressed (SCROLL NO JOGO) ----------
function keyPressed() {
  // Story keys first
  if (telaAtual === "historia" && keyPressedHistoria()) return;

  if (telaAtual !== "jogo" || !usuario) return;

  // Optional: allow arrow keys to scroll a bit (nice accessibility)
  const step = 80;

  if (keyCode === DOWN_ARROW) {
    scrollY = constrain(scrollY + step, 0, maxScrollY);
  } else if (keyCode === UP_ARROW) {
    scrollY = constrain(scrollY - step, 0, maxScrollY);
  }
}

// ---------- Combinação atual (PAINEL DIREITO + MINI PEQUENAS) ----------
function drawCombinacaoAtual() {
  const B = getGridBounds();

  // Panel uses right margin beside the grid
  const panelX = B.xRight + 15;
  const panelW = BASE_W - panelX - 15;
  const panelY = 95;
  const panelH = BASE_H - panelY - 20;

  if (panelW < 160) return;

  // panel background
  noStroke();
  fill(255, 255, 255, 220);
  rect(panelX, panelY, panelW, panelH, 14);
  stroke(0);
  noFill();
  rect(panelX, panelY, panelW, panelH, 14);

  // title
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(13);
  text("Combinação Atual", panelX + panelW / 2, panelY + 20);

  // empty state
  if (combinacaoAtual.length === 0) {
    fill(0, 130);
    textSize(11);
    text("Selecione cartas\npara montar um grupo", panelX + panelW / 2, panelY + 55);
    return;
  }

  // --- mini grid (2 columns) ---
  const cols = 2;
  const pad = 12;
  const gap = 10;

  const availW = panelW - pad * 2;
  const miniW = Math.floor((availW - gap) / cols);     // small cards
  const miniH = Math.round(miniW * (154 / 225));

  let startX = panelX + pad;
  let x = startX;
  let y = panelY + 40;

  for (let i = 0; i < combinacaoAtual.length; i++) {
    const id = combinacaoAtual[i];
    const img = imagensCartas[id];

    // stop if no more vertical room
    if (y + miniH > panelY + panelH - 30) break;

    // rounded mini
    push();
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.roundRect(x, y, miniW, miniH, 8);
    drawingContext.clip();
    image(img, x, y, miniW, miniH);
    drawingContext.restore();
    pop();

    // frame
    stroke(0);
    strokeWeight(2);
    noFill();
    rect(x, y, miniW, miniH, 8);

    // small label
    noStroke();
    fill(255);
    textSize(9);
    textAlign(CENTER, CENTER);
    text(id + 1, x + miniW / 2, y + miniH - 9);

    // next cell
    x += miniW + gap;
    if ((i + 1) % cols === 0) {
      x = startX;
      y += miniH + gap;
    }
  }

  fill(0, 120);
  textSize(10);
  textAlign(CENTER, CENTER);
  text("Clique numa miniatura\npara remover", panelX + panelW / 2, panelY + panelH - 16);
}


// ---------- Botão Sem Grupo (RESPONSIVO) ----------
function drawBotaoSemGrupo(){
  if (combinacaoAtual.length > 0) {
    const gridW = (GRID_COLUNAS * CARD_W) + ((GRID_COLUNAS - 1) * CARD_GAP_X);
    const xLeft = (BASE_W - gridW) / 2;

    const w = 160, h = 50, r = 10;
    const gap = 20;

    // row centred under the grid
    const totalRowW = (w * 3) + (gap * 2);
    const rowX = xLeft + (gridW - totalRowW) / 2;

    const y = BASE_H - 120; // inside bottom reserved area

    const x = rowX; // left button

    const mx = scaledMouseX();
    const my = scaledMouseY();

    if (mx > x && mx < x + w && my > y && my < y + h) {
      fill(180, 180, 255); cursor(HAND);
    } else {
      fill(160, 160, 240);
    }

    stroke(0);
    rect(x, y, w, h, r);
    fill(0);
    noStroke();
    textSize(13);
    textAlign(CENTER, CENTER);
    text("Carta\nsem grupo", x + w/2, y + h/2);
  }
}



// ---------- Botão Limpar Seleção (RESPONSIVO) ----------
function drawBotaoLimpar(){
  if (combinacaoAtual.length > 0) {
    const gridW = (GRID_COLUNAS * CARD_W) + ((GRID_COLUNAS - 1) * CARD_GAP_X);
    const xLeft = (BASE_W - gridW) / 2;

    const w = 160, h = 50, r = 10;
    const gap = 20;

    const totalRowW = (w * 3) + (gap * 2);
    const rowX = xLeft + (gridW - totalRowW) / 2;

    const y = BASE_H - 120;

    const x = rowX + (w + gap); // middle button

    const mx = scaledMouseX();
    const my = scaledMouseY();

    if (mx > x && mx < x + w && my > y && my < y + h) {
      fill(255, 200, 120); cursor(HAND);
    } else {
      fill(255, 180, 100);
    }

    stroke(0); strokeWeight(2);
    rect(x, y, w, h, r);
    fill(0); noStroke(); textSize(14);
    textAlign(CENTER, CENTER);
    text("Limpar\nSeleção", x + w/2, y + h/2);
  }
}

// ---------- Botão "Selecionar restantes" ----------
function drawBotaoSelecionarRestantes() {
  if (!usuario) return;
  if (telaAtual !== "jogo") return;
  if (combinacaoAtual.length > 0) return;

  const restantes = cartas.length - cartasSalvas.length;
  if (restantes <= 0) return;

  const mx = scaledMouseX();
  const my = scaledMouseY();

  // Layout alinhado com o grid
  const gridW = (GRID_COLUNAS * CARD_W) + ((GRID_COLUNAS - 1) * CARD_GAP_X);
  const xLeft = (BASE_W - gridW) / 2;

  const w = 240;
  const h = 46;
  const r = 10;

  const x = xLeft + (gridW - w) / 2;
  const y = BASE_H - 180; // <- mais alto, não briga com os botões de salvar/limpar/sem grupo

  if (mx > x && mx < x + w && my > y && my < y + h) {
    fill(220, 220, 255);
    cursor(HAND);
  } else {
    fill(200, 200, 245);
  }

  stroke(0);
  strokeWeight(2);
  rect(x, y, w, h, r);

  fill(0);
  noStroke();
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`Selecionar todas restantes (${restantes})`, x + w / 2, y + h / 2);
}



// ---------- Botão salvar (RESPONSIVO) ----------
function drawBotaoSalvar(){
  const gridW = (GRID_COLUNAS * CARD_W) + ((GRID_COLUNAS - 1) * CARD_GAP_X);
  const xLeft = (BASE_W - gridW) / 2;

  const w = 160, h = 50, r = 10;
  const gap = 20;

  const totalRowW = (w * 3) + (gap * 2);
  const rowX = xLeft + (gridW - totalRowW) / 2;

  const y = BASE_H - 120;

  const x = rowX + 2 * (w + gap); // right button

  const mx = scaledMouseX();
  const my = scaledMouseY();

  if (mx > x && mx < x + w && my > y && my < y + h) {
    fill(120, 220, 120); cursor(HAND);
  } else {
    fill(100, 200, 100);
  }

  stroke(0); strokeWeight(2);
  rect(x, y, w, h, r);
  fill(0); noStroke(); textSize(14);
  textAlign(CENTER, CENTER);
  text("Salvar\nCombinação", x + w/2, y + h/2);
}



// ---------- Botão finalizar (RESPONSIVO) ----------
function drawBotaoFinalizar() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  if (cartasSalvas.length >= cartas.length && !jogoFinalizado) {
    let x = BASE_W - 180, y = BASE_H - 140, w = 160, h = 50, r = 10;

    if (mx > x && mx < x + w && my > y && my < y + h) {
      fill(255, 170, 170);
      cursor(HAND);
    } else {
      fill(255, 150, 150);
    }

    stroke(0);
    strokeWeight(2);
    rect(x, y, w, h, r);

    fill(0);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text("Finalizar\nJogo", x + w / 2, y + h / 2);
  }
}


// ---------- Timer (RESPONSIVO) ----------
function drawTimer() {
  fill(0);
  textSize(18);
  textAlign(CENTER, CENTER);

  let tempo = jogoFinalizado ? tempoJogo : floor((millis() - tempoInicio) / 1000);
  let m = floor(tempo / 60), s = tempo % 60;

  text(`Tempo: ${nf(m, 2)}:${nf(s, 2)}`, BASE_W - 100, 30);
}


// ---------- Botão Desistir (RESPONSIVO) ----------
function drawBotaoDesistir() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  let x = 30, y = 20, w = 120, h = 40, r = 10;

  if (mx > x && mx < x + w && my > y && my < y + h) {
    fill(255, 120, 120);
    cursor(HAND);
  } else {
    fill(255, 100, 100);
  }

  stroke(0);
  strokeWeight(2);
  rect(x, y, w, h, r);

  fill(0);
  noStroke();
  textSize(13);
  textAlign(CENTER, CENTER);
  text("Desistir", x + w / 2, y + h / 2);
}


// ---------- Função de Reset (Modificada) ----------
function resetarParaInicio() {
  // --- Reset de login/estado ---
  usuario = ""; 
  erroLogin = "";
  historico = [];
  cartasSalvas = [];
  combinacaoAtual = [];
  paginaAtual = 0;
  jogoFinalizado = false;

  // --- Reset do SCROLL ---
  scrollY = 0;
  maxScrollY = 0;

  // --- Seleciona novo grupo de cartas ---
  grupoSelecionado = int(random(grupos.length));
  imagensCartas = grupos[grupoSelecionado]();
  console.log("Novo grupo selecionado:", grupoSelecionado + 1);

  // --- Remove inputs DOM (nome / idade / escolaridade) e botão ---
  if (inputUsuario) {
    inputUsuario.remove();
    inputUsuario = null;
  }
  if (inputIdade) {
    inputIdade.remove();
    inputIdade = null;
  }
  if (inputEscolaridade) {
    inputEscolaridade.remove();
    inputEscolaridade = null;
  }
  if (botaoCriarUsuario) {
    botaoCriarUsuario.remove();
    botaoCriarUsuario = null;
  }
  if (inputEmail) {
  inputEmail.remove();
  inputEmail = null;
}
emailEnviado = false;
erroEmail = "";


  // --- Volta para o início ---
  telaAtual = "inicio";
}
  

// ---------- Progresso (RESPONSIVO) ----------
function drawProgresso() {
  fill(0);
  textAlign(LEFT, TOP);

  let yPos = BASE_H - 100;
  let xPosText = 50;

  textSize(15);
  textStyle(NORMAL);
  text("Combinações\nsalvas: " + historico.length, xPosText, yPos);

  textSize(15);
  textStyle(BOLD);
  text(`Cartas\nSalvas: ${cartasSalvas.length}/${cartas.length}`, xPosText, yPos + 50);

  textStyle(NORMAL);
  textAlign(CENTER, CENTER);
}


// ---------- Navegação (SCROLL) ----------
function drawNavegacao() {
  fill(0);
  textAlign(CENTER, CENTER);

  const topY = 40;

  // Main hint
  textSize(15);
  text("Role para ver mais cartas", BASE_W / 2, topY);

  // Optional: keyboard hint (smaller, calmer)
  textSize(12);
  text("Mouse wheel ou ↑ ↓", BASE_W / 2, topY + 22);

  // -------- Scroll progress bar (subtle but VERY helpful) --------
  if (maxScrollY > 0) {
    const barW = 220;
    const barH = 6;
    const barX = BASE_W / 2 - barW / 2;
    const barY = topY + 42;

    // background
    noStroke();
    fill(220);
    rect(barX, barY, barW, barH, 4);

    // progress
    const progress = constrain(scrollY / maxScrollY, 0, 1);
    fill(100, 180, 255);
    rect(barX, barY, barW * progress, barH, 4);
  }

  textAlign(CENTER, CENTER);
}



// ---------- Tela Configuração (RESPONSIVO) ----------
function drawConfig() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  fill(0);
  textAlign(CENTER, CENTER);

  textSize(25);
  text("Configurações", BASE_W / 2, 60);

  textSize(10);
  text("Gerencie os dados salvos", BASE_W / 2, 100);

  // Exportar
  let x1 = BASE_W / 2 - 150, y1 = 150, w1 = 300, h1 = 60, r1 = 12;

  if (mx > x1 && mx < x1 + w1 && my > y1 && my < y1 + h1) {
    fill(170, 240, 170);
    cursor(HAND);
  } else {
    fill(150, 220, 150);
  }

  stroke(0);
  rect(x1, y1, w1, h1, r1);

  fill(0);
  noStroke();
  textSize(15);
  text("Exportar (CSV)", x1 + w1 / 2, y1 + h1 / 2);

  // Resetar
  let xR = BASE_W / 2 - 150, yR = 230, wR = 300, hR = 60, rR = 12;

  if (mx > xR && mx < xR + wR && my > yR && my < yR + hR) {
    fill(255, 170, 170);
    cursor(HAND);
  } else {
    fill(255, 150, 150);
  }

  stroke(0);
  rect(xR, yR, wR, hR, rR);

  fill(0);
  noStroke();
  textSize(15);
  text("Resetar jogo", xR + wR / 2, yR + hR / 2);

  // Voltar
  let x2 = BASE_W / 2 - 100, y2 = 475, w2 = 200, h2 = 50, r2 = 12;

  if (mx > x2 && mx < x2 + w2 && my > y2 && my < y2 + h2) {
    fill(200, 220, 255);
    cursor(HAND);
  } else {
    fill(180, 200, 250);
  }

  stroke(0);
  rect(x2, y2, w2, h2, r2);

  fill(0);
  noStroke();
  textSize(15);
  text("Voltar", x2 + w2 / 2, y2 + h2 / 2);
}

// ---------- mouseClicked (RESPONSIVO) ----------
function mouseClicked() {
  if (cliqueBloqueado) return;

  const mx = scaledMouseX();
  const my = scaledMouseY();

  if (telaAtual === "config") {
    // Exportar (CSV)
    if (mx > BASE_W / 2 - 150 && mx < BASE_W / 2 + 150 && my > 150 && my < 210) {
      cliqueBloqueado = true;
      setTimeout(() => { cliqueBloqueado = false; }, 500);
      exportarCSVGlobal();
      return;
    }

    // Resetar jogo
    if (mx > BASE_W / 2 - 150 && mx < BASE_W / 2 + 150 && my > 230 && my < 290) {
      cliqueBloqueado = true;
      setTimeout(() => { cliqueBloqueado = false; }, 500);

      let confirmou = confirm(
        "Você tem CERTEZA?\n\nIsso vai apagar o histórico de TODOS os jogadores e não pode ser desfeito.\n\nÉ aconselhado salvar o arquivo CSV antes de apagar o ranking."
      );

      if (confirmou) {
        localStorage.removeItem("historicoJogo");
        historicoGlobal = {};
      }
      return;
    }

    // Voltar
    let x2 = BASE_W / 2 - 100, y2 = 475, w2 = 200, h2 = 50;
    if (mx > x2 && mx < x2 + w2 && my > y2 && my < y2 + h2) {
      telaAtual = "inicio";
      cliqueBloqueado = true;
      setTimeout(() => { cliqueBloqueado = false; }, 300);
      return;
    }
  }

  // if (telaAtual === "rank") {
  //   if (mx > BASE_W / 2 - 100 && mx < BASE_W / 2 + 100 && my > 500 && my < 550) {
  //     telaAtual = "inicio";
  //     cliqueBloqueado = true;
  //     setTimeout(() => { cliqueBloqueado = false; }, 300);
  //   }
  // }
}


// ---------- Tela Ranking (RESPONSIVO) ----------
function drawRank() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("🏆 Ranking", BASE_W / 2, 60);

  textSize(16);

  // Estado: carregando
  if (!rankingCarregado) {
    text("Carregando ranking...", BASE_W / 2, BASE_H / 2);
    return;
  }

  // Estado: erro
  if (rankingErro) {
    fill(255, 0, 0);
    text("Erro ao carregar ranking", BASE_W / 2, BASE_H / 2);
    fill(0);
    // (não retorna; pode continuar e mostrar vazio, se quiser)
  }

  // Estado: ranking vazio
  if (ranking.length === 0) {
    text("Nenhuma partida registrada ainda", BASE_W / 2, BASE_H / 2);
  }

  // Exibir ranking
  textAlign(CENTER, CENTER);
  for (let i = 0; i < ranking.length; i++) {
    let h = ranking[i];
    text(`${i + 1}. ${h.usuario} - ${h.tempo}s`, BASE_W / 2, 110 + i * 30);
  }

  // Botão Voltar
  let x = BASE_W / 2 - 100;
  let y = 500;
  let w = 200;
  let hBtn = 50;
  let r = 12;

  if (mx > x && mx < x + w && my > y && my < y + hBtn) {
    fill(200, 220, 255);
    cursor(HAND);
  } else {
    fill(180, 200, 250);
  }

  rect(x, y, w, hBtn, r);

  fill(0);
  noStroke();
  textSize(15);
  text("Voltar", x + w / 2, y + hBtn / 2);
}


// ---------- ENVIAR DADOS PARA WEBHOOK  ----------
function enviarPartidaWebhook(partida) {
  console.log("🚀 FUNÇÃO DE WEBHOOK CHAMADA", partida);
  fetch("https://hook.eu2.make.com/crtzs9hb4c3wq4i37m57lbwnhi62wqbu", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(partida)
  })
  .then(() => console.log("Partida enviada com sucesso"))
  .catch(err => console.error("Erro ao enviar", err));
}

// ---------- Salvar histórico localmente  ----------
// BACKUP LOCAL (não é mais a fonte oficial)
function salvarHistoricoLocal(){
  localStorage.setItem(
    "historicoJogo_backup",
    JSON.stringify(historicoGlobal)
  );
}


// ---------- Carregar histórico local  ----------
function carregarHistoricoLocal(){
  let dados = localStorage.getItem("historicoJogo_backup");
  if(dados){
    try {
      historicoGlobal = JSON.parse(dados);
    } catch {
      historicoGlobal = {};
    }
  }
}


// ---------- Exportar CSV (Revertido) ----------
function exportarCSVGlobal(){
  // MODIFICAÇÃO: Novos campos no CSV
  let csv = "id_usuario,usuario,data,tempo_total,grupo,numero_combinacao,cartas_combinacao\n";
  
  for(let usuario in historicoGlobal) {
    if(Array.isArray(historicoGlobal[usuario])) {
      historicoGlobal[usuario].forEach(partida => {
        if(partida.combinacoes && Array.isArray(partida.combinacoes)) {
          partida.combinacoes.forEach(comb => {
            let cartasStr = comb.cartas.join(", ");
            csv += `${partida.id_usuario},${usuario},${partida.data},${partida.tempo},${partida.grupo},${comb.numero},"[${cartasStr}]"\n`;
          });
        }
      });
    }
  }
  
  let blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  let url = URL.createObjectURL(blob);
  let a = createA(url,"historico_completo.csv");
  a.attribute("download","historico_completo.csv"); a.hide(); a.elt.click();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateUIScale();
  applyUITransform();
}


function scaledMouseX() {
  return (mouseX - offsetX) / uiScale;
}

function scaledMouseY() {
  return (mouseY - offsetY) / uiScale;
}

function toScreenX(vx) {
  return offsetX + vx * uiScale;
}

function toScreenY(vy) {
  return offsetY + vy * uiScale;
}  

function applyUITransform() {
  if (uiLayer) {
    uiLayer.style('transform', `translate(${offsetX}px, ${offsetY}px) scale(${uiScale})`);
  }
}



function getMenuLayout() {
  const w = 240;      // button width
  const h = 60;       // button height
  const r = 12;       // corner radius
  const x = BASE_W / 2 - w / 2;

  // Move the whole button stack down (this is the important part)
  // You can tweak 260 to taste.
  const y1 = 260;
  const gap = 80;

  return {
    x, w, h, r,
    y1,
    y2: y1 + gap,
    y3: y1 + gap * 2
  };
}

function getGridBounds() {
  // These must match your drawCartasPagina layout:
  const colunas = 3;
  const cardW = 225;
  const gapX = 25;

  const gridW = colunas * cardW + (colunas - 1) * gapX;
  const xLeft = (BASE_W - gridW) / 2;

  return { xLeft, gridW, xRight: xLeft + gridW };
}

function calcularPerfilCognitivo() {
  if (!historico || historico.length === 0) return null;

  const tamanhos = historico.map(h => h.cartas.length);
  const media = tamanhos.reduce((a,b) => a + b, 0) / tamanhos.length;

  return media >= 4 ? "lumper" : "splitter";
}

// --- helper: wrap text into lines that fit a width ---
function wrapTextLines(str, maxW) {
  const paragraphs = String(str).split("\n");
  const lines = [];

  for (const p of paragraphs) {
    // blank line => keep a spacer line
    if (p.trim() === "") {
      lines.push("");
      continue;
    }

    const words = p.split(/\s+/);
    let line = "";

    for (const w of words) {
      const test = line ? (line + " " + w) : w;
      if (textWidth(test) <= maxW) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = w;
      }
    }
    if (line) lines.push(line);
  }

  return lines;
}

function drawWrappedText(str, x, y, maxW, leading) {
  const lines = wrapTextLines(str, maxW);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x, y + i * leading);
  }
  return lines.length * leading; // height used
}

function enviarEmailPesquisa(email) {
  fetch("https://hook.eu2.make.com/8h7rb0mijbsk7ama1oqvtgfw3cvuu0oi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      origem: "jogo_assovios_golfinhos",
      data: new Date().toISOString()
    })
  })
  .then(() => {
    emailEnviado = true;
    erroEmail = "";
  })
  .catch(() => {
    erroEmail = "Erro ao enviar. Tente novamente.";
  });
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ---------------------------
// TOUCH SUPPORT (mobile)
// - Drag inside scroll area = scroll
// - Tap inside scroll area = select card
// ---------------------------
function touchStarted(event) {
  // ✅ Login screen (tela jogo, mas ainda sem usuário):
  // Let the browser focus the inputs (DON'T block default).
  if (telaAtual === "jogo" && !usuario) {
    return true;
  }

  // For non-game screens, just reuse your click logic
  if (telaAtual !== "jogo" || !usuario) {
    mousePressed();
    return false;
  }

  const my = scaledPointerY();

  // Only treat as scroll if touch begins inside the card scroll region
  const clipTop = 90;
  const clipBottom = GRID_BOTTOM_RESERVED;
  const inScrollArea = (my >= clipTop && my <= BASE_H - clipBottom);

  if (!inScrollArea) {
    // Tap on buttons/panel/etc
    mousePressed();
    return false;
  }

  // Start scrolling (or tap candidate)
  isTouchScrolling = true;
  lastTouchY = my;
  touchStartY = my;
  touchStartScrollY = scrollY;

  return false; // prevent page scroll
}

function touchMoved() {
  if (!isTouchScrolling) return false;

  const my = scaledPointerY();
  const dy = my - lastTouchY;

  // drag up => content moves down
  scrollY = constrain(scrollY - dy, 0, maxScrollY);

  lastTouchY = my;
  return false; // stop browser scrolling
}

function touchEnded() {
  if (!isTouchScrolling) return false;

  const my = scaledPointerY();
  const moved = Math.abs(my - touchStartY);

  // ✅ End scrolling mode FIRST so mousePressed can work
  isTouchScrolling = false;

  // If it was basically a tap, treat it like a click (select card)
  const TAP_THRESHOLD = 10; // px in BASE coords (tweak 8–14 if needed)
  if (moved <= TAP_THRESHOLD) {
    mousePressed();
    return false;
  }

  // If it was a real scroll, block the “ghost click” some mobiles fire after touch
  cliqueBloqueado = true;
  setTimeout(() => (cliqueBloqueado = false), 140);

  return false;
}


function pointerX() {
  // If touching, use touchX; otherwise use mouseX
  return (touches && touches.length) ? touches[0].x : mouseX;
}

function pointerY() {
  return (touches && touches.length) ? touches[0].y : mouseY;
}

function scaledPointerX() {
  return (pointerX() - offsetX) / uiScale;
}

function scaledPointerY() {
  return (pointerY() - offsetY) / uiScale;
}

