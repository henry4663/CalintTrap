// Personagem padrão do CalintTrap
// Compatível com jogos 3D que usam Three.js (THREE deve estar carregado antes deste módulo).
// Uso: import { criarPersonagem } from './personagem.js';
//      const player = criarPersonagem('Henry');
//      scene.add(player);

export function criarPersonagem(nick = 'Jogador', opcoes = {}) {
  if (typeof THREE === 'undefined') {
    throw new Error('Carregue o Three.js antes de importar personagem.js.');
  }

  const cor = opcoes.cor ?? opcoes.color ?? 0x7c3aed;
  const escala = Number.isFinite(opcoes.escala) ? opcoes.escala : 1;
  const mostrarNome = opcoes.mostrarNome !== false;

  const personagem = new THREE.Group();
  personagem.name = 'Personagem_' + String(nick || 'Jogador');

  const materialCorpo = new THREE.MeshStandardMaterial({
    color: cor,
    roughness: 0.48,
    metalness: 0.04
  });

  // Corpo esférico: frente do personagem aponta para -Z.
  const corpo = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 24, 18),
    materialCorpo
  );
  corpo.name = 'Corpo';
  corpo.position.y = 0.64;
  corpo.castShadow = true;
  corpo.receiveShadow = true;
  personagem.add(corpo);

  const materialOlho = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.28
  });
  const materialPupila = new THREE.MeshStandardMaterial({
    color: 0x101018,
    roughness: 0.2
  });

  function criarOlho(x) {
    const olho = new THREE.Group();
    olho.position.set(x, 0.78, -0.49);

    const branco = new THREE.Mesh(
      new THREE.SphereGeometry(0.145, 16, 12),
      materialOlho
    );
    branco.scale.set(0.88, 1.08, 0.58);
    branco.castShadow = true;
    olho.add(branco);

    const pupila = new THREE.Mesh(
      new THREE.SphereGeometry(0.073, 12, 10),
      materialPupila
    );
    pupila.position.set(0.018, -0.005, -0.075);
    pupila.scale.set(0.9, 1, 0.65);
    olho.add(pupila);

    personagem.add(olho);
    return olho;
  }

  const olhoEsquerdo = criarOlho(-0.22);
  const olhoDireito = criarOlho(0.22);

  // Sorriso pequeno feito com uma linha curva.
  const pontosSorriso = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = -0.14 + t * 0.28;
    const y = 0.43 - Math.sin(t * Math.PI) * 0.055;
    pontosSorriso.push(new THREE.Vector3(x, y, -0.586));
  }
  const geometriaSorriso = new THREE.BufferGeometry().setFromPoints(pontosSorriso);
  const sorriso = new THREE.Line(
    geometriaSorriso,
    new THREE.LineBasicMaterial({ color: 0x17131f, linewidth: 2 })
  );
  personagem.add(sorriso);

  let etiqueta = null;
  let texturaNome = null;

  if (mostrarNome && typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    const nome = String(nick || 'Jogador').slice(0, 24);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 46px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 9;
    ctx.strokeStyle = 'rgba(10, 8, 20, 0.88)';
    ctx.strokeText(nome, 256, 64, 480);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(nome, 256, 64, 480);

    texturaNome = new THREE.CanvasTexture(canvas);
    if ('colorSpace' in texturaNome && THREE.SRGBColorSpace) {
      texturaNome.colorSpace = THREE.SRGBColorSpace;
    }

    etiqueta = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texturaNome,
      transparent: true,
      depthWrite: false
    }));
    etiqueta.name = 'NomeDoJogador';
    etiqueta.position.set(0, 1.55, 0);
    etiqueta.scale.set(1.8, 0.45, 1);
    personagem.add(etiqueta);
  }

  personagem.scale.setScalar(escala);
  personagem.userData.tipo = 'CalintTrapBall';
  personagem.userData.cor = cor;
  personagem.userData.olhos = [olhoEsquerdo, olhoDireito];
  personagem.userData.etiqueta = etiqueta;

  personagem.userData.definirCor = function(novaCor) {
    materialCorpo.color.set(novaCor);
    personagem.userData.cor = novaCor;
  };

  personagem.userData.definirNome = function(novoNome) {
    if (!etiqueta || !texturaNome) return;
    const ctx = texturaNome.image.getContext('2d');
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = 'bold 46px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 9;
    ctx.strokeStyle = 'rgba(10, 8, 20, 0.88)';
    ctx.strokeText(String(novoNome || 'Jogador').slice(0, 24), 256, 64, 480);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(novoNome || 'Jogador').slice(0, 24), 256, 64, 480);
    texturaNome.needsUpdate = true;
  };

  return personagem;
}

export default criarPersonagem;
