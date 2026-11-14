// ---------- idioma.js - idiomas (Português / English / Español) ----------
//
// Como funciona:
//  - O idioma começa em português (comportamento original).
//  - Pode ser escolhido pelos botões do menu inicial, ou por link:
//      .../index.html?lang=es   (ou ?lang=en, ?lang=pt)
//    Útil para gerar QR codes por idioma em congressos.
//  - A última escolha fica salva no navegador.
//  - Para mudar um texto, edite o dicionário I18N abaixo.

const IDIOMAS = ["pt", "en", "es"];
const IDIOMA_ROTULOS = { pt: "Português", en: "English", es: "Español" };

// Se true, o webhook da partida passa a enviar também o campo "idioma"
// (pt / en / es). Fica false para o conteúdo enviado continuar IDÊNTICO ao original.
const ENVIAR_IDIOMA_NO_WEBHOOK = false;

let lang = "pt";

function aplicarIdiomaNaPagina() {
  try {
    document.documentElement.lang = { pt: "pt-br", en: "en", es: "es" }[lang];
    document.title = I18N[lang].tituloPagina;
  } catch (e) {}
}

function setLang(novo) {
  if (!IDIOMAS.includes(novo)) return;
  lang = novo;
  try { window.localStorage.setItem("idioma", novo); } catch (e) {}
  aplicarIdiomaNaPagina();
  if (typeof carregarImagensIdioma === "function") carregarImagensIdioma(novo);
}

// t("chave", { n: 3 })  ->  texto no idioma atual (cai para português se faltar)
function t(chave, vars) {
  let s = (I18N[lang] && I18N[lang][chave] !== undefined) ? I18N[lang][chave] : I18N.pt[chave];
  if (s === undefined) return chave;
  if (vars) {
    for (const k in vars) s = s.split("{" + k + "}").join(vars[k]);
  }
  return s;
}

// Diminui o tamanho da fonte até o texto (linha mais larga) caber em maxW.
// Usa a fonte atual do p5. Devolve o tamanho escolhido (e já o aplica).
function ajustarTexto(str, maxW, base) {
  let s = base;
  textSize(s);
  const linhas = String(str).split("\n");
  const larg = () => Math.max(...linhas.map(l => textWidth(l)));
  while (s > 8 && larg() > maxW) {
    s -= 1;
    textSize(s);
  }
  return s;
}

