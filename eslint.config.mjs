import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  { ignores: ['.next/**', '.content-local/**', '.vercel/**', 'next-env.d.ts', 'public/media/**'] },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'prefer-rest-params': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
