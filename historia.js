// ---------- historia.js - Tela de história + tutorial ----------

let historiaAtual = 0;
let imagensHistoria = [];
let imgsMobile = {};   // imagens usadas no layout de celular em pé

function preloadHistoria() {
  // Ajuste os nomes aqui se os seus forem diferentes
  const caminhos = [
    "ImagensFundo/TelaHistoria1.png",
    "ImagensFundo/TelaHistoria2.png",
    "ImagensFundo/TelaHistoria3.png",
    "ImagensFundo/TelaHistoria4.png",
    "ImagensFundo/TelaHistoria5.png",
    "ImagensFundo/TelaHistoria6.png",
    "ImagensFundo/TelaHistoria7.png",
    "ImagensFundo/TelaHistoria8.png"
  ];

  imagensHistoria = caminhos.map(p => loadImage(p));

}

// Imagens do layout de celular / idiomas: carregadas no setup (não travam o jogo se faltarem)
let imgsIdioma = {};

function carregarImagensMobile() {
  imgsMobile = {
    menuGolfinho:  loadImage("ImagensMobile/menu_golfinho.png"),
    menuTitulo:    loadImage("ImagensMobile/menu_titulo.png"),
    golfinhoH:     loadImage("ImagensMobile/golfinho_h.png"),
    golfinhoV:     loadImage("ImagensMobile/golfinho_v.png"),
    golfinhoD:     loadImage("ImagensMobile/golfinho_d.png"),
    cartaHistoria: loadImage("ImagensMobile/story_card.png")
  };
}

// Tutoriais (prints do jogo) de cada idioma: "m" = celular em pé, "d" = computador (só en/es)
function carregarImagensIdioma(l) {
  if (imgsIdioma[l]) return;
  const o = {};
  for (let n = 1; n <= 4; n++) {
    o["tut" + n + "m"] = loadImage(`ImagensMobile/tutorial_${l}_${n}.png`);
    if (l !== "pt") o["tut" + n + "d"] = loadImage(`ImagensIdioma/desktop_${l}_${n}.png`);
  }
  imgsIdioma[l] = o;
}

function getFiguraImg(key) {
  if (!key) return null;
  if (key === "cartaHistoria") return imgsMobile.cartaHistoria;
  const o = imgsIdioma[lang];
  return o ? o[key + (modoMobile ? "m" : "d")] : null;
}

function drawHistoria() {
  if (modoMobile) { drawHistoriaMobile(); return; }
  textFont(myFont);

  // Fundo - usa a imagem correspondente à página atual
  if (lang !== "pt") {
    drawHistoriaIdiomaDesktop();
  } else if (imagensHistoria[historiaAtual]) {
    image(imagensHistoria[historiaAtual], 0, 0, BASE_W, BASE_H);
  } else {
    background(255);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("Imagem da história não encontrada.", BASE_W / 2, BASE_H / 2);
  }

  // Navegação
  drawNavegacaoHistoria();

  // Botão Começar (só na última página)
  if (historiaAtual === imagensHistoria.length - 1) {
    drawBotaoComecar();
  }

  // Indicador de página
  fill(0);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`${historiaAtual + 1} / ${imagensHistoria.length}`, BASE_W / 2, BASE_H - 15);
}

function drawBotaoComecar() {
  let btnW = 150;
  let btnH = 44;
  let btnX = BASE_W / 2 - btnW / 2;
  let btnY = BASE_H - 150;

  if (scaledMouseX() > btnX && scaledMouseX() < btnX + btnW && scaledMouseY() > btnY && scaledMouseY() < btnY + btnH) {
    fill(100, 220, 100);
    cursor(HAND);
  } else {
    fill(100, 200, 100);
  }

  stroke(0);
  strokeWeight(2);
  rect(btnX, btnY, btnW, btnH, 10);

  fill(0);
  noStroke();
  textFont(myFont);
  textSize(12);
  textAlign(CENTER, CENTER);
  textSize(ajustarTexto(t("navComecar"), btnW - 16, 12));
  text(t("navComecar"), btnX + btnW / 2, btnY + btnH / 2);
}

