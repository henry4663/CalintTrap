import * as THREE from 'three';

export function criarPersonagem() {
  const grupoPersonagem = new THREE.Group();

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

  // BRAÇOS
  const bracoE = new THREE.Group();
  const bracoD = new THREE.Group();
  bracoE.position.set(-0.58, 1.95, 0);
  bracoD.position.set(0.58, 1.95, 0);
  grupoPersonagem.add(bracoE, bracoD);

  criarParte(bracoE, 0, -0.38, 0, 0.3, 0.85, 0.35, materialRoupa);
  criarParte(bracoD, 0, -0.38, 0, 0.3, 0.85, 0.35, materialRoupa);

  // PERNAS
  const pernaE = new THREE.Group();
  const pernaD = new THREE.Group();
  pernaE.position.set(-0.25, 1, 0);
  pernaD.position.set(0.25, 1, 0);
  grupoPersonagem.add(pernaE, pernaD);

  criarParte(pernaE, 0, -0.43, 0, 0.35, 0.95, 0.4, materialCalca);
  criarParte(pernaD, 0, -0.43, 0, 0.35, 0.95, 0.4, materialCalca);

  return grupoPersonagem;
}
