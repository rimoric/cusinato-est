# 🏢 Cusinato Est - Dashboard Remota

Dashboard web per il controllo remoto del sistema domotico dell'ampliamento Est.

## 🎯 Funzionalità

- **🚪 Accessi**: Controllo remoto di 8 portoni e cancelli
- **💡 Luci Interne**: Gestione 5 zone luminose + comando globale
- **💡 Luci Esterne**: Controllo 6 gruppi luci esterne
- **⚙️ Controlli**: Toggle manuali per Caldaia, Compressore, Crepuscolare

## 🛠️ Tecnologie

- React 18
- Tailwind CSS
- MQTT.js
- Vite

## 🚀 Installazione

```bash
npm install
```

## 💻 Sviluppo

```bash
npm run dev
```

La dashboard sarà disponibile su `http://localhost:3000`

## 📦 Build

```bash
npm run build
```

## 🌐 Deploy su GitHub Pages

```bash
npm run deploy
```

## 📡 Configurazione MQTT

- **Broker**: broker.emqx.io
- **Porta**: 1883
- **Topic Base**: `cusinato-est/`

### Topic Structure

```
cusinato-est/
├── command/access        → Comandi accessi (40-47)
├── command/lights/indoor → Luci interne (1-5, 99)
├── command/manual        → Toggle manuali
└── status                → Stato generale (futuro)
```

## 🎨 Layout Responsive

- **Desktop** (>768px): Layout singola pagina con tutte le sezioni visibili
- **Mobile** (<768px): Sezioni collassabili (accordion)

## 📋 Mappatura Comandi

### Accessi
- 40: Portone Sud Ovest
- 41: Portone Sud Est
- 42: Portone Est
- 43: Portone Ovest
- 44: Cancello Sud
- 45: Cancello Nord
- 46: Cancelletto
- 47: Porta Uffici

### Luci Interne
- 1: Zona Blu
- 2: Zona Rossa
- 3: Zona Verde
- 4: Zona Gialla
- 5: Zona Lem
- 99: Spegni Tutto

## 📝 License

Private - Cusinato © 2025