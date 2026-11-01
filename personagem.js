// personagem.js
import * as THREE from 'three';

export function criarPersonagem() {
  // Cria um "Grupo" (um container invisível) que vai segurar o corpo e os olhos
  const personagem = new THREE.Group();

  // 1. O Corpo (Cubo roxo com brilho)
  const corpoGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const corpoMat = new THREE.MeshStandardMaterial({ 
    color: 0x7c3aed, 
    roughness: 0.2,
    metalness: 0.5,
    emissive: 0x4c1d95, 
    emissiveIntensity: 0.4 
  });
  const corpo = new THREE.Mesh(corpoGeo, corpoMat);
  corpo.castShadow = true;
  corpo.receiveShadow = true;
  personagem.add(corpo);

  // 2. Os Olhos (Dois quadradinhos brancos na frente)
  const olhoGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
  const olhoMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const olhoEsq = new THREE.Mesh(olhoGeo, olhoMat);
  olhoEsq.position.set(-0.25, 0.2, 0.6); // X, Y, Z (Z positivo é a frente)
  personagem.add(olhoEsq);

  const olhoDir = new THREE.Mesh(olhoGeo, olhoMat);
  olhoDir.position.set(0.25, 0.2, 0.6);
  personagem.add(olhoDir);

  // 3. Uma "luz" na frente pra dar um charme
  const pontoLuz = new THREE.PointLight(0x06b6d4, 1, 5);
  pontoLuz.position.set(0, 0, 0.8);
  personagem.add(pontoLuz);

  return personagem;
}
