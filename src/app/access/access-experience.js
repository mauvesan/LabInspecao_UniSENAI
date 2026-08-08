export function getAccessExperience(authenticationProvider) {
  const provider = String(authenticationProvider || 'local')
    .trim()
    .toLowerCase();
  const isSupabase = provider === 'supabase';

  return Object.freeze({
    provider,
    isSupabase,
    title: 'Acesso ao LabInspeção',
    introduction: isSupabase
      ? 'Entre com a conta cadastrada no ISEVE para acessar o LabInspeção.'
      : 'Entre para acessar os módulos didáticos e manter a sessão neste dispositivo.',
    providerLabel: isSupabase ? 'Supabase Auth' : 'Autenticação local',
    providerDescription: isSupabase
      ? 'Sessão remota ativa. O papel Professor ou Aluno é resolvido pelo perfil protegido no Supabase.'
      : 'Sessão local de demonstração. Nenhuma credencial é enviada ao Supabase.',
    showLocalDemoCredentials: !isSupabase,
  });
}
