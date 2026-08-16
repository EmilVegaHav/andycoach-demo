# Andy — demo de coaching

Demo navegable (sin backend) para mostrar el flujo de un coach y un cliente de entrenamiento personal. Los datos viven en `localStorage` del navegador.

Un solo cliente de prueba entra con `user` / `user`: **Juan Pérez**. El coach ve dos clientes: **Juan Pérez** y **Ana Gómez**.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Entras con:

- **Coach:** usuario `admin` · contraseña `admin`
- **Cliente:** usuario `user` · contraseña `user`

**Cerrar sesión** vuelve al login. **Restablecer datos** (en el menú) vuelve al ejemplo inicial sin cerrar la sesión.

## Qué probar

**Coach:** listado de clientes, resumen de cada uno, mesociclos (crear uno nuevo), rutinas por microciclo, copiar semana anterior, notas, diario, medidas y progreso/volumen.

**Cliente:** llenar el diario, registrar pesos y reps de la rutina, medidas/fotos, y el formulario de feedback cuando el coach lo habilita.