function drawNavegacaoHistoria() {
  const mx = scaledMouseX();
  const my = scaledMouseY();

  let yBotoes = BASE_H - 80;

  // Botão Cancelar (volta para tela inicial)
  let xCancelar = 40;
  if (mx > xCancelar && mx < xCancelar + 110 && my > yBotoes && my < yBotoes + 40) {
    fill(255, 120, 120, 220);
    cursor(HAND);
  } else {
    fill(255, 100, 100, 200);
  }
  stroke(0);
  strokeWeight(2);
  rect(xCancelar, yBotoes, 110, 40, 10);
  fill(0);
  noStroke();
  textSize(12);
  textAlign(CENTER, CENTER);
  textSize(ajustarTexto(t("navCancelar"), 100, 12));
  text(t("navCancelar"), xCancelar + 55, yBotoes + 20);

  // Botão Anterior
  if (historiaAtual > 0) {
    let xAnterior = BASE_W / 2 - 140;
    if (mx > xAnterior && mx < xAnterior + 110 && my > yBotoes && my < yBotoes + 40) {
      fill(120, 220, 255, 220);
      cursor(HAND);
    } else {
      fill(100, 200, 250, 200);
    }
    stroke(0);
    strokeWeight(2);
    rect(xAnterior, yBotoes, 110, 40, 10);
    fill(0);
    noStroke();
    textSize(ajustarTexto(t("navAnterior"), 100, 12));
    text(t("navAnterior"), xAnterior + 55, yBotoes + 20);
  }

  // Botão Próximo
  if (historiaAtual < imagensHistoria.length - 1) {
    let xProximo = BASE_W / 2 + 30;
    if (mx > xProximo && mx < xProximo + 110 && my > yBotoes && my < yBotoes + 40) {
      fill(120, 220, 255, 220);
      cursor(HAND);
    } else {
      fill(100, 200, 250, 200);
    }
    stroke(0);
    strokeWeight(2);
    rect(xProximo, yBotoes, 110, 40, 10);
    fill(0);
    noStroke();
    textSize(ajustarTexto(t("navProximo"), 100, 12));
    text(t("navProximo"), xProximo + 55, yBotoes + 20);
  }

  // Botão Pular (vai direto para o jogo)
  let xPular = BASE_W - 150;
  if (mx > xPular && mx < xPular + 110 && my > yBotoes && my < yBotoes + 40) {
    fill(255, 220, 100, 220);
    cursor(HAND);
  } else {
    fill(255, 200, 80, 200);
  }
  stroke(0);
  strokeWeight(2);
  rect(xPular, yBotoes, 110, 40, 10);
  fill(0);
  noStroke();
  textSize(ajustarTexto(t("navPular"), 100, 12));
  text(t("navPular"), xPular + 55, yBotoes + 20);
}

function mousePressedHistoria() {
  if (modoMobile) return mousePressedHistoriaMobile();
  const mx = scaledMouseX();
  const my = scaledMouseY();

  let yBotoes = BASE_H - 80;

  // Cancelar
  let xCancelar = 40;
  if (mx > xCancelar && mx < xCancelar + 110 && my > yBotoes && my < yBotoes + 40) {
    telaAtual = "inicio";
    resetarHistoria();
    return true;
  }

  // Anterior
  if (historiaAtual > 0) {
    let xAnterior = BASE_W / 2 - 140;
    if (mx > xAnterior && mx < xAnterior + 110 && my > yBotoes && my < yBotoes + 40) {
      historiaAtual--;
      return true;
    }
  }

  // Próximo
  if (historiaAtual < imagensHistoria.length - 1) {
    let xProximo = BASE_W / 2 + 30;
    if (mx > xProximo && mx < xProximo + 110 && my > yBotoes && my < yBotoes + 40) {
      historiaAtual++;
      return true;
    }
  }

  // Pular
  let xPular = BASE_W - 150;
  if (mx > xPular && mx < xPular + 110 && my > yBotoes && my < yBotoes + 40) {
    iniciarJogo();
    return true;
  }

  // Começar (só na última página)
  if (historiaAtual === imagensHistoria.length - 1) {
    let btnW = 150;
    let btnH = 44;
    let btnX = BASE_W / 2 - btnW / 2;
    let btnY = BASE_H - 150;

    if (mx > btnX && mx < btnX + btnW && my > btnY && my < btnY + btnH) {
      iniciarJogo();
      return true;
    }
  }

  return false;
}

