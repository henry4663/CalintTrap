import * as THREE from 'three';

export function criarPersonagem(nomePersonalizado, itensEquipados = null) {
  const grupoPersonagem = new THREE.Group();

  const nomeFallback = typeof localStorage !== 'undefined'
    ? localStorage.getItem('goblox_player_nick') || 'Jogador'
    : 'Jogador';

  const nomePlayer = typeof nomePersonalizado === 'string' && nomePersonalizado.trim()
    ? nomePersonalizado.trim()
    : nomeFallback;

  // Se não passar os itens diretamente (ex: jogador local), lê do localStorage
  if (!itensEquipados) {
    const keyEquipados = `goblox_equipados_${nomePlayer}`;
    try {
      itensEquipados = JSON.parse(localStorage.getItem(keyEquipados)) || [];
    } catch (e) {
      itensEquipados = [];
    }
  }

  // Materiais Padrão
  const materialRoupa = new THREE.MeshStandardMaterial({ color: 0x2678ed, roughness: 0.75 });
  const materialCalca = new THREE.MeshStandardMaterial({ color: 0x242b43, roughness: 0.75 });
  const materialPele = new THREE.MeshStandardMaterial({ color: 0xffc18b, roughness: 0.75 });

  // Cabelo Amarelo ou Escuro Padrão
  const temCabeloAmarelo = itensEquipados.includes('cabelo_amarelo');
  const materialCabelo = new THREE.MeshStandardMaterial({
    color: temCabeloAmarelo ? 0xffea00 : 0x29202a,
    roughness: 0.75
  });

  function criarParte(parent, x, y, z, sx, sy, sz, mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // --- CORPO DO BONECO ---
  criarParte(grupoPersonagem, 0, 1.05, 0, 0.85, 1.0, 0.45, materialRoupa); // Tronco
  criarParte(grupoPersonagem, 0, 1.85, 0, 0.7, 0.7, 0.7, materialPele); // Cabeça
  criarParte(grupoPersonagem, 0, 2.22, 0, 0.74, 0.16, 0.74, materialCabelo); // Cabelo

  const matOlhos = new THREE.MeshStandardMaterial({ color: 0x111111 });
  criarParte(grupoPersonagem, -0.16, 1.88, -0.36, 0.08, 0.08, 0.04, matOlhos);
  criarParte(grupoPersonagem, 0.16, 1.88, -0.36, 0.08, 0.08, 0.04, matOlhos);

  // Braços
  const ombroE = new THREE.Group();
  ombroE.position.set(-0.52, 1.45, 0);
  criarParte(ombroE, 0, -0.35, 0, 0.28, 0.75, 0.32, materialRoupa);
  grupoPersonagem.add(ombroE);

  const ombroD = new THREE.Group();
  ombroD.position.set(0.52, 1.45, 0);
  criarParte(ombroD, 0, -0.35, 0, 0.28, 0.75, 0.32, materialRoupa);
  grupoPersonagem.add(ombroD);

  // Pernas
  const pernaE = new THREE.Group();
  pernaE.position.set(-0.22, 0.55, 0);
  criarParte(pernaE, 0, -0.28, 0, 0.32, 0.75, 0.36, materialCalca);
  grupoPersonagem.add(pernaE);

  const pernaD = new THREE.Group();
  pernaD.position.set(0.22, 0.55, 0);
  criarParte(pernaD, 0, -0.28, 0, 0.32, 0.75, 0.36, materialCalca);
  grupoPersonagem.add(pernaD);

  // --- ACESSÓRIOS EQUIPADOS ---

  // Coroa Real
  if (itensEquipados.includes('coroa')) {
    const matOuro = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 });
    const coroaGrupo = new THREE.Group();
    coroaGrupo.position.set(0, 2.32, 0);

    const baseCoroa = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 8), matOuro);
    coroaGrupo.add(baseCoroa);

    for (let i = 0; i < 4; i++) {
      const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), matOuro);
      const angulo = (i * Math.PI) / 2;
      ponta.position.set(Math.cos(angulo) * 0.3, 0.12, Math.sin(angulo) * 0.3);
      coroaGrupo.add(ponta);
    }
    grupoPersonagem.add(coroaGrupo);
  }

  // Chupeta Lendária
  if (itensEquipados.includes('chupeta')) {
    const matChupeta = new THREE.MeshStandardMaterial({ color: 0xff4081, roughness: 0.4 });
    const matBico = new THREE.MeshStandardMaterial({ color: 0xffeb3b, roughness: 0.3 });

    const chupetaGrupo = new THREE.Group();
    chupetaGrupo.position.set(0, 1.72, -0.38);

    const baseChupeta = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.05), matChupeta);
    chupetaGrupo.add(baseChupeta);

    const argola = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 16), matBico);
    argola.position.set(0, 0, -0.05);
    chupetaGrupo.add(argola);

    grupoPersonagem.add(chupetaGrupo);
  }

  // --- NICKNAME FLUTUANTE ---
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

  const alturaNick = itensEquipados.includes('coroa') ? 2.95 : 2.7;
  sprite.position.set(0, alturaNick, 0);
  sprite.scale.set(1.8, 0.45, 1.0);
  grupoPersonagem.add(sprite);

  // Animação de Caminhada
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

