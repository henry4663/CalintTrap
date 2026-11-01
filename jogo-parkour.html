
(async function iniciarParkour() {
  const status = document.getElementById("status");

  // CARREGAMENTO DO THREE.JS
  let THREE;

  try {
    THREE = await import(
      "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js"
    );
  } catch (e) {
    try {
      THREE = await import(
        "https://unpkg.com/three@0.170.0/build/three.module.js"
      );
    } catch (e2) {
      status.textContent = "Erro ao carregar o motor 3D. Verifique a internet.";
      console.error("Three.js não carregou:", e, e2);
      return;
    }
  }

  status.textContent = "Preparando cenário...";

  // CENA
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87caff);
  scene.fog = new THREE.Fog(0x87caff, 35, 110);

  const camera = new THREE.PerspectiveCamera(
    70, innerWidth / innerHeight, 0.1, 200
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.body.appendChild(renderer.domElement);

  // ILUMINAÇÃO
  scene.add(new THREE.HemisphereLight(0xffffff, 0x53647d, 2));

  const sol = new THREE.DirectionalLight(0xffffff, 2.5);
  sol.position.set(-15, 25, 12);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  scene.add(sol);

  // MATERIAIS
  function material(cor, metalness = 0) {
    return new THREE.MeshStandardMaterial({
      color: cor,
      roughness: 0.75,
      metalness
    });
  }

  const cores = {
    verde: material(0x35d995),
    roxo: material(0x7955ff),
    azul: material(0x269cff),
    amarelo: material(0xffcb45),
    vermelho: material(0xff5369),
    pele: material(0xffc18b),
    roupa: material(0x2678ed),
    calca: material(0x242b43),
    cabelo: material(0x29202a),
    branco: material(0xffffff),
    chao: material(0x29394e)
  };

  // CRIADOR DE BLOCOS
  function criarBloco(x, y, z, sx, sy, sz, mat) {
    const objeto = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      mat
    );

    objeto.position.set(x, y, z);
    objeto.castShadow = true;
    objeto.receiveShadow = true;
    scene.add(objeto);

    return objeto;
  }

  // CHÃO
  criarBloco(0, -2, -25, 200, 1, 200, cores.chao);

  // PLATAFORMAS
  const plataformas = [];

  function plataforma(x, y, z, largura, profundidade, mat) {
    const objeto = criarBloco(
      x, y, z, largura, 0.7, profundidade, mat
    );

    plataformas.push({
      x, y: y + 0.35, z,
      largura,
      profundidade
    });

    // Borda decorativa
    criarBloco(
      x, y - 0.36, z,
      largura + 0.15, 0.12, profundidade + 0.15,
      cores.branco
    );

    return objeto;
  }

  plataforma(0, 0, 0, 10, 10, cores.verde);
  plataforma(0, 1, -10, 5, 5, cores.roxo);
  plataforma(5, 2, -17, 4, 4, cores.azul);
  plataforma(0, 3, -24, 4, 4, cores.amarelo);
  plataforma(-5, 4, -31, 4, 4, cores.verde);
  plataforma(-5, 5, -39, 6, 6, cores.roxo);
  plataforma(2, 6, -47, 4, 4, cores.azul);
  plataforma(8, 7, -55, 6, 6, cores.amarelo);

  // CHECKPOINT
  criarBloco(-5, 5.4, -39, 1.7, 0.15, 1.7, cores.verde);

  // PLATAFORMA FINAL
  criarBloco(8, 7.42, -55, 2, 0.12, 2, cores.verde);

  // DECORAÇÃO DO MAPA
  for (let i = 0; i < 18; i++) {
    const x = i % 2 === 0 ? -13 : 13;
    const z = -i * 4;

    criarBloco(
      x, 1, z,
      2, 2 + Math.random() * 3, 2,
      i % 2 ? cores.roxo : cores.azul
    );
  }

  // BANDEIRA DE CHEGADA
  criarBloco(8, 9, -55, 0.25, 3, 0.25, cores.vermelho);
  criarBloco(9, 10.2, -55, 2, 0.8, 0.15, cores.amarelo);

  // PERSONAGEM
  const jogador = new THREE.Group();
  scene.add(jogador);

  const corpo = new THREE.Group();
  jogador.add(corpo);

  function parte(parent, x, y, z, sx, sy, sz, mat) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz),
      mat
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    return mesh;
  }

  // TRONCO
  parte(corpo, 0, 1.55, 0, 0.9, 1.1, 0.48, cores.roupa);

  // CABEÇA
  parte(corpo, 0, 2.48, 0, 0.75, 0.75, 0.75, cores.pele);

  // CABELO
  parte(corpo, 0, 2.91, 0, 0.79, 0.18, 0.79, cores.cabelo);

  // OLHOS
  parte(corpo, -0.17, 2.53, -0.38, 0.09, 0.09, 0.04, cores.cabelo);
  parte(corpo, 0.17, 2.53, -0.38, 0.09, 0.09, 0.04, cores.cabelo);

  // BRAÇOS
  const bracoE = new THREE.Group();
  const bracoD = new THREE.Group();

  bracoE.position.set(-0.58, 1.95, 0);
  bracoD.position.set(0.58, 1.95, 0);

  corpo.add(bracoE, bracoD);

  parte(bracoE, 0, -0.38, 0, 0.3, 0.85, 0.35, cores.roupa);
  parte(bracoD, 0, -0.38, 0, 0.3, 0.85, 0.35, cores.roupa);

  // PERNAS
  const pernaE = new THREE.Group();
  const pernaD = new THREE.Group();

  pernaE.position.set(-0.25, 1, 0);
  pernaD.position.set(0.25, 1, 0);

  corpo.add(pernaE, pernaD);

  parte(pernaE, 0, -0.43, 0, 0.35, 0.95, 0.4, cores.calca);
  parte(pernaD, 0, -0.43, 0, 0.35, 0.95, 0.4, cores.calca);

  // ESTADO DO JOGADOR
  jogador.position.set(0, 0.36, 0);

  let velocidadeY = 0;
  let noChao = false;
  let venceu = false;
  let anguloCamera = 0;
  let checkpoint = new THREE.Vector3(0, 0.36, 0);

  const velocidade = 7;
  const gravidade = 22;
  const forcaPulo = 10;

  const teclas = {};

  // TECLADO
  addEventListener("keydown", e => {
    teclas[e.code] = true;

    if (e.code === "Space") {
      e.preventDefault();
      pular();
    }
  });

  addEventListener("keyup", e => {
    teclas[e.code] = false;
  });

  function pular() {
    if (noChao && !venceu) {
      velocidadeY = forcaPulo;
      noChao = false;
    }
  }

  // CONTROLES MOBILE
  document.querySelectorAll(".move").forEach(botao => {
    const tecla = botao.dataset.key;

    botao.addEventListener("pointerdown", e => {
      e.preventDefault();
      teclas[tecla] = true;
      botao.setPointerCapture(e.pointerId);
    });

    function soltar() {
      teclas[tecla] = false;
    }

    botao.addEventListener("pointerup", soltar);
    botao.addEventListener("pointercancel", soltar);
    botao.addEventListener("lostpointercapture", soltar);
  });

  const botaoPulo = document.getElementById("pular");

  botaoPulo.addEventListener("pointerdown", e => {
    e.preventDefault();
    pular();
  });

  // CÂMERA GIRATÓRIA
  let arrastando = false;
  let ultimaX = 0;

  renderer.domElement.addEventListener("pointerdown", e => {
    arrastando = true;
    ultimaX = e.clientX;
    renderer.domElement.setPointerCapture(e.pointerId);
  });

  renderer.domElement.addEventListener("pointermove", e => {
    if (!arrastando) return;

    anguloCamera -= (e.clientX - ultimaX) * 0.006;
    ultimaX = e.clientX;
  });

  function pararCamera() {
    arrastando = false;
  }

  renderer.domElement.addEventListener("pointerup", pararCamera);
  renderer.domElement.addEventListener("pointercancel", pararCamera);

  // MOVIMENTO E COLISÃO
  function atualizar(dt) {
    if (venceu) return;

    const frente =
      (teclas.KeyW || teclas.ArrowUp ? 1 : 0) -
      (teclas.KeyS || teclas.ArrowDown ? 1 : 0);

    const lado =
      (teclas.KeyD || teclas.ArrowRight ? 1 : 0) -
      (teclas.KeyA || teclas.ArrowLeft ? 1 : 0);

    const direcao = new THREE.Vector3(lado, 0, -frente);

    if (direcao.lengthSq() > 0) {
      direcao.normalize();
      direcao.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        anguloCamera
      );

      jogador.position.x += direcao.x * velocidade * dt;
      jogador.position.z += direcao.z * velocidade * dt;

      jogador.rotation.y =
        Math.atan2(direcao.x, direcao.z) + Math.PI;

      const passo = Math.sin(performance.now() * 0.012);

      pernaE.rotation.x = passo * 0.65;
      pernaD.rotation.x = -passo * 0.65;
      bracoE.rotation.x = -passo * 0.5;
      bracoD.rotation.x = passo * 0.5;
    } else {
      pernaE.rotation.x = THREE.MathUtils.damp(
        pernaE.rotation.x, 0, 10, dt
      );
      pernaD.rotation.x = THREE.MathUtils.damp(
        pernaD.rotation.x, 0, 10, dt
      );
      bracoE.rotation.x = THREE.MathUtils.damp(
        bracoE.rotation.x, 0, 10, dt
      );
      bracoD.rotation.x = THREE.MathUtils.damp(
        bracoD.rotation.x, 0, 10, dt
      );
    }

    // GRAVIDADE
    const alturaAnterior = jogador.position.y;

    velocidadeY -= gravidade * dt;
    jogador.position.y += velocidadeY * dt;

    noChao = false;

    // COLISÕES
    for (const p of plataformas) {
      const dentroX =
        Math.abs(jogador.position.x - p.x) < p.largura / 2 + 0.3;

      const dentroZ =
        Math.abs(jogador.position.z - p.z) < p.profundidade / 2 + 0.3;

      const passouPeloTopo =
        alturaAnterior >= p.y - 0.05 &&
        jogador.position.y <= p.y;

      if (
        dentroX &&
        dentroZ &&
        velocidadeY <= 0 &&
        passouPeloTopo
      ) {
        jogador.position.y = p.y;
        velocidadeY = 0;
        noChao = true;
      }
    }

    // CHECKPOINT
    if (
      jogador.position.z < -36 &&
      jogador.position.z > -42 &&
      jogador.position.x < -2 &&
      jogador.position.x > -8 &&
      noChao
    ) {
      checkpoint.set(
        jogador.position.x,
        jogador.position.y,
        jogador.position.z
      );

      document.getElementById("status").textContent =
        "Checkpoint ativado!";
    }

    // VITÓRIA
    if (jogador.position.z < -57 && jogador.position.x > 5) {
      venceu = true;
      document.getElementById("mensagem").style.display = "block";
      document.getElementById("status").textContent = "Você venceu!";
    }

    // QUEDA
    if (jogador.position.y < -12) {
      jogador.position.copy(checkpoint);
      velocidadeY = 0;
      noChao = false;
    }

    // LIMITES
    jogador.position.x = THREE.MathUtils.clamp(
      jogador.position.x, -20, 20
    );
  }

  // CÂMERA TERCEIRA PESSOA
  function atualizarCamera(dt) {
    const distancia = 8;

    const destino = new THREE.Vector3(
      jogador.position.x + Math.sin(anguloCamera) * distancia,
      jogador.position.y + 3.5,
      jogador.position.z + Math.cos(anguloCamera) * distancia
    );

    camera.position.lerp(
      destino,
      1 - Math.exp(-6 * dt)
    );

    camera.lookAt(
      jogador.position.x,
      jogador.position.y + 1.5,
      jogador.position.z
    );
  }

  // INICIALIZAÇÃO
  const relogio = new THREE.Clock();

  function animar() {
    requestAnimationFrame(animar);

    const dt = Math.min(relogio.getDelta(), 0.04);

    atualizar(dt);
    atualizarCamera(dt);

    renderer.render(scene, camera);
  }

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  status.textContent = "Chegue até a bandeira final!";

  animar();

  console.log("Goblox Parkour iniciado!");
})();
