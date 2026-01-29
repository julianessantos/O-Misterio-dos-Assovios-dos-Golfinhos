// ---------- historia.js - Tela de história + tutorial ----------

let historiaAtual = 0;
let imagensHistoria = [];

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

function drawHistoria() {
  textFont(myFont);

  // Fundo - usa a imagem correspondente à página atual
  if (imagensHistoria[historiaAtual]) {
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
  text("COMEÇAR", btnX + btnW / 2, btnY + btnH / 2);
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
  text("Cancelar", xCancelar + 55, yBotoes + 20);

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
    text("Anterior", xAnterior + 55, yBotoes + 20);
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
    text("Próximo", xProximo + 55, yBotoes + 20);
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
  text("Pular", xPular + 55, yBotoes + 20);
}

function mousePressedHistoria() {
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
