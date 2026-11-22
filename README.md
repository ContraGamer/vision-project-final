# Clasificador de residuos reciclables

Proyecto de Visión por Computadora (II Semestre, Unisalle). Clasifica imágenes de residuos en 6 categorías (`cardboard`, `glass`, `metal`, `paper`, `plastic`, `trash`) usando un modelo entrenado en **Azure Custom Vision** sobre el dataset [TrashNet].

Se hicieron dos implementaciones del mismo modelo:

## 1. `clasificador-residuos/` — App web (React + Express)
Versión final/producción. Front en React que permite:
- **Clasificar**: subir una o varias imágenes y ver probabilidades por clase.
- **Evaluar modelo**: cargar un dataset de prueba y calcular precisión, recall, F1, matriz de confusión, ROC y AUC.

Un proxy en Express (`server/index.js`) llama a Azure Custom Vision para que la Prediction-Key nunca llegue al navegador. Ver `clasificador-residuos/README.md` para instrucciones de uso.

## 2. `app_clasificador/` — Prototipo (Streamlit)
Primera versión, más simple, hecha en Python con Streamlit (`app.py`). Mismas dos funciones (clasificar y evaluar) pero sin proxy ni frontend separado; las credenciales se leen de variables de entorno o `st.secrets`.

## Dataset
Las imágenes de entrenamiento/prueba (carpetas `train/`, `val/`, `test/` y los `.zip` de TrashNet) se usaron para entrenar y evaluar el modelo en Azure Custom Vision, pero no se incluyen en este repositorio por su tamaño.

## Informe
El informe en formato IEEE con la metodología, resultados y análisis del proyecto está en los archivos `Informe IEEE clasificacion residuos Anderson - Harold.pdf/docx` (no versionados en este repo).

[TrashNet]: https://github.com/garythung/trashnet
