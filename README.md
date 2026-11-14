# Business Manage — Cross-Platform Enterprise Operations Suite

Cross-platform business management platform imported from `kiarivn/Business-Management-Application` and configured for **Web (Vite + React + Express)**, **Android Studio (Native Kotlin/Jetpack Compose)**, **Capacitor (Hybrid Android/iOS)**, and **Docker**.

## 1. Web & Full-Stack API (Port 3000)

Runs the responsive React frontend + Express backend (`server.ts`) on port `3000`:

```bash
npm install
npm run dev
```

- **Endpoints**: `GET /orders`, `POST /orders`, `POST /orders/bulk`, `PATCH /orders/:id/status`, `DELETE /orders/:id`, plus `/api/workspace` & `/api/health`.
- Uses a seeded in-memory + JSON-importable store out of the box, and automatically connects to MongoDB when `MONGODB_URI` is set in `.env`.

## 2. Native Android Studio (`android-studio/`)

The native Kotlin + Jetpack Compose + Room SQLite project is optimized for Android Studio in `android-studio/`:

1. Open **Android Studio** -> **File > Open...** -> select the `android-studio/` folder.
2. Copy `android-studio/.env.example` to `android-studio/.env` (optional: set `API_BASE_URL` to your host machine IP or cloud URL; defaults to `http://10.0.2.2:3000` for Android Emulator).
3. Sync Gradle (`JDK 21` / Android SDK 36) and click **Run 'app'**.

## 3. Cross-Platform Capacitor Build (`capacitor.config.json`)

To wrap the Web build into an Android Studio / Xcode shell via Capacitor:

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

## 4. Standalone GoShip API (`goshipapi/`)

If you want to run the standalone CommonJS backend separately:

```bash
cd goshipapi && npm install && npm start
```