function iniciarJogo() {
  scrollY = 0;
  maxScrollY = 0; // optional but clean
  telaAtual = "jogo";
}


function resetarHistoria() {
  historiaAtual = 0;
}

function keyPressedHistoria() {
  if (telaAtual === "historia") {
    if (modoMobile) {
      // mesmas teclas, usando o total de páginas do layout de celular
      if (keyCode === LEFT_ARROW && historiaAtual > 0) { historiaAtual--; return true; }
      if (keyCode === RIGHT_ARROW && historiaAtual < HISTORIA_MOBILE.length - 1) { historiaAtual++; return true; }
      if (keyCode === ENTER && historiaAtual === HISTORIA_MOBILE.length - 1) { iniciarJogo(); return true; }
      return false;
    }
    if (keyCode === LEFT_ARROW && historiaAtual > 0) {
      historiaAtual--;
      return true;
    } else if (keyCode === RIGHT_ARROW && historiaAtual < imagensHistoria.length - 1) {
      historiaAtual++;
      return true;
    } else if (keyCode === ENTER && historiaAtual === imagensHistoria.length - 1) {
      iniciarJogo();
      return true;
    }
  }
  return false;
}

// =====================================================================
// HISTÓRIA - layout de celular em pé (texto desenhado no código para
// ficar grande; golfinho/figuras vêm da pasta ImagensMobile)
// =====================================================================
// Metadados das 8 páginas (textos ficam em idioma.js -> HISTORIA_TEXTOS)
const HISTORIA_MOBILE = [
  { golfinho: "H", figura: null },
  { golfinho: "H", figura: null },
  { golfinho: "D", figura: "cartaHistoria", figW: 420 },
  { golfinho: "V", figura: "tut1" },
  { golfinho: "V", figura: "tut2" },
  { golfinho: "V", figura: "tut3" },
  { golfinho: "D", figura: "tut4" },
  { golfinho: "H", figura: null }
];

function glHistNav() {
  const H = BASE_H;
  return {
    anterior: { x: 30,  y: H - 190, w: 280, h: 64 },
    proximo:  { x: 330, y: H - 190, w: 280, h: 64 },
    cancelar: { x: 30,  y: H - 110, w: 190, h: 56 },
    pular:    { x: 420, y: H - 110, w: 190, h: 56 }
  };
}

function layoutHistoriaMobile(p) {
  textFont(myFont);
  const availTop = 24;
  const availBottom = BASE_H - 200;
  const avail = availBottom - availTop;

  const dolImg = { H: imgsMobile.golfinhoH, V: imgsMobile.golfinhoV, D: imgsMobile.golfinhoD }[p.golfinho];
  const dolH = { H: 150, V: 210, D: 160 }[p.golfinho];
  const dolW = (dolImg && dolImg.width > 1) ? dolImg.width * dolH / dolImg.height : dolH;

  const fig = getFiguraImg(p.figura);
  const figOk = fig && fig.width > 1;
  let figW = figOk ? Math.min(p.figW || 560, 560) : 0;
  let figH = figOk ? fig.height * figW / fig.width : 0;

  const padB = 26;
  const bubbleW = 592;
  const maxW = bubbleW - padB * 2;
  const tail = 26;
  const gap = 22;

  let size = 20, lead = 31, lines = [], bubbleH = 0, total = 0;
  for (size = 20; size >= 13; size--) {
    textSize(size);
    lead = Math.round(size * 1.55);
    lines = wrapTextLines(textoHistoria(historiaAtual, true), maxW);
    bubbleH = lines.length * lead + padB * 2;
    total = (figOk ? figH + gap : 0) + bubbleH + tail + dolH;
    if (total <= avail) break;
  }
  if (size < 13) size = 13;

  // se ainda não couber, reduz a figura
  if (total > avail && figOk) {
    const excesso = total - avail;
    const novoH = Math.max(figH * 0.5, figH - excesso);
    figW = figW * (novoH / figH);
    figH = novoH;
    total = figH + gap + bubbleH + tail + dolH;
  }

  const y0 = availTop + Math.max(0, (avail - total) / 2);
  const figY = y0;
  const bubbleY = y0 + (figOk ? figH + gap : 0);

  return { size, lead, lines, bubbleW, bubbleH, bubbleX: (BASE_W - bubbleW) / 2, bubbleY,
           padB, tail, fig: figOk ? fig : null, figW, figH, figY,
           dolImg, dolW, dolH, dolX: 40, dolY: bubbleY + bubbleH + tail - 8 };
}

