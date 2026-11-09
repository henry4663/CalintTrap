// Personagem humanoide original do Speed Run Arena, reutilizável nos jogos do CalintTrap.
// Requer Three.js carregado globalmente antes de importar este módulo.
export function criarPersonagem(nick = 'Jogador', opcoes = {}) {
  if (typeof THREE === 'undefined') throw new Error('Three.js precisa ser carregado antes de personagem.js');
  const player = new THREE.Group();
  player.name = 'PersonagemSpeedRunArena';
  
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x0088aa, emissiveIntensity: 0.4, roughness: 0.3 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.1, 12), bodyMat);
  body.position.y = 1.0;
  body.castShadow = true;
  player.add(body);
  
  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff00cc, emissive: 0x880066, emissiveIntensity: 0.5 })
  );
  chest.position.set(0, 1.2, -0.22);
  chest.scale.set(1, 0.7, 0.5);
  player.add(chest);
  
  const headMat = new THREE.MeshStandardMaterial({ color: 0xffdd00, emissive: 0xaa6600, emissiveIntensity: 0.3, roughness: 0.4 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), headMat);
  head.position.y = 1.85;
  head.castShadow = true;
  player.add(head);
  
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 2.08, -0.05);
  
  const brimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.05, 16), brimMat);
  brim.castShadow = true;
  hatGroup.add(brim);
  
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.41, 0.36, 16), crownMat);
  crown.position.y = 0.18;
  crown.castShadow = true;
  hatGroup.add(crown);
  
  const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.42, 0.08, 16), ribbonMat);
  ribbon.position.y = 0.05;
  hatGroup.add(ribbon);
  
  player.add(hatGroup);
  
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  eyeL.position.set(-0.13, 1.9, -0.3);
  player.add(eyeL);
  const pL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshStandardMaterial({ color: 0x000000 }));
  pL.position.set(-0.13, 1.9, -0.38);
  player.add(pL);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.13; player.add(eyeR);
  const pR = pL.clone(); pR.position.x = 0.13; player.add(pR);
  
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.025, 8, 16, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  smile.position.set(0, 1.73, -0.32);
  smile.rotation.z = Math.PI;
  smile.rotation.y = Math.PI;
  player.add(smile);
  
  const armMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff });
  const handMat = new THREE.MeshStandardMaterial({ color: 0xffdd00 });
  
  const armPivotL = new THREE.Group();
  armPivotL.position.set(-0.42, 1.35, 0);
  player.add(armPivotL);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.6, 8), armMat);
  armL.position.y = -0.3; armL.castShadow = true;
  armPivotL.add(armL);
  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), handMat);
  handL.position.y = -0.65;
  armPivotL.add(handL);
  
  const armPivotR = new THREE.Group();
  armPivotR.position.set(0.42, 1.35, 0);
  player.add(armPivotR);
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.6, 8), armMat);
  armR.position.y = -0.3; armR.castShadow = true;
  armPivotR.add(armR);
  const handR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), handMat);
  handR.position.y = -0.65;
  armPivotR.add(handR);
  
  const legMat = new THREE.MeshStandardMaterial({ color: 0xff00cc });
  const footMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  
  const legPivotL = new THREE.Group();
  legPivotL.position.set(-0.18, 0.5, 0);
  player.add(legPivotL);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.55, 8), legMat);
  legL.position.y = -0.28; legL.castShadow = true;
  legPivotL.add(legL);
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.3), footMat);
  footL.position.set(0, -0.6, -0.05);
  legPivotL.add(footL);
  
  const legPivotR = new THREE.Group();
  legPivotR.position.set(0.18, 0.5, 0);
  player.add(legPivotR);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 0.55, 8), legMat);
  legR.position.y = -0.28; legR.castShadow = true;
  legPivotR.add(legR);
  const footR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.3), footMat);
  footR.position.set(0, -0.6, -0.05);
  legPivotR.add(footR);
  

  body.name = 'body'; chest.name = 'chest'; head.name = 'head';
  brim.name = 'brim'; crown.name = 'crown'; armL.name = 'armL'; armR.name = 'armR';
  legL.name = 'legL'; legR.name = 'legR';
  player.userData.nick = String(nick || 'Jogador');
  return player;
}
export default criarPersonagem;
