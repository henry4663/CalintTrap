// PERSONAGEM
const jogador = new THREE.Group();
scene.add(jogador);

const corpo = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1.4, 1),
  new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    emissive: 0x4c1d95,
    emissiveIntensity: 0.2
  })
);
corpo.position.y = 1.2;
corpo.castShadow = true;
corpo.receiveShadow = true;
jogador.add(corpo);

// CABEÇA
const cabeca = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xffd7b5 })
);
cabeca.position.y = 2.2;
cabeca.castShadow = true;
cabeca.receiveShadow = true;
jogador.add(cabeca);

// OLHOS
const olhoMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

const olhoEsq = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), olhoMat);
olhoEsq.position.set(-0.18, 2.25, 0.42);
jogador.add(olhoEsq);

const olhoDir = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), olhoMat);
olhoDir.position.set(0.18, 2.25, 0.42);
jogador.add(olhoDir);

// NOME EM CIMA DO PLAYER
function criarNomeNoPlayer(nome = "nick") {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "700 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(nome, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(material);

  sprite.scale.set(2.8, 0.7, 1);
  sprite.position.set(0, 3.2, 0);

  return sprite;
}

const nomeSprite = criarNomeNoPlayer("nick");
jogador.add(nomeSprite);

// POSIÇÃO INICIAL
jogador.position.set(0, 0.5, 6);
