import next from 'eslint-config-next';

/**
 * Flat ESLint config. eslint-config-next v16 exports a ready-made flat-config array
 * (core-web-vitals + typescript), so we spread it directly — no FlatCompat needed.
 */
const eslintConfig = [
  { ignores: ['node_modules/**', '.next/**', 'coverage/**', 'src/generated/**'] },
  ...next,
];

export default eslintConfig;
