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

function getLegacyWalletKey(nick, tipo) {
  return tipo === 'fbux' ? `goblox_fbux_${nick}` : `goblox_moedas_${nick}`;
}

function readLegacyWallet(nick) {
  const fbux = sanitizarValor(localStorage.getItem(getLegacyWalletKey(nick, 'fbux')), 0);
  const moedas = sanitizarValor(localStorage.getItem(getLegacyWalletKey(nick, 'moedas')), 0);

  return { fbux, moedas };
}

function migrarWalletLegado(nick, fallback = DEFAULT_WALLET) {
  const nome = limparNick(nick);
  const legado = readLegacyWallet(nome);
  const jaTemValoresLegados = legado.fbux > 0 || legado.moedas > 0;

  if (!jaTemValoresLegados) {
    const walletPadrao = {
      fbux: Number(fallback.fbux ?? DEFAULT_WALLET.fbux),
      moedas: Number(fallback.moedas ?? DEFAULT_WALLET.moedas)
    };

    saveWallet(nome, walletPadrao);
    return walletPadrao;
  }

  const walletMigrado = {
    fbux: sanitizarValor(legado.fbux, Number(fallback.fbux ?? DEFAULT_WALLET.fbux)),
    moedas: sanitizarValor(legado.moedas, Number(fallback.moedas ?? DEFAULT_WALLET.moedas))
  };

  saveWallet(nome, walletMigrado);
  localStorage.removeItem(getLegacyWalletKey(nome, 'fbux'));
  localStorage.removeItem(getLegacyWalletKey(nome, 'moedas'));

  return walletMigrado;
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
    const legado = readLegacyWallet(nome);
    const walletPadrao = {
      fbux: legado.fbux > 0 || legado.moedas > 0
        ? legado.fbux
        : Number(fallback.fbux ?? DEFAULT_WALLET.fbux),
      moedas: legado.fbux > 0 || legado.moedas > 0
        ? legado.moedas
        : Number(fallback.moedas ?? DEFAULT_WALLET.moedas)
    };

    if (legado.fbux > 0 || legado.moedas > 0) {
      saveWallet(nome, walletPadrao);
      localStorage.removeItem(getLegacyWalletKey(nome, 'fbux'));
      localStorage.removeItem(getLegacyWalletKey(nome, 'moedas'));
      return walletPadrao;
    }

    const walletFinal = {
      fbux: Number(fallback.fbux ?? DEFAULT_WALLET.fbux),
      moedas: Number(fallback.moedas ?? DEFAULT_WALLET.moedas)
    };

    saveWallet(nome, walletFinal);
    return walletFinal;
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

  localStorage.removeItem(`goblox_fbux_${nome}_legacy`);
  localStorage.removeItem(`goblox_moedas_${nome}_legacy`);
  localStorage.removeItem(getLegacyWalletKey(nome, 'fbux'));
  localStorage.removeItem(getLegacyWalletKey(nome, 'moedas'));

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

export function migrarParaNovoSistema(nick, fallback = DEFAULT_WALLET) {
  return migrarWalletLegado(nick, fallback);
}