function drawHistoriaMobile() {
  const mx = scaledMouseX();
  const my = scaledMouseY();
  const ultima = historiaAtual === HISTORIA_MOBILE.length - 1;
  const p = HISTORIA_MOBILE[historiaAtual];
  const L = layoutHistoriaMobile(p);

  textFont(myFont);
  if (imgFundo) image(imgFundo, 0, 0, BASE_W, BASE_H); else background(255);

  // figura
  if (L.fig) image(L.fig, BASE_W / 2 - L.figW / 2, L.figY, L.figW, L.figH);

  // balão + rabinho
  noStroke();
  fill(255);
  rect(L.bubbleX, L.bubbleY, L.bubbleW, L.bubbleH, 28);
  const tx = L.dolX + 70;
  triangle(tx - 6, L.bubbleY + L.bubbleH - 2, tx + 34, L.bubbleY + L.bubbleH - 2, tx - 6, L.bubbleY + L.bubbleH + L.tail);

  // texto
  fill(0);
  textAlign(CENTER, TOP);
  textSize(L.size);
  for (let i = 0; i < L.lines.length; i++) {
    if (L.lines[i] !== "") text(L.lines[i], BASE_W / 2, L.bubbleY + L.padB + i * L.lead);
  }

  // golfinho
  if (L.dolImg && L.dolImg.width > 1) image(L.dolImg, L.dolX, L.dolY, L.dolW, L.dolH);

  // navegação
  const N = glHistNav();
  const botao = (r, rotulo, cor, corHover) => {
    const sobre = mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h;
    if (sobre) cursor(HAND);
    fill(...(sobre ? corHover : cor));
    stroke(0);
    strokeWeight(2);
    rect(r.x, r.y, r.w, r.h, 12);
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(ajustarTexto(rotulo, r.w - 16, 16));
    text(rotulo, r.x + r.w / 2, r.y + r.h / 2);
  };

  botao(N.cancelar, t("navCancelar"), [255, 100, 100], [255, 120, 120]);
  botao(N.pular, t("navPular"), [255, 200, 80], [255, 220, 100]);
  if (historiaAtual > 0) botao(N.anterior, t("navAnterior"), [100, 200, 250], [120, 220, 255]);
  if (!ultima) botao(N.proximo, t("navProximo"), [100, 200, 250], [120, 220, 255]);
  else botao(N.proximo, t("navComecar"), [100, 220, 100], [120, 235, 120]);

  fill(0);
  noStroke();
  textSize(14);
  textAlign(CENTER, CENTER);
  text(`${historiaAtual + 1} / ${HISTORIA_MOBILE.length}`, BASE_W / 2, BASE_H - 82);
}

function mousePressedHistoriaMobile() {
  const mx = scaledMouseX();
  const my = scaledMouseY();
  const N = glHistNav();
  const dentro = (r) => mx > r.x && mx < r.x + r.w && my > r.y && my < r.y + r.h;
  const ultima = historiaAtual === HISTORIA_MOBILE.length - 1;

  if (dentro(N.cancelar)) {
    telaAtual = "inicio";
    resetarHistoria();
    return true;
  }
  if (dentro(N.pular)) {
    iniciarJogo();
    return true;
  }
  if (historiaAtual > 0 && dentro(N.anterior)) {
    historiaAtual--;
    return true;
  }
  if (dentro(N.proximo)) {
    if (!ultima) historiaAtual++;
    else iniciarJogo();
    return true;
  }
  return false;
}

