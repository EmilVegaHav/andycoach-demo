# Andy — demo de coaching

Demo navegable (sin backend) para mostrar el flujo de un coach y un cliente de entrenamiento personal. Los datos viven en `localStorage` del navegador.

Un solo cliente de prueba: **Juan Pérez**, con un mesociclo de hipertrofia ya avanzado a la semana 3.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

- Arriba a la derecha: **Cambiar a cliente / coach**
- En el menú: **Restablecer datos** vuelve al ejemplo inicial

## Qué probar

**Coach:** resumen, mesociclos (crear uno nuevo), rutinas por microciclo, copiar semana anterior, notas, diario de Juan, medidas y progreso/volumen.

**Cliente:** llenar el diario, registrar pesos y reps de la rutina, medidas/fotos, y el formulario de feedback cuando el coach lo habilita.
