# ADR-001 — Adoption of Vite

**Status:** Aceito

**Data:** Julho de 2026

**Versão:** 1.0

---

# Contexto

O projeto **LabInspeção_UniSENAI** nasceu inicialmente como uma aplicação HTML estática destinada ao desenvolvimento de simuladores educacionais para apoio ao ensino de Inspeção Veicular.

Com a evolução do projeto, tornou-se evidente a necessidade de uma arquitetura mais organizada, capaz de suportar:

- crescimento do número de módulos didáticos;
- reutilização de componentes;
- separação entre conteúdo, lógica e apresentação;
- manutenção simplificada;
- melhor experiência de desenvolvimento;
- possibilidade de evolução para Progressive Web App (PWA).

Esses requisitos ultrapassam as capacidades de uma aplicação baseada apenas em arquivos HTML independentes.

---

# Problema

Era necessário selecionar uma ferramenta de construção (build tool) capaz de fornecer uma base moderna para o desenvolvimento da plataforma, preservando ao mesmo tempo simplicidade, desempenho e facilidade de manutenção.

A solução deveria:

- suportar módulos ES nativos;
- oferecer ambiente moderno de desenvolvimento;
- possuir compilação rápida;
- facilitar a organização do projeto;
- permitir expansão futura sem aumentar significativamente a complexidade.

---

# Alternativas Avaliadas

## HTML + JavaScript puro

### Vantagens

- simplicidade inicial;
- nenhuma dependência externa;
- aprendizado imediato.

### Limitações

- crescimento desorganizado do projeto;
- dificuldade de modularização;
- ausência de pipeline de build;
- baixa escalabilidade;
- manutenção progressivamente mais difícil.

---

## Webpack

### Vantagens

- extremamente poderoso;
- altamente configurável;
- amplo ecossistema.

### Limitações

- configuração complexa;
- curva de aprendizado elevada;
- excesso de recursos para as necessidades do projeto;
- maior tempo de configuração e manutenção.

---

## Parcel

### Vantagens

- configuração simples;
- boa experiência inicial.

### Limitações

- menor controle arquitetural;
- menor adoção em projetos atuais;
- comunidade mais reduzida quando comparada ao Vite.

---

## Vite

### Vantagens

- inicialização extremamente rápida;
- Hot Module Replacement (HMR);
- suporte nativo a ES Modules;
- configuração mínima;
- excelente integração com aplicações JavaScript modernas;
- build otimizado utilizando Rollup;
- ampla adoção pela comunidade;
- arquitetura compatível com crescimento gradual da aplicação.

### Limitações

- necessidade de etapa de build para distribuição;
- dependência do ecossistema Node.js.

---

# Decisão

Foi adotado o **Vite** como ferramenta oficial de desenvolvimento e build do LabInspeção_UniSENAI.

O Vite passa a constituir a infraestrutura de desenvolvimento da plataforma.

Toda a organização do projeto deverá considerar sua utilização como ambiente padrão.

---

# Justificativa

A escolha do Vite foi motivada principalmente pelos seguintes fatores.

## Simplicidade

A configuração inicial é pequena e facilmente compreendida.

O projeto permanece leve mesmo após sua modularização.

---

## Desempenho

Durante o desenvolvimento, o Vite utiliza ES Modules nativos, proporcionando inicialização quase instantânea e atualização rápida dos módulos modificados.

Isso reduz significativamente o tempo de espera durante o desenvolvimento.

---

## Modularização

A arquitetura baseada em módulos permite separar claramente:

- componentes;
- módulos didáticos;
- simuladores;
- estilos;
- infraestrutura.

Essa separação favorece reutilização e manutenção.

---

## Escalabilidade

A plataforma foi concebida para crescer continuamente.

A adoção do Vite fornece uma base suficientemente robusta para suportar:

- novos módulos;
- novos simuladores;
- novos componentes;
- novas funcionalidades.

Sem necessidade de alterações estruturais significativas.

---

## Compatibilidade

O Vite integra-se naturalmente com tecnologias atualmente utilizadas pelo projeto, incluindo:

- JavaScript moderno (ES Modules);
- CSS modular;
- Progressive Web Apps (PWA);
- Service Workers;
- GitHub Pages;
- GitHub Actions.

---

# Consequências

A adoção do Vite implica as seguintes consequências arquiteturais.

## Organização Modular

A aplicação deixa de ser composta por páginas HTML independentes e passa a utilizar módulos JavaScript organizados em uma arquitetura única.

---

## Processo de Build

A distribuição da aplicação passa a depender do processo oficial de build.

A pasta de distribuição (`dist/`) passa a representar a versão oficial para publicação.

---

## Dependência do Node.js

O ambiente de desenvolvimento passa a requerer Node.js e npm como dependências obrigatórias.

---

## Estrutura Padronizada

A organização do projeto passa a seguir uma estrutura modular compatível com o processo de build do Vite.

---

## Evolução Tecnológica

A plataforma poderá incorporar futuramente recursos adicionais disponibilizados pelo ecossistema Vite sem necessidade de mudanças arquiteturais significativas.

---

# Impactos para os Desenvolvedores

Todos os novos desenvolvimentos deverão utilizar o ambiente Vite.

Os comandos oficiais passam a ser:

```bash
npm install
npm run dev
npm run check
npm run build
```

Esses comandos constituem o fluxo padrão de desenvolvimento do projeto.

---

# Relação com outros ADR

Esta decisão fundamenta diretamente:

- ADR-002 — Modular Architecture
- ADR-003 — Offline First
- ADR-004 — Plugin Lifecycle

A adoção da arquitetura modular descrita nos ADR subsequentes pressupõe a utilização do Vite como infraestrutura de desenvolvimento.

---

# Consequências de Longo Prazo

A adoção do Vite estabelece uma base tecnológica moderna para o LabInspeção_UniSENAI.

Essa decisão favorece:

- manutenção simplificada;
- evolução incremental da plataforma;
- reutilização de componentes;
- melhor experiência de desenvolvimento;
- maior desempenho durante o desenvolvimento;
- facilidade de expansão futura;
- maior longevidade da arquitetura do sistema.
