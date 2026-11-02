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

  // --- ESTRUTURA DO CORPO (Pivôs corrigidos na base para alinhar com o chão) ---
  
  // TRONCO
  criarParte(grupoPersonagem, 0, 1.05, 0, 0.85, 1.0, 0.45, materialRoupa);

  // CABEÇA (Alinhada logo acima do tronco)
  criarParte(grupoPersonagem, 0, 1.85, 0, 0.7, 0.7, 0.7, materialPele);

  // CABELO
  criarParte(grupoPersonagem, 0, 2.22, 0, 0.74, 0.16, 0.74, materialCabelo);

  // OLHOS
  criarParte(grupoPersonagem, -0.16, 1.88, -0.36, 0.08, 0.08, 0.04, materialCabelo);
  criarParte(grupoPersonagem, 0.16, 1.88, -0.36, 0.08, 0.08, 0.04, materialCabelo);

  // BRAÇOS (Pivotados corretamente nos ombros para evitar braços para cima)
  const ombroE = new THREE.Group();
  ombroE.position.set(-0.52, 1.45, 0);
  criarParte(ombroE, 0, -0.35, 0, 0.28, 0.75, 0.32, materialRoupa);
  grupoPersonagem.add(ombroE);

  const ombroD = new THREE.Group();
  ombroD.position.set(0.52, 1.45, 0);
  criarParte(ombroD, 0, -0.35, 0, 0.28, 0.75, 0.32, materialRoupa);
  grupoPersonagem.add(ombroD);

  // PERNAS (Pivotadas nos quadris)
  const pernaE = new THREE.Group();
  pernaE.position.set(-0.22, 0.55, 0);
  criarParte(pernaE, 0, -0.28, 0, 0.32, 0.75, 0.36, materialCalca);
  grupoPersonagem.add(pernaE);

  const pernaD = new THREE.Group();
  pernaD.position.set(0.22, 0.55, 0);
  criarParte(pernaD, 0, -0.28, 0, 0.32, 0.75, 0.36, materialCalca);
  grupoPersonagem.add(pernaD);

  // --- SISTEMA DE NICKNAME (Posicionado certinho logo acima da cabeça) ---
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 128;

  context.fillStyle = 'rgba(0, 0, 0, 0.65)';
  if (context.roundRect) {
    context.roundRect(56, 16, 400, 96, 24);
  } else {
    context.fillRect(56, 16, 400, 96);
  }
  context.fill();

  context.font = 'bold 42px Arial';
  context.fillStyle = '#ffffff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(nomePlayer, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  
  // Altura perfeita logo acima do cabelo (Y = 2.7) para não invadir as plataformas
  sprite.position.set(0, 2.7, 0);
  sprite.scale.set(1.8, 0.45, 1.0);
  grupoPersonagem.add(sprite);

  // --- ANIMAÇÃO DE CAMINHADA ---
  grupoPersonagem.atualizarAnimacao = function(tempo, aAndar) {
    if (aAndar) {
      const vel = tempo * 14;
      ombroE.rotation.x = Math.sin(vel) * 0.7;
      ombroD.rotation.x = -Math.sin(vel) * 0.7;
      pernaE.rotation.x = -Math.sin(vel) * 0.7;
      pernaD.rotation.x = Math.sin(vel) * 0.7;
    } else {
      ombroE.rotation.x = THREE.MathUtils.lerp(ombroE.rotation.x, 0, 0.15);
      ombroD.rotation.x = THREE.MathUtils.lerp(ombroD.rotation.x, 0, 0.15);
      pernaE.rotation.x = THREE.MathUtils.lerp(pernaE.rotation.x, 0, 0.15);
      pernaD.rotation.x = THREE.MathUtils.lerp(pernaD.rotation.x, 0, 0.15);
    }
  };

  return grupoPersonagem;
}
