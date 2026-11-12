# Goblox para Windows e Android

O aplicativo usa a plataforma Goblox deste repositório, sem duplicar o sistema de login, catálogo ou jogos.

## 1. Publicar a plataforma
O workflow `.github/workflows/pages.yml` publica o repositório no GitHub Pages quando houver um push na branch main.
No GitHub, confira em Settings > Pages se a origem está configurada para GitHub Actions.
Endereço esperado: https://henry4663.github.io/CalintTrap/

## 2. Windows
Requisitos: Node.js LTS e Windows.
```bash
npm install
npm start
npm run build:windows
```
O instalador será criado em `dist/`.

## 3. Android
Requisitos: Node.js LTS, Android Studio e Android SDK.
```bash
npm install
npm run android:add
npm run build:android
```
No Android Studio, escolha Build > Build Bundle(s) / APK(s) > Build APK(s).
O APK ficará na pasta de saída indicada pelo Android Studio.

## Observações
- É necessário internet para abrir a versão hospedada da plataforma.
- O app não cria um servidor de jogos próprio: ele abre a plataforma Goblox existente.
- Para login, multiplayer, Firebase e jogos funcionarem, mantenha os serviços web da plataforma publicados e configurados.
- O primeiro build Android precisa do Android Studio instalado.
