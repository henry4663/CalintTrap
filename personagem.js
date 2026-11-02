import * as THREE from 'three';

export function criarPersonagem(nomePersonalizado) {
  const grupoPersonagem = new THREE.Group();

  // Pega o nome salvo na plataforma ou usa o fornecido
  const nomePlayer = nomePersonalizado || localStorage.getItem('goblox_player_nick') || "Jogador";

  // Materiais padrão com cores vibrantes
  const materialRoupa = new THREE.MeshStandardMaterial({ color: 0x2678ed, roughness: 0.75 });
  const materialCalca = new THREE.MeshStandardMaterial({ color: 0x242b43, roughness: 0.75 });
  const materialPele = new THREE.MeshStandardMaterial({ color: 0xffc18b, roughness: 0.75 });
  const materialCabelo = new THREE.MeshStandardMaterial({ color: 0x29202a, roughness: 0.75 });

  function criarParte(parent, x, y, z, sx, sy, sz, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // TRONCO
  criarParte(grupoPersonagem, 0, 1.55, 0, 0.9, 1.1, 0.48, materialRoupa);

  // CABEÇA
  criarParte(grupoPersonagem, 0, 2.48, 0, 0.75, 0.75, 0.75, materialPele);

  // CABELO
  criarParte(grupoPersonagem, 0, 2.91, 0, 0.79, 0.18, 0.79, materialCabelo);

  // OLHOS
  criarParte(grupoPersonagem, -0.17, 2.53, -0.38, 0.09, 0.09, 0.04, materialCabelo);
  criarParte(grupoPersonagem, 0.17, 2.53, -0.38, 0.09, 0.09, 0.04, materialCabelo);

  // BRAÇOS (Pivotados nos ombros para animação)
  const bracoE = new THREE.Group();
  bracoE.position.set(-0.58, 2.35, 0);
  criarParte(bracoE, 0, -0.38, 0, 0.3, 0.85, 0.35, materialRoupa);
  grupoPersonagem.add(bracoE);

  const bracoD = new THREE.Group();
  bracoD.position.set(0.58, 2.35, 0);
  criarParte(bracoD, 0, -0.38, 0, 0.3, 0.85, 0.35, materialRoupa);
  grupoPersonagem.add(bracoD);

  // PERNAS (Pivotadas nos quadris para animação)
  const pernaE = new THREE.Group();
  pernaE.position.set(-0.25, 1.45, 0);
  criarParte(pernaE, 0, -0.43, 0, 0.35, 0.95, 0.4, materialCalca);
  grupoPersonagem.add(pernaE);

  const pernaD = new THREE.Group();
  pernaD.position.set(0.25, 1.45, 0);
  criarParte(pernaD, 0, -0.43, 0, 0.35, 0.95, 0.4, materialCalca);
  grupoPersonagem.add(pernaD);

  // --- SISTEMA DE NICKNAME (Canvas Text Sprite) ---
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  context.fillStyle = 'rgba(0, 0, 0, 0.6)';
  context.roundRect(56, 16, 400, 96, 24);
  context.fill();

  context.font = 'bold 44px Arial';
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(nomePlayer, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  
  sprite.position.set(0, 3.5, 0);
  sprite.scale.set(2.0, 0.5, 1.0);
  grupoPersonagem.add(sprite);

  // --- FUNÇÃO DE ANIMAÇÃO DE CAMINHADA ---
  // Podes chamar esta função dentro do teu loop de animação do jogo passando (tempo, a andar ou parado)
  grupoPersonagem.atualizarAnimacao = function(tempo, aAndar) {
    if (aAndar) {
      const velocidadeAnim = tempo * 12;
      bracoE.rotation.x = Math.sin(velocidadeAnim) * 0.6;
      bracoD.rotation.x = -Math.sin(velocidadeAnim) * 0.6;
      pernaE.rotation.x = -Math.sin(velocidadeAnim) * 0.6;
      pernaD.rotation.x = Math.sin(velocidadeAnim) * 0.6;
    } else {
      // Posição de descanso (Idle suave)
      bracoE.rotation.x = THREE.MathUtils.lerp(bracoE.rotation.x, 0, 0.1);
      bracoD.rotation.x = THREE.MathUtils.lerp(bracoD.rotation.x, 0, 0.1);
      pernaE.rotation.x = THREE.MathUtils.lerp(pernaE.rotation.x, 0, 0.1);
      pernaD.rotation.x = THREE.MathUtils.lerp(pernaD.rotation.x, 0, 0.1);
    }
  };

  return grupoPersonagem;
}
