# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local iPhone Testing

Use this to test the app on your iPhone while running locally on your Mac.

1. Get your Mac's local IP address (same Wi-Fi as your iPhone):
   - Run `ipconfig getifaddr en0` (or `ipconfig getifaddr en1` depending on your adapter).
2. In your local `.env`, set:
   - `VITE_API_URL=http://<YOUR_MAC_IP>:5001`
   - Optional backend CORS pinning: `FRONTEND_ORIGINS=http://<YOUR_MAC_IP>:5173`
3. Start backend:
   - `npm run server`
4. Start frontend:
   - `npm run dev`
5. Open on iPhone Safari:
   - `http://<YOUR_MAC_IP>:5173`

Notes:
- Vite is configured with `host: "0.0.0.0"` for LAN device access.
- Express binds to `HOST` (default `0.0.0.0`) so API and uploads work from LAN clients.
- Switch environments later by changing `VITE_API_URL`:
  - local desktop: `http://localhost:5001`
  - local phone testing: `http://<YOUR_MAC_IP>:5001`
  - production: `https://your-api-domain`