// =====================================================================
// HISTÓRIA - computador, em inglês/espanhol (texto desenhado no código)
// O português continua usando as imagens originais (TelaHistoria1..8.png)
// =====================================================================
function drawHistoriaIdiomaDesktop() {
  const p = HISTORIA_MOBILE[historiaAtual];
  const texto = textoHistoria(historiaAtual, false);
  textFont(myFont);

  if (imgFundo) image(imgFundo, 0, 0, BASE_W, BASE_H); else background(255);

  const comFig = !!p.figura;
  const fig = getFiguraImg(p.figura);
  const figOk = fig && fig.width > 1;

  const dolImg = { H: imgsMobile.golfinhoH, V: imgsMobile.golfinhoV, D: imgsMobile.golfinhoD }[p.golfinho];
  const dolH = (comFig ? { H: 190, V: 250, D: 200 } : { H: 230, V: 300, D: 240 })[p.golfinho];
  const dolOk = dolImg && dolImg.width > 1;
  const dolW = dolOk ? dolImg.width * dolH / dolImg.height : dolH;

  const availBottom = BASE_H - 165;                 // deixa livre a área dos botões
  const bubbleW = comFig ? 620 : 860;
  const bubbleX = comFig ? 40 : BASE_W - 60 - bubbleW;
  const bubbleY = comFig ? 40 : 80;
  const padB = 30, tail = 34;
  const maxW = bubbleW - padB * 2;
  const maxBubbleH = comFig ? (availBottom - bubbleY - tail - dolH + 24) : (availBottom - bubbleY);

  let size = 24, lead = 36, linhas = [], bubbleH = 0;
  for (size = 24; size >= 14; size--) {
    textSize(size);
    lead = Math.round(size * 1.5);
    linhas = wrapTextLines(texto, maxW);
    bubbleH = linhas.length * lead + padB * 2;
    if (bubbleH <= maxBubbleH) break;
  }
  if (size < 14) size = 14;

  // posição do golfinho + rabinho do balão
  noStroke();
  fill(255);
  rect(bubbleX, bubbleY, bubbleW, bubbleH, 30);

  let dolX, dolY;
  if (comFig) {
    dolX = 60;
    dolY = bubbleY + bubbleH + tail - 10;
    const tx = dolX + dolW * 0.45;
    triangle(tx - 10, bubbleY + bubbleH - 2, tx + 36, bubbleY + bubbleH - 2, tx - 10, bubbleY + bubbleH + tail);
  } else {
    dolX = 40;
    // golfinho perto da base do balão (balão curto = golfinho mais alto)
    dolY = Math.min(availBottom - dolH, Math.max(bubbleY + 60, bubbleY + bubbleH - dolH * 0.45));
    const bTop = Math.max(bubbleY + 24, bubbleY + bubbleH - 78);
    triangle(bubbleX + 2, bTop, bubbleX + 2, bTop + 52, dolX + dolW * 0.9, dolY + dolH * 0.25);
  }

  // texto
  fill(0);
  textAlign(CENTER, TOP);
  textSize(size);
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i] !== "") text(linhas[i], bubbleX + bubbleW / 2, bubbleY + padB + i * lead);
  }

  if (dolOk) image(dolImg, dolX, dolY, dolW, dolH);

  // figura (prints do jogo no idioma escolhido)
  if (figOk) {
    const boxX = 700, boxY = 60, boxW = 660, boxH = availBottom - 60;
    const esc = Math.min(boxW / fig.width, boxH / fig.height, 1.5);
    const fw = fig.width * esc, fh = fig.height * esc;
    image(fig, boxX + (boxW - fw) / 2, boxY + (boxH - fh) / 2, fw, fh);
  }
}
