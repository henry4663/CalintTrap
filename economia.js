const DEFAULT_WALLET = { fbux: 50, moedas: 120 };

function limparNick(nick) {
  return String(nick || '').trim() || 'Jogador';
}

function sanitizarValor(valor, fallback = 0) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return fallback;
  return Math.max(0, Math.floor(Math.abs(numero)));
}

function calcularAssinatura(fbux, moedas) {
  return ((Number(fbux) || 0) * 131 + (Number(moedas) || 0) * 17 + 97) | 0;
}

export function getWallet(nick, fallback = DEFAULT_WALLET) {
  const nome = limparNick(nick);
  const keyFbux = `goblox_fbux_${nome}`;
  const keyMoedas = `goblox_moedas_${nome}`;
  const keyAssinatura = `goblox_wallet_sig_${nome}`;

  const fbuxSalvo = sanitizarValor(localStorage.getItem(keyFbux), Number(fallback.fbux ?? DEFAULT_WALLET.fbux));
  const moedasSalvas = sanitizarValor(localStorage.getItem(keyMoedas), Number(fallback.moedas ?? DEFAULT_WALLET.moedas));
  const assinaturaEsperada = calcularAssinatura(fbuxSalvo, moedasSalvas);
  const assinaturaAtual = Number(localStorage.getItem(keyAssinatura) || 0);

  if (assinaturaAtual !== assinaturaEsperada) {
    const walletPadrao = {
      fbux: Number(fallback.fbux ?? DEFAULT_WALLET.fbux),
      moedas: Number(fallback.moedas ?? DEFAULT_WALLET.moedas)
    };

    localStorage.setItem(keyFbux, String(walletPadrao.fbux));
    localStorage.setItem(keyMoedas, String(walletPadrao.moedas));
    localStorage.setItem(keyAssinatura, String(calcularAssinatura(walletPadrao.fbux, walletPadrao.moedas)));

    return walletPadrao;
  }

  const wallet = { fbux: fbuxSalvo, moedas: moedasSalvas };
  localStorage.setItem(keyAssinatura, String(calcularAssinatura(wallet.fbux, wallet.moedas)));
  return wallet;
}

export function saveWallet(nick, wallet) {
  const nome = limparNick(nick);
  const keyFbux = `goblox_fbux_${nome}`;
  const keyMoedas = `goblox_moedas_${nome}`;
  const keyAssinatura = `goblox_wallet_sig_${nome}`;

  const fbux = sanitizarValor(wallet?.fbux, 0);
  const moedas = sanitizarValor(wallet?.moedas, 0);

  localStorage.setItem(keyFbux, String(fbux));
  localStorage.setItem(keyMoedas, String(moedas));
  localStorage.setItem(keyAssinatura, String(calcularAssinatura(fbux, moedas)));

  return { fbux, moedas };
}

export function validarSaldo(nick, custo = {}) {
  const wallet = getWallet(nick);
  const fbuxNecessario = sanitizarValor(custo.fbux, 0);
  const moedasNecessarias = sanitizarValor(custo.moedas, 0);

  if (wallet.fbux < fbuxNecessario || wallet.moedas < moedasNecessarias) {
    return false;
  }

  return true;
}

export function debitarWallet(nick, custo = {}) {
  const walletAtual = getWallet(nick);
  const fbuxNecessario = sanitizarValor(custo.fbux, 0);
  const moedasNecessarias = sanitizarValor(custo.moedas, 0);

  if (!validarSaldo(nick, custo)) {
    return { ok: false, wallet: walletAtual };
  }

  const proximo = {
    fbux: Math.max(0, walletAtual.fbux - fbuxNecessario),
    moedas: Math.max(0, walletAtual.moedas - moedasNecessarias)
  };

  return { ok: true, wallet: saveWallet(nick, proximo) };
}
