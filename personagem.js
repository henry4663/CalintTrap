import * as THREE from 'three';

export function criarPersonagem(cor = 0x7c3aed) {
  const personagem = new THREE.Group();

  const corpo = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.55, 1.25, 4, 8),
    new THREE.MeshStandardMaterial({
      color: cor,
      roughness: 0.25,
      metalness: 0.45,
      emissive: cor,
      emissiveIntensity: 0.2
    })
  );
  corpo.position.y = 1.2;
  corpo.castShadow = true;
  corpo.receiveShadow = true;
  personagem.add(corpo);

  const cabeca = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
      metalness: 0.1
    })
  );
  cabeca.position.y = 2.35;
  personagem.add(cabeca);

  const olhoGeo = new THREE.BoxGeometry(0.12, 0.12, 0.05);
  const olhoMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

  const olhoEsq = new THREE.Mesh(olhoGeo, olhoMat);
  olhoEsq.position.set(-0.16, 2.38, 0.35);
  personagem.add(olhoEsq);

  const olhoDir = new THREE.Mesh(olhoGeo, olhoMat);
  olhoDir.position.set(0.16, 2.38, 0.35);
  personagem.add(olhoDir);

  const pontoLuz = new THREE.PointLight(0x38bdf8, 1.2, 5);
  pontoLuz.position.set(0, 1.8, 0.8);
  personagem.add(pontoLuz);

  personagem.userData = {
    cor,
    nome: 'Jogador'
  };

  return personagem;
}
