const loaders = {
  frenagem: () => import('./frenagem/index.js'),
  suspensao: () => import('./suspensao/index.js'),
  opacidade: () => import('./opacidade/index.js'),
  gases: () => import('./gases/index.js'),
  'produtos-perigosos': () => import('./produtos-perigosos/index.js'),
};

export async function loadModule(slug) {
  const loader = loaders[slug];

  if (!loader) {
    throw new Error(`Módulo não registrado: ${slug}`);
  }

  const importedModule = await loader();

  return importedModule.default;
}