const I18N = {
  // ====================================================== PORTUGUÊS
  pt: {
    tituloPagina: "O Mistério dos Assovios dos Golfinhos",
    iniciarJogo: "Iniciar Jogo",
    creditos: "Desenvolvido por: Julia Forli, Juliane Santos e Francisco Figueiredo",
    tituloMenu: "O Mistério dos Assovios dos Golfinhos",

    loginTitulo: "Insira seu nome para começar",
    phNome: "Digite seu nome",
    phIdade: "Digite sua idade",
    phEscolaridade: "Digite sua escolaridade",
    comecar: "Começar",
    erroNome: "Por favor, insira um nome.",
    erroIdade: "Por favor, insira uma idade válida.",
    erroEscolaridade: "Por favor, digite sua escolaridade.",
    erroCriar: "Erro ao criar usuário. Tente novamente.",

    combAtual: "Combinação Atual",
    selecioneCartas: "Selecione cartas\npara montar um grupo",
    cliqueMiniatura: "Clique numa miniatura\npara remover",
    semGrupo: "Carta\nsem grupo",
    limpar: "Limpar\nSeleção",
    salvar: "Salvar\nCombinação",
    finalizar: "Finalizar\nJogo",
    selTodas: "Selecionar todas restantes ({n})",
    desistir: "Desistir",
    tempo: "Tempo",
    combSalvas: "Combinações\nsalvas: {n}",
    cartasSalvas: "Cartas\nSalvas: {n}",
    dicaRolar: "Role para ver mais cartas",
    dicaDeslizar: "Deslize para ver mais cartas",
    dicaMouse: "Mouse wheel ou ↑ ↓",

    navCancelar: "Cancelar",
    navAnterior: "Anterior",
    navProximo: "Próximo",
    navPular: "Pular",
    navComecar: "COMEÇAR",

    fimTitulo: "Obrigada por participar!",
    seuResultado: "Seu resultado",
    fimExplicacao:
      "Em atividades como esta, existem duas estratégias principais de organização: lumpers e splitters.\n\n" +
      "Lumpers são aqueles que criam poucos grupos, porém maiores, percebendo padrões amplos e semelhanças gerais antes dos detalhes. " +
      "Esse tipo de pensamento ajuda a identificar estruturas maiores e relações mais globais.\n\n" +
      "Splitters são aqueles que criam muitos grupos, porém menores, percebendo diferenças sutis e detalhes finos com muita clareza. " +
      "Esse tipo de pensamento é essencial para identificar pequenas variações dentro de sistemas complexos.",
    fimLumper:
      "Com base nas suas escolhas, você tende a usar uma estratégia do tipo LUMPER.\n\n" +
      "Isso significa que você percebe padrões amplos e conexões gerais com facilidade.",
    fimSplitter:
      "Com base nas suas escolhas, você tende a usar uma estratégia do tipo SPLITTER.\n\n" +
      "Isso significa que você percebe diferenças sutis e detalhes finos com muita clareza.",
    fimNenhum:
      "Com base nas suas escolhas, não foi possível identificar um estilo com segurança.",
    fimFechamento:
      "Estes estilos refletem formas diferentes de perceber e organizar padrões. " +
      "Na ciência, ambos são importantes e complementares.\n\n" +
      "Obrigada por contribuir com a pesquisa —\n" +
      "e por ajudar os golfinhos 💙",
    resumo: "Usuário: {u}  •  Tempo: {t}  •  Combinações: {c}",
    emailIntro: "Se quiser receber os resultados desta pesquisa no futuro,\ndeixe seu e-mail abaixo (opcional):",
    emailIntroM: "Se quiser receber os resultados desta pesquisa no futuro, deixe seu e-mail abaixo (opcional):",
    phEmail: "seuemail@exemplo.com",
    enviarEmail: "Enviar e-mail",
    emailObrigado: "Obrigada! 💙\nEnviaremos nossos achados :)",
    emailObrigadoM: "Obrigada!\nEnviaremos nossos achados :)",
    emailInvalido: "Por favor, insira um e-mail válido.",
    emailErro: "Erro ao enviar. Tente novamente.",
    voltarInicio: "Voltar ao Início"
  },

  // ====================================================== ENGLISH
  en: {
    tituloPagina: "The Mystery of the Dolphin Whistles",
    iniciarJogo: "Start Game",
    creditos: "Developed by: Julia Forli, Juliane Santos and Francisco Figueiredo",
    tituloMenu: "The Mystery of the Dolphin Whistles",

    loginTitulo: "Enter your name to start",
    phNome: "Enter your name",
    phIdade: "Enter your age",
    phEscolaridade: "Enter your education level",
    comecar: "Start",
    erroNome: "Please enter a name.",
    erroIdade: "Please enter a valid age.",
    erroEscolaridade: "Please enter your education level.",
    erroCriar: "Error creating user. Please try again.",

    combAtual: "Current Combination",
    selecioneCartas: "Select cards\nto build a group",
    cliqueMiniatura: "Click a thumbnail\nto remove it",
    semGrupo: "Card with\nno group",
    limpar: "Clear\nSelection",
    salvar: "Save\nCombination",
    finalizar: "Finish\nGame",
    selTodas: "Select all remaining ({n})",
    desistir: "Give up",
    tempo: "Time",
    combSalvas: "Saved\ncombinations: {n}",
    cartasSalvas: "Saved\ncards: {n}",
    dicaRolar: "Scroll to see more cards",
    dicaDeslizar: "Swipe to see more cards",
    dicaMouse: "Mouse wheel or ↑ ↓",

    navCancelar: "Cancel",
    navAnterior: "Previous",
    navProximo: "Next",
    navPular: "Skip",
    navComecar: "START",

    fimTitulo: "Thank you for participating!",
    seuResultado: "Your result",
    fimExplicacao:
      "In activities like this, there are two main organizing strategies: lumpers and splitters.\n\n" +
      "Lumpers are those who create few, larger groups, noticing broad patterns and general similarities before the details. " +
      "This kind of thinking helps identify larger structures and more global relationships.\n\n" +
      "Splitters are those who create many, smaller groups, noticing subtle differences and fine details with great clarity. " +
      "This kind of thinking is essential for identifying small variations within complex systems.",
    fimLumper:
      "Based on your choices, you tend to use a LUMPER strategy.\n\n" +
      "This means you easily perceive broad patterns and general connections.",
    fimSplitter:
      "Based on your choices, you tend to use a SPLITTER strategy.\n\n" +
      "This means you perceive subtle differences and fine details with great clarity.",
    fimNenhum:
      "Based on your choices, it was not possible to identify a style with confidence.",
    fimFechamento:
      "These styles reflect different ways of perceiving and organizing patterns. " +
      "In science, both are important and complementary.\n\n" +
      "Thank you for contributing to the research —\n" +
      "and for helping the dolphins 💙",
    resumo: "User: {u}  •  Time: {t}  •  Combinations: {c}",
    emailIntro: "If you would like to receive the results of this research in the future,\nleave your e-mail below (optional):",
    emailIntroM: "If you would like to receive the results of this research in the future, leave your e-mail below (optional):",
    phEmail: "youremail@example.com",
    enviarEmail: "Send e-mail",
    emailObrigado: "Thank you! 💙\nWe will share our findings :)",
    emailObrigadoM: "Thank you!\nWe will share our findings :)",
    emailInvalido: "Please enter a valid e-mail.",
    emailErro: "Error sending. Please try again.",
    voltarInicio: "Back to Start"
  },

  // ====================================================== ESPAÑOL
  es: {
    tituloPagina: "El Misterio de los Silbidos de los Delfines",
    iniciarJogo: "Iniciar juego",
    creditos: "Desarrollado por: Julia Forli, Juliane Santos y Francisco Figueiredo",
    tituloMenu: "El Misterio de los Silbidos de los Delfines",

    loginTitulo: "Ingresa tu nombre para comenzar",
    phNome: "Escribe tu nombre",
    phIdade: "Escribe tu edad",
    phEscolaridade: "Escribe tu nivel de estudios",
    comecar: "Comenzar",
    erroNome: "Por favor, ingresa un nombre.",
    erroIdade: "Por favor, ingresa una edad válida.",
    erroEscolaridade: "Por favor, escribe tu nivel de estudios.",
    erroCriar: "Error al crear el usuario. Inténtalo de nuevo.",

    combAtual: "Combinación Actual",
    selecioneCartas: "Selecciona cartas\npara armar un grupo",
    cliqueMiniatura: "Haz clic en una miniatura\npara quitarla",
    semGrupo: "Carta\nsin grupo",
    limpar: "Limpiar\nSelección",
    salvar: "Guardar\nCombinación",
    finalizar: "Finalizar\nJuego",
    selTodas: "Seleccionar todas las restantes ({n})",
    desistir: "Abandonar",
    tempo: "Tiempo",
    combSalvas: "Combinaciones\nguardadas: {n}",
    cartasSalvas: "Cartas\nguardadas: {n}",
    dicaRolar: "Desplázate para ver más cartas",
    dicaDeslizar: "Desliza para ver más cartas",
    dicaMouse: "Rueda del mouse o ↑ ↓",

    navCancelar: "Cancelar",
    navAnterior: "Anterior",
    navProximo: "Siguiente",
    navPular: "Omitir",
    navComecar: "COMENZAR",

    fimTitulo: "¡Gracias por participar!",
    seuResultado: "Tu resultado",
    fimExplicacao:
      "En actividades como esta, existen dos estrategias principales de organización: lumpers y splitters.\n\n" +
      "Los lumpers son quienes crean pocos grupos, pero más grandes, percibiendo patrones amplios y semejanzas generales antes que los detalles. " +
      "Este tipo de pensamiento ayuda a identificar estructuras mayores y relaciones más globales.\n\n" +
      "Los splitters son quienes crean muchos grupos, pero más pequeños, percibiendo diferencias sutiles y detalles finos con mucha claridad. " +
      "Este tipo de pensamiento es esencial para identificar pequeñas variaciones dentro de sistemas complejos.",
    fimLumper:
      "Según tus elecciones, tiendes a usar una estrategia de tipo LUMPER.\n\n" +
      "Esto significa que percibes con facilidad patrones amplios y conexiones generales.",
    fimSplitter:
      "Según tus elecciones, tiendes a usar una estrategia de tipo SPLITTER.\n\n" +
      "Esto significa que percibes con mucha claridad diferencias sutiles y detalles finos.",
    fimNenhum:
      "Según tus elecciones, no fue posible identificar un estilo con seguridad.",
    fimFechamento:
      "Estos estilos reflejan formas diferentes de percibir y organizar patrones. " +
      "En la ciencia, ambos son importantes y complementarios.\n\n" +
      "Gracias por contribuir a la investigación —\n" +
      "y por ayudar a los delfines 💙",
    resumo: "Usuario: {u}  •  Tiempo: {t}  •  Combinaciones: {c}",
    emailIntro: "Si quieres recibir los resultados de esta investigación en el futuro,\ndeja tu correo electrónico abajo (opcional):",
    emailIntroM: "Si quieres recibir los resultados de esta investigación en el futuro, deja tu correo electrónico abajo (opcional):",
    phEmail: "tucorreo@ejemplo.com",
    enviarEmail: "Enviar correo",
    emailObrigado: "¡Gracias! 💙\nCompartiremos nuestros hallazgos :)",
    emailObrigadoM: "¡Gracias!\nCompartiremos nuestros hallazgos :)",
    emailInvalido: "Por favor, ingresa un correo electrónico válido.",
    emailErro: "Error al enviar. Inténtalo de nuevo.",
    voltarInicio: "Volver al inicio"
  }
};

