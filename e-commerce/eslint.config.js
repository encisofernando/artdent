import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'scripts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // El proyecto tiene 78 usos reales de `any` heredados — se marcan
      // como warning (visibles, no bloquean el build) en vez de prohibirlos
      // de golpe, para no tener que resolver toda la deuda de una sola vez.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Regla nueva de eslint-plugin-react-hooks v7: detectó 5 casos reales
      // de setState síncrono dentro de un efecto (auth.tsx, cart.tsx,
      // Home.tsx, ProductDetail.tsx, FAQ.tsx) — patrones que funcionan hoy
      // en producción. Se deja en warning (visible, no bloquea el build)
      // para revisarlos uno por uno más adelante en vez de forzar un
      // refactor apurado el mismo día que se activa el linter.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  eslintConfigPrettier,
)
