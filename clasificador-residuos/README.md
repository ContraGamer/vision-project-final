# Clasificador de residuos (React + Azure Custom Vision)

Front en React (estilo visual tomado de lionfinance-investor-iu) + proxy Express que llama al modelo publicado `residuos-v1`.

## Uso
```bash
npm install
cp .env.example .env     # pega tu CV_KEY (Custom Vision > Performance > Prediction URL)
npm run dev              # front en :5173, API en :8787
```
- **Clasificar**: sube una o varias imágenes y ve las probabilidades por clase.
- **Evaluar modelo**: elige la carpeta `test` (subcarpeta por clase); calcula precisión, recall, F1, matriz de confusión, ROC y AUC; exporta CSV.

## Producción
```bash
npm run build && npm start          # sirve dist/ + API en :8787
docker build -t residuos . && docker run -p 8787:8787 --env-file .env residuos
```

## Estructura
`server/index.js` proxy (la clave nunca llega al navegador) · `src/service` llamadas · `src/utils/metrics.js` métricas (con tests) · `src/pages` pantallas.

> Por ahora las variables están en `.env` (acordado). Antes de publicar el repo: no subir `.env` (ya está en .gitignore) y regenerar la Prediction-Key en Azure.