// Textos das 8 páginas da história. "d" = computador, "m" = celular em pé.
// (se "m" não existir, usa "d")
const HISTORIA_TEXTOS = {
  pt: [
    { d: "Bem vindo, detetive!\n\nVocê sabia que, assim como você, nós golfinhos também podemos ter \"nomes\" únicos que nos identificam?\n\nOs cientistas os chamam de assovios-assinatura, e podem utilizá-los para entender melhor nossas populações e nos proteger de ameaças." },
    { d: "Mas, como vocês humanos ainda não inventaram uma máquina de tradução de golfinhês, o maior desafio é encontrar nossos nomes, num verdadeiro mar de vozes.\n\nE é aí que você entra!\n\nO pessoal do Lab EAR Hub lá da UFRN precisa da sua ajuda para desvendar esse mistério.\n\nVou te mostrar como!" },
    { d: "Esta é uma representação visual de um de nossos assovios.\n\nQuando queremos anunciar nossos nomes nós os repetimos várias vezes.\n\nO seu trabalho será encontrar imagens que parecem repetir o mesmo desenho!" },
    { d: "Clique em imagens similares para selecioná-las.\n\nNão há número mínimo ou máximo de imagens por grupo, escolha todas as que você achar que são parecidas.",
      m: "Toque em imagens similares para selecioná-las.\n\nNão há número mínimo ou máximo de imagens por grupo, escolha todas as que você achar que são parecidas." },
    { d: "Sua combinação atual aparece na lateral e você pode adicionar e remover cartas.\n\nQuando estiver satisfeito com o grupo utilize o botão verde abaixo para \"salvar combinação\"\n\nOu se quiser desistir do grupo clique \"limpar seleção\" para começar novamente.",
      m: "Sua combinação atual aparece logo abaixo das cartas e você pode adicionar e remover cartas.\n\nQuando estiver satisfeito com o grupo utilize o botão verde para \"salvar combinação\"\n\nOu se quiser desistir do grupo toque em \"limpar seleção\" para começar novamente." },
    { d: "Algumas imagens podem não se parecer com nenhuma outra. Nesse caso utilize o botão azul \"carta sem grupo\"" },
    { d: "Cada partida mostra 30 assovios!\n\nRole para ver mais cartas. E não esqueça de olhar todas antes de salvar a combinação ;)",
      m: "Cada partida mostra 30 assovios!\n\nDeslize para ver mais cartas. E não esqueça de olhar todas antes de salvar a combinação ;)" },
    { d: "Sua missão termina quando todos os 30 assovios forem agrupados e/ou marcados como carta sem grupo.\n\nAté mais, e obrigado pelos peixes!" }
  ],

  en: [
    { d: "Welcome, detective!\n\nDid you know that, just like you, we dolphins can also have unique \"names\" that identify us?\n\nScientists call them signature whistles, and can use them to better understand our populations and protect us from threats." },
    { d: "But since you humans still haven't invented a dolphinese translation machine, the biggest challenge is finding our names in a true sea of voices.\n\nAnd that's where you come in!\n\nThe folks at the EAR Hub Lab at UFRN need your help to solve this mystery.\n\nLet me show you how!" },
    { d: "This is a visual representation of one of our whistles.\n\nWhen we want to announce our names, we repeat them several times.\n\nYour job will be to find images that seem to repeat the same pattern!" },
    { d: "Click on similar images to select them.\n\nThere is no minimum or maximum number of images per group; choose all the ones you think look alike.",
      m: "Tap on similar images to select them.\n\nThere is no minimum or maximum number of images per group; choose all the ones you think look alike." },
    { d: "Your current combination appears on the side, and you can add and remove cards.\n\nWhen you are happy with the group, use the green button below to \"save combination\".\n\nOr, if you want to give up on the group, click \"clear selection\" to start over.",
      m: "Your current combination appears just below the cards, and you can add and remove cards.\n\nWhen you are happy with the group, use the green button to \"save combination\".\n\nOr, if you want to give up on the group, tap \"clear selection\" to start over." },
    { d: "Some images may not look like any other. In that case, use the blue \"card with no group\" button." },
    { d: "Each round shows 30 whistles!\n\nScroll to see more cards. And don't forget to look at all of them before saving a combination ;)",
      m: "Each round shows 30 whistles!\n\nSwipe to see more cards. And don't forget to look at all of them before saving a combination ;)" },
    { d: "Your mission ends when all 30 whistles have been grouped and/or marked as no-group cards.\n\nSo long, and thanks for all the fish!" }
  ],

  es: [
    { d: "¡Bienvenido, detective!\n\n¿Sabías que, al igual que tú, los delfines también podemos tener \"nombres\" únicos que nos identifican?\n\nLos científicos los llaman silbidos firma, y pueden usarlos para entender mejor nuestras poblaciones y protegernos de las amenazas." },
    { d: "Pero como ustedes, los humanos, todavía no inventaron una máquina de traducción de delfinés, el mayor desafío es encontrar nuestros nombres en un verdadero mar de voces.\n\n¡Y ahí es donde entras tú!\n\nEl equipo del Lab EAR Hub de la UFRN necesita tu ayuda para resolver este misterio.\n\n¡Te voy a mostrar cómo!" },
    { d: "Esta es una representación visual de uno de nuestros silbidos.\n\nCuando queremos anunciar nuestros nombres, los repetimos varias veces.\n\n¡Tu trabajo será encontrar imágenes que parezcan repetir el mismo dibujo!" },
    { d: "Haz clic en las imágenes similares para seleccionarlas.\n\nNo hay un número mínimo ni máximo de imágenes por grupo; elige todas las que creas que se parecen.",
      m: "Toca las imágenes similares para seleccionarlas.\n\nNo hay un número mínimo ni máximo de imágenes por grupo; elige todas las que creas que se parecen." },
    { d: "Tu combinación actual aparece a un costado y puedes agregar y quitar cartas.\n\nCuando estés conforme con el grupo, usa el botón verde de abajo para \"guardar combinación\".\n\nO, si quieres descartar el grupo, haz clic en \"limpiar selección\" para empezar de nuevo.",
      m: "Tu combinación actual aparece justo debajo de las cartas y puedes agregar y quitar cartas.\n\nCuando estés conforme con el grupo, usa el botón verde para \"guardar combinación\".\n\nO, si quieres descartar el grupo, toca \"limpiar selección\" para empezar de nuevo." },
    { d: "Algunas imágenes pueden no parecerse a ninguna otra. En ese caso, usa el botón azul \"carta sin grupo\"." },
    { d: "¡Cada partida muestra 30 silbidos!\n\nDesplázate para ver más cartas. Y no olvides mirarlas todas antes de guardar la combinación ;)",
      m: "¡Cada partida muestra 30 silbidos!\n\nDesliza para ver más cartas. Y no olvides mirarlas todas antes de guardar la combinación ;)" },
    { d: "Tu misión termina cuando los 30 silbidos estén agrupados y/o marcados como cartas sin grupo.\n\n¡Hasta luego, y gracias por todos los peces!" }
  ]
};

function textoHistoria(i, mobile) {
  const e = (HISTORIA_TEXTOS[lang] || HISTORIA_TEXTOS.pt)[i];
  return (mobile && e.m) ? e.m : e.d;
}

// executa depois de o dicionário existir
function iniciarIdioma() {
  try {
    const q = new URLSearchParams(window.location.search).get("lang");
    const qq = q ? q.slice(0, 2).toLowerCase() : "";
    if (IDIOMAS.includes(qq)) {
      lang = qq;
    } else {
      const salvo = window.localStorage.getItem("idioma");
      if (IDIOMAS.includes(salvo)) lang = salvo;
    }
  } catch (e) { /* sem localStorage: segue em português */ }
  aplicarIdiomaNaPagina();
}
iniciarIdioma();
