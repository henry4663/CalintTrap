// Função para equipar ou desequipar um item comprado
window.alternarEquipamento = function(idItem) {
  const nick = getCurrentNick();
  const keyInventario = `goblox_inventario_${nick}`;
  const keyEquipados = `goblox_equipados_${nick}`;

  let inventario = JSON.parse(localStorage.getItem(keyInventario) || "[]");
  let equipados = JSON.parse(localStorage.getItem(keyEquipados) || "[]");

  // Verifica se o jogador realmente comprou o item
  if (!inventario.includes(idItem)) {
    mostrarToast("Você precisa comprar este item primeiro!", "warning");
    return;
  }

  // Se já estiver equipado, desequipa. Se não, equipa.
  const index = equipados.indexOf(idItem);
  if (index > -1) {
    equipados.splice(index, 1);
    mostrarToast(`Item desequipado.`, "info");
  } else {
    equipados.push(idItem);
    mostrarToast(`Item equipado com sucesso!`, "success");
  }

  // Salva no localStorage que o personagem.js lê
  localStorage.setItem(keyEquipados, JSON.stringify(equipados));
  
  // Atualiza a tela do inventário para mostrar o botão correto (Equipado / Usar)
  atualizarInventarioVisual(nick);
};
