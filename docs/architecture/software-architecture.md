# LabInspeção_UniSENAI

# Documento de Arquitetura de Software

Seção 1 — Introdução

A estrutura atual é boa, mas proponho expandi-la para algo como segue.

1. Introdução
   1.1 Finalidade

Este documento estabelece a arquitetura de software da plataforma LabInspeção_UniSENAI, definindo sua organização estrutural, princípios arquiteturais, componentes, tecnologias, responsabilidades e diretrizes para evolução ao longo de seu ciclo de vida.

A arquitetura descrita neste documento constitui a referência técnica oficial do projeto e orienta as decisões relacionadas ao desenvolvimento, manutenção, integração e expansão da plataforma. Seu objetivo é garantir que a evolução do software ocorra de forma consistente, preservando a modularidade, a reutilização de componentes, a facilidade de manutenção e a coerência entre as decisões arquiteturais adotadas.

Além de orientar a implementação técnica, este documento estabelece uma linguagem comum entre desenvolvedores, docentes, pesquisadores e futuros mantenedores, reduzindo ambiguidades e facilitando a continuidade do projeto independentemente da equipe responsável por sua evolução.

1.2 Visão de Longo Prazo

O LabInspeção_UniSENAI foi concebido como uma plataforma educacional digital destinada ao apoio ao ensino de Sistemas Automotivos, inicialmente voltada às disciplinas relacionadas à inspeção veicular, segurança, emissões e diagnóstico técnico.

Sua primeira geração foi composta por simuladores independentes desenvolvidos em HTML, CSS e JavaScript. Embora esses recursos tenham atendido às necessidades iniciais do projeto, o crescimento do número de simuladores evidenciou limitações relacionadas à reutilização de código, manutenção, padronização da interface, gerenciamento do estado da aplicação e evolução tecnológica.

A arquitetura da versão 4.x representa uma mudança estrutural significativa, transformando um conjunto de aplicações independentes em uma plataforma integrada, modular e evolutiva. Essa nova arquitetura separa claramente infraestrutura tecnológica, funcionalidades compartilhadas, componentes técnicos e organização pedagógica, permitindo que novos módulos sejam incorporados progressivamente sem comprometer a estabilidade do sistema.

A longo prazo, a plataforma deverá apoiar diferentes componentes curriculares da área automotiva, integrar recursos digitais de aprendizagem, disponibilizar mecanismos de acompanhamento do desempenho dos estudantes, oferecer serviços de sincronização de dados e possibilitar integração com ambientes virtuais de aprendizagem, sistemas institucionais e tecnologias emergentes, incluindo recursos baseados em inteligência artificial.

1.3 Escopo

Este documento descreve exclusivamente a arquitetura de software da plataforma, abrangendo:

princípios arquiteturais;
organização estrutural dos componentes;
responsabilidades das principais camadas da aplicação;
organização do código-fonte;
tecnologias adotadas;
mecanismos de persistência de dados;
estratégia de modularização;
diretrizes para evolução arquitetural.

Não fazem parte do escopo deste documento detalhes específicos de implementação, algoritmos internos, interfaces gráficas, regras de negócio particulares dos módulos pedagógicos ou procedimentos de desenvolvimento. Esses aspectos são documentados em artefatos específicos, como documentos de desenvolvimento, especificações funcionais, ADRs (Architecture Decision Records) e documentação técnica dos módulos.

1.4 Público-alvo

Este documento destina-se aos diferentes perfis envolvidos na concepção, desenvolvimento, utilização e manutenção da plataforma, incluindo:

desenvolvedores responsáveis pela implementação e evolução do software;
docentes que utilizam ou colaboram na elaboração de novos módulos pedagógicos;
coordenadores acadêmicos envolvidos no planejamento e acompanhamento da plataforma;
pesquisadores que utilizam o ambiente como objeto de investigação ou experimentação;
futuros mantenedores responsáveis pela continuidade do projeto;
colaboradores externos que necessitem compreender a arquitetura antes de contribuir com seu desenvolvimento.

Embora possua caráter predominantemente técnico, o documento procura utilizar uma linguagem clara e organizada, permitindo que profissionais de diferentes formações compreendam os princípios fundamentais que orientam a arquitetura da plataforma.

1.5 Organização deste Documento

Este documento está estruturado em capítulos que descrevem progressivamente os diferentes níveis da arquitetura da plataforma.

Após esta introdução, são apresentados a visão geral do sistema, os objetivos e princípios arquiteturais que orientam as decisões de projeto. Em seguida são descritos a arquitetura geral, os componentes da plataforma, a organização do repositório, o modelo de plugins, as tecnologias adotadas, a arquitetura pedagógica, a estratégia de persistência e sincronização dos dados e o planejamento de evolução da plataforma.

Os diagramas arquiteturais apresentados ao longo deste documento são complementados pelo documento architecture-diagrams.md, que reúne as representações gráficas oficiais da arquitetura e deve ser consultado em conjunto com este documento. Da mesma forma, decisões arquiteturais específicas são registradas por meio dos respectivos Architecture Decision Records (ADR), preservando a rastreabilidade das principais escolhas de projeto.

2. Visão Geral da Plataforma
   2.1 Contexto

O LabInspeção_UniSENAI é uma plataforma educacional digital desenvolvida para apoiar o ensino de Sistemas Automotivos por meio de recursos interativos que integram conteúdos teóricos, simulações computacionais, estudos de caso, avaliações formativas e acompanhamento da aprendizagem.

A plataforma foi concebida para atender inicialmente às disciplinas relacionadas à inspeção de segurança veicular, inspeção de emissões, diagnóstico automotivo e tecnologias da mobilidade. Entretanto, sua arquitetura foi projetada para permitir a incorporação progressiva de novos componentes curriculares e diferentes áreas do conhecimento automotivo, preservando uma base tecnológica comum e reutilizável.

Ao contrário de aplicações monolíticas desenvolvidas para uma finalidade específica, o LabInspeção_UniSENAI adota uma arquitetura modular, permitindo que novos recursos sejam adicionados de forma incremental sem comprometer os componentes existentes. Essa abordagem favorece a evolução contínua da plataforma, reduz o custo de manutenção e amplia sua capacidade de adaptação às necessidades educacionais futuras.

2.2 Motivação

As primeiras versões do projeto foram desenvolvidas como simuladores independentes em HTML, CSS e JavaScript, destinados a apoiar atividades específicas em sala de aula. Embora esses simuladores tenham apresentado resultados satisfatórios sob o ponto de vista pedagógico, sua evolução revelou limitações relacionadas à manutenção, reutilização de código, padronização visual, gerenciamento do estado da aplicação e compartilhamento de funcionalidades comuns.

A criação da versão 4.x representa uma mudança arquitetural significativa, substituindo um conjunto de aplicações independentes por uma plataforma integrada, organizada em componentes especializados e preparada para crescimento contínuo.

Essa nova arquitetura permite separar claramente as responsabilidades entre infraestrutura tecnológica, lógica de aplicação, organização pedagógica e implementação técnica dos recursos educacionais.

2.3 Propósito da Plataforma

A plataforma tem como propósito oferecer um ambiente unificado para desenvolvimento, execução e gerenciamento de recursos digitais de aprendizagem voltados ao ensino automotivo.

Entre seus principais objetivos destacam-se:

disponibilizar módulos educacionais organizados por competências e unidades curriculares;
integrar diferentes tipos de recursos didáticos em uma experiência única de aprendizagem;
apoiar atividades práticas por meio de simulações computacionais;
registrar evidências de aprendizagem e progresso dos estudantes;
facilitar a reutilização de componentes entre diferentes disciplinas;
fornecer uma infraestrutura tecnológica sustentável para evolução de longo prazo.

A arquitetura foi concebida para atender simultaneamente às necessidades pedagógicas, técnicas e institucionais da plataforma.

2.4 Características Gerais

A plataforma apresenta as seguintes características arquiteturais:

aplicação web do tipo Single Page Application (SPA);
arquitetura modular baseada em componentes especializados;
separação entre domínio pedagógico e implementação técnica;
suporte à execução offline com sincronização posterior;
publicação como aplicação estática;
evolução incremental orientada por documentação arquitetural;
reutilização de componentes compartilhados;
independência entre módulos pedagógicos;
suporte à incorporação progressiva de novas funcionalidades.

Essas características permitem que a plataforma evolua continuamente sem exigir reestruturações significativas da arquitetura principal.

2.5 Organização Arquitetural

A arquitetura do LabInspeção_UniSENAI está organizada em componentes com responsabilidades bem definidas.

A Interface constitui o ponto de interação entre o usuário e a aplicação, sendo responsável pela apresentação das informações, navegação e experiência de uso.

O Core representa o núcleo da plataforma. Cabe a ele coordenar o ciclo de vida da aplicação, gerenciar a navegação, controlar o carregamento de plugins, manter o estado global da aplicação e disponibilizar serviços compartilhados aos demais componentes.

Os Módulos Pedagógicos representam a organização educacional da plataforma. Cada módulo corresponde a uma unidade de aprendizagem estruturada a partir de objetivos educacionais, competências, conteúdos, atividades e avaliações.

Os Plugins Técnicos implementam os recursos computacionais utilizados pelos módulos, como simuladores, calculadoras, questionários, visualizações gráficas e outras funcionalidades interativas. Diferentemente dos módulos, os plugins pertencem ao domínio tecnológico e podem ser reutilizados em diferentes contextos pedagógicos.

Os Serviços Compartilhados concentram funcionalidades utilizadas por múltiplos componentes da aplicação, incluindo persistência, sincronização, gerenciamento de sessão, exportação de dados, armazenamento local e comunicação com serviços externos.

A Camada de Persistência é responsável pelo armazenamento das informações produzidas durante a utilização da plataforma, adotando inicialmente uma estratégia offline-first, com sincronização posterior para serviços remotos quando houver conectividade.

Essa separação de responsabilidades constitui o principal elemento organizador da arquitetura e orienta todas as decisões de desenvolvimento da plataforma.

2.6 Visão Arquitetural Simplificada

A Figura correspondente ao diagrama D01 — Visão Geral da Plataforma, apresentada no documento architecture-diagrams.md, resume a organização estrutural do sistema.

Esse diagrama apresenta a relação entre Interface, Core, Módulos Pedagógicos, Plugins Técnicos, Serviços Compartilhados e Persistência, constituindo a visão conceitual mais abrangente da arquitetura da plataforma.

2.7 Diretrizes Gerais

A evolução da plataforma deverá preservar os seguintes princípios gerais:

o Core não deve conter lógica específica de módulos pedagógicos;
módulos pedagógicos descrevem a experiência de aprendizagem, não sua implementação técnica;
plugins implementam funcionalidades reutilizáveis e independentes do currículo;
componentes devem comunicar-se por contratos arquiteturais bem definidos;
novas funcionalidades devem privilegiar reutilização antes da criação de novos componentes;
alterações estruturais relevantes deverão ser registradas por meio de Architecture Decision Records (ADR) e refletidas na documentação arquitetural correspondente.

Essas diretrizes estabelecem a base para o crescimento sustentável da plataforma, preservando sua consistência arquitetural ao longo de futuras versões.

3. Objetivos Arquiteturais

A arquitetura do LabInspeção_UniSENAI foi concebida para atender simultaneamente aos requisitos funcionais da plataforma e aos atributos de qualidade necessários para garantir sua evolução sustentável ao longo do tempo.

Os objetivos arquiteturais apresentados nesta seção orientam todas as decisões relacionadas ao desenvolvimento, organização do código, adoção de tecnologias e incorporação de novas funcionalidades. Sempre que houver necessidade de avaliar alternativas técnicas, estes objetivos deverão servir como referência para a tomada de decisão.

3.1 Modularidade

A plataforma deve ser organizada em componentes independentes, com responsabilidades claramente definidas e baixo grau de dependência entre si.

Cada componente deve possuir uma finalidade específica e interagir com os demais exclusivamente por meio de interfaces ou contratos arquiteturais previamente definidos.

A modularidade reduz a complexidade do sistema, facilita a manutenção e permite que novos recursos sejam incorporados sem exigir modificações significativas na estrutura existente.

Na organização da plataforma, esse princípio se materializa principalmente na separação entre:

Core;
Interface;
Módulos Pedagógicos;
Plugins Técnicos;
Serviços Compartilhados;
Persistência.
3.2 Baixo Acoplamento

Os componentes da plataforma devem possuir o menor número possível de dependências diretas.

Nenhum módulo pedagógico deverá conhecer detalhes internos de outros módulos, assim como plugins não deverão depender da implementação específica de outros plugins.

O Core deverá atuar como elemento coordenador da aplicação, reduzindo dependências cruzadas e centralizando serviços compartilhados.

Essa estratégia facilita substituições futuras, reduz impactos de manutenção e aumenta a estabilidade da arquitetura.

3.3 Alta Coesão

Cada componente da plataforma deve concentrar responsabilidades relacionadas a um único propósito.

Quanto maior a coesão de um componente, maior será sua facilidade de compreensão, manutenção, teste e reutilização.

Por exemplo:

plugins implementam funcionalidades técnicas;
módulos organizam experiências pedagógicas;
serviços executam funcionalidades compartilhadas;
o Core coordena a aplicação.

A distribuição adequada de responsabilidades reduz duplicações e simplifica a evolução do sistema.

3.4 Reutilização

Sempre que possível, funcionalidades comuns deverão ser implementadas uma única vez e reutilizadas por diferentes módulos da plataforma.

A reutilização reduz o esforço de desenvolvimento, melhora a consistência da experiência do usuário e diminui a probabilidade de introdução de inconsistências entre diferentes partes da aplicação.

Exemplos de componentes naturalmente reutilizáveis incluem:

motores de quiz;
mecanismos de simulação;
geração de gráficos;
exportação de resultados;
gerenciamento de progresso;
serviços de persistência.
3.5 Evolução Incremental

A arquitetura foi projetada para permitir crescimento progressivo, evitando grandes reestruturações ao longo do ciclo de vida do projeto.

Novas funcionalidades deverão ser incorporadas de maneira incremental, preservando compatibilidade com os componentes existentes e minimizando impactos sobre a base instalada.

Sempre que possível, a evolução deverá ocorrer por extensão da arquitetura existente, e não por substituição de seus componentes centrais.

Alterações estruturais relevantes deverão ser registradas por meio de Architecture Decision Records (ADR).

3.6 Independência entre Arquitetura Pedagógica e Arquitetura Técnica

Um dos princípios fundamentais do projeto consiste na separação entre organização pedagógica e implementação tecnológica.

Os Módulos Pedagógicos representam unidades de aprendizagem estruturadas a partir de objetivos educacionais, competências e atividades.

Os Plugins Técnicos, por sua vez, representam componentes de software responsáveis pela implementação dos recursos computacionais utilizados pelos módulos.

Essa separação permite que:

um módulo utilize múltiplos plugins;
um plugin seja reutilizado por diferentes módulos;
mudanças curriculares não impliquem alterações significativas na infraestrutura tecnológica;
novas funcionalidades sejam desenvolvidas independentemente da organização didática.
3.7 Funcionamento Offline (Offline First)

A plataforma deverá priorizar sua operação local, permitindo que as principais funcionalidades permaneçam disponíveis mesmo na ausência de conexão com a Internet.

Dados produzidos durante a utilização deverão ser armazenados localmente e sincronizados posteriormente quando houver conectividade.

Essa estratégia aumenta a disponibilidade da aplicação, reduz dependências de infraestrutura externa e amplia sua utilização em diferentes ambientes educacionais.

3.8 Publicação Simplificada

A plataforma deverá ser distribuída preferencialmente como uma aplicação web estática, reduzindo a necessidade de infraestrutura dedicada para hospedagem.

Sempre que possível, o sistema deverá depender apenas de recursos executados no navegador do usuário, utilizando serviços remotos apenas quando estritamente necessários.

Essa abordagem reduz custos operacionais, simplifica atualizações e facilita a implantação em diferentes ambientes institucionais.

3.9 Simplicidade Tecnológica

As decisões arquiteturais deverão privilegiar soluções simples, maduras e amplamente consolidadas.

A introdução de novas tecnologias somente deverá ocorrer quando houver benefícios claramente demonstráveis para o projeto.

Esse princípio busca reduzir a complexidade técnica, facilitar a manutenção da plataforma e ampliar sua longevidade.

Sempre que diferentes soluções apresentarem resultados equivalentes, deverá ser priorizada aquela que possuir menor complexidade de implementação e manutenção.

3.10 Documentação Permanente

A documentação arquitetural constitui parte integrante do produto de software.

Toda alteração estrutural relevante deverá ser refletida na documentação correspondente, preservando a consistência entre implementação e arquitetura.

Além deste documento, fazem parte da documentação oficial da arquitetura:

architecture-diagrams.md;
Architecture Decision Records (ADR);
documentação de desenvolvimento;
documentação do repositório.

Nenhuma alteração arquitetural significativa deverá ser considerada concluída antes da atualização dos respectivos documentos.

3.11 Sustentabilidade Arquitetural

A arquitetura deve permanecer compreensível, extensível e sustentável ao longo de seu ciclo de vida.

Isso implica que novas funcionalidades sejam incorporadas sem comprometer os princípios fundamentais estabelecidos neste documento.

Sempre que surgirem novas necessidades, a prioridade deverá ser adaptar a arquitetura existente antes de introduzir novos componentes ou tecnologias.

Esse princípio busca preservar a estabilidade da plataforma, evitar crescimento desordenado da complexidade e facilitar sua continuidade por futuras equipes de desenvolvimento.

Síntese dos Objetivos Arquiteturais
Objetivo Finalidade
Modularidade Organizar o sistema em componentes independentes e especializados.
Baixo Acoplamento Minimizar dependências entre componentes.
Alta Coesão Concentrar responsabilidades relacionadas em cada componente.
Reutilização Compartilhar funcionalidades comuns entre diferentes módulos.
Evolução Incremental Permitir crescimento contínuo da plataforma sem reestruturações significativas.
Independência Pedagógica Separar organização educacional da implementação técnica.
Offline First Garantir funcionamento local com sincronização posterior.
Publicação Simplificada Facilitar implantação e manutenção da aplicação.
Simplicidade Tecnológica Priorizar soluções maduras, estáveis e de baixa complexidade.
Documentação Permanente Manter arquitetura e implementação continuamente sincronizadas.
Sustentabilidade Arquitetural Assegurar a evolução consistente da plataforma ao longo do tempo.

4. Princípios Arquiteturais

Os princípios arquiteturais representam as diretrizes permanentes que orientam o desenvolvimento e a evolução da plataforma LabInspeção_UniSENAI.

Enquanto os objetivos arquiteturais estabelecem os atributos de qualidade desejados para o sistema, os princípios arquiteturais definem regras gerais de projeto que devem ser observadas na implementação de novos componentes, na evolução dos existentes e na avaliação de decisões técnicas.

Esses princípios devem ser considerados em conjunto. Nenhum deles deve ser interpretado de forma isolada ou absoluta, sendo responsabilidade da equipe de desenvolvimento buscar o equilíbrio entre simplicidade, desempenho, reutilização e sustentabilidade da arquitetura.

4.1 Separação de Responsabilidades

Cada componente da plataforma deve possuir responsabilidades claramente definidas e concentradas em um único domínio funcional.

A separação adequada das responsabilidades reduz o acoplamento entre componentes, facilita a compreensão da arquitetura e torna o sistema mais simples de manter e evoluir.

No LabInspeção_UniSENAI, essa separação é materializada pela existência de componentes especializados, tais como Interface, Core, Módulos Pedagógicos, Plugins Técnicos, Serviços Compartilhados e Persistência.

Nenhum componente deve assumir responsabilidades pertencentes a outro domínio da arquitetura.

4.2 Arquitetura Orientada por Componentes

A plataforma é organizada como um conjunto de componentes independentes que cooperam entre si por meio de interfaces bem definidas.

Cada componente deve ser desenvolvido, testado e evoluído de forma relativamente independente, reduzindo impactos sobre o restante do sistema.

Sempre que possível, componentes deverão ser reutilizados em diferentes contextos da aplicação.

Essa abordagem favorece a escalabilidade da plataforma e reduz a necessidade de duplicação de código.

4.3 Independência entre Domínio Pedagógico e Domínio Técnico

Um dos princípios centrais da arquitetura consiste na separação entre organização pedagógica e implementação tecnológica.

Os módulos representam a estrutura educacional da plataforma, enquanto os plugins representam recursos computacionais reutilizáveis.

Essa distinção permite que:

um módulo utilize múltiplos plugins;
um plugin seja compartilhado por diferentes módulos;
mudanças curriculares ocorram sem alterações na infraestrutura tecnológica;
novos recursos técnicos sejam incorporados sem modificar a organização pedagógica.

Essa separação constitui um dos pilares da arquitetura da versão 4.x.

4.4 Baixo Acoplamento

Os componentes da plataforma devem conhecer apenas as informações estritamente necessárias para desempenhar suas responsabilidades.

Dependências diretas entre componentes devem ser minimizadas.

Sempre que possível, a comunicação deverá ocorrer por meio de contratos arquiteturais estáveis, evitando que alterações internas de um componente afetem outros elementos da aplicação.

O Core atua como elemento coordenador, reduzindo dependências cruzadas entre plugins, módulos e serviços.

4.5 Alta Coesão

Cada componente deve concentrar funcionalidades relacionadas ao seu propósito principal.

Componentes excessivamente genéricos ou que acumulem responsabilidades distintas tendem a aumentar a complexidade da manutenção e dificultar a evolução da arquitetura.

Sempre que um componente passar a desempenhar múltiplas responsabilidades independentes, sua decomposição deverá ser considerada.

4.6 Reutilização Antes de Duplicação

Sempre que uma funcionalidade puder ser compartilhada por diferentes partes da plataforma, sua implementação deverá ocorrer na forma de componente reutilizável.

Motores de simulação, serviços de persistência, mecanismos de exportação, gráficos e componentes de interface são exemplos naturais de funcionalidades reutilizáveis.

A duplicação de código somente deverá ocorrer quando a reutilização resultar em aumento significativo da complexidade ou perda de clareza da solução.

4.7 Simplicidade Antes da Complexidade

A arquitetura deve privilegiar soluções simples, compreensíveis e fáceis de manter.

Novas abstrações, padrões de projeto ou tecnologias somente deverão ser introduzidos quando resolverem problemas reais da plataforma.

A complexidade não deve ser antecipada.

Esse princípio favorece uma evolução incremental da arquitetura e reduz o risco de superengenharia (overengineering).

4.8 Evolução Incremental

A arquitetura foi concebida para crescer progressivamente.

Novos componentes deverão ser incorporados quando houver necessidade comprovada, evitando antecipar estruturas cuja utilidade ainda não tenha sido demonstrada.

Da mesma forma, a criação de novos serviços, engines ou camadas deverá ocorrer apenas quando existir uma responsabilidade compartilhada claramente identificada.

4.9 Offline First

A plataforma deve permanecer plenamente utilizável mesmo na ausência de conexão com a Internet.

Funcionalidades essenciais deverão executar localmente sempre que possível.

A sincronização com serviços remotos deverá ocorrer de maneira assíncrona e resiliente, sem comprometer a experiência do usuário durante períodos de indisponibilidade da rede.

4.10 Documentação como Parte do Produto

A documentação arquitetural não constitui um artefato externo ao software, mas parte integrante do próprio produto.

Toda alteração arquitetural relevante deverá ser refletida na documentação correspondente antes da conclusão da atividade de desenvolvimento.

Essa documentação inclui:

Documento de Arquitetura de Software;
Catálogo Oficial de Diagramas;
Architecture Decision Records (ADR);
documentação técnica complementar.

A sincronização permanente entre implementação e documentação reduz a perda de conhecimento ao longo do tempo e facilita a continuidade do projeto.

4.11 Evolução Guiada por ADR

Decisões que alterem significativamente a arquitetura deverão ser registradas por meio de Architecture Decision Records (ADR).

Cada ADR deverá documentar:

contexto da decisão;
alternativas consideradas;
decisão adotada;
justificativa;
consequências esperadas.

Esse mecanismo preserva a rastreabilidade das decisões arquiteturais e facilita sua compreensão por futuros desenvolvedores.

4.12 Estabilidade da Arquitetura

Alterações arquiteturais deverão priorizar a preservação da estabilidade da plataforma.

Mudanças estruturais somente deverão ocorrer quando produzirem benefícios claramente superiores aos custos de migração, manutenção e adaptação.

A evolução da arquitetura deve privilegiar extensão em vez de substituição.

Esse princípio reduz riscos de regressão e contribui para a continuidade do desenvolvimento ao longo de diferentes ciclos do projeto.

4.13 Consistência Arquitetural

Todos os novos componentes incorporados ao sistema deverão respeitar os princípios definidos neste documento.

Quando houver necessidade de introduzir exceções, estas deverão ser explicitamente justificadas e registradas por meio de um ADR correspondente.

A consistência arquitetural é considerada um requisito de qualidade da plataforma e deverá ser preservada independentemente da evolução tecnológica do projeto.

Quadro Resumo dos Princípios Arquiteturais
Princípio Objetivo
Separação de Responsabilidades Delimitar claramente as funções de cada componente.
Arquitetura Orientada por Componentes Organizar a plataforma em componentes independentes.
Independência entre Domínio Pedagógico e Técnico Separar currículo e implementação de software.
Baixo Acoplamento Minimizar dependências entre componentes.
Alta Coesão Concentrar responsabilidades relacionadas em cada componente.
Reutilização Antes de Duplicação Compartilhar funcionalidades comuns.
Simplicidade Antes da Complexidade Evitar soluções desnecessariamente complexas.
Evolução Incremental Permitir crescimento progressivo da arquitetura.
Offline First Garantir funcionamento local com sincronização posterior.
Documentação como Parte do Produto Manter arquitetura e documentação permanentemente sincronizadas.
Evolução Guiada por ADR Registrar formalmente decisões arquiteturais relevantes.
Estabilidade da Arquitetura Priorizar continuidade e minimizar impactos de mudanças.
Consistência Arquitetural Assegurar aderência contínua aos princípios definidos.

5. Conceitos Fundamentais

Esta seção estabelece a terminologia oficial utilizada na arquitetura do LabInspeção_UniSENAI.

Os conceitos aqui definidos constituem a base para interpretação dos demais documentos arquiteturais, incluindo diagramas, Architecture Decision Records (ADR), documentação técnica e especificações de desenvolvimento.

Sempre que houver dúvida quanto ao significado de um termo arquitetural, deverá prevalecer a definição apresentada nesta seção.

5.1 Plataforma

A Plataforma LabInspeção_UniSENAI corresponde ao conjunto completo de componentes de software, infraestrutura, recursos educacionais e serviços que compõem o ambiente digital de aprendizagem.

A plataforma não deve ser confundida com um simulador específico ou com um módulo pedagógico isolado.

Ela compreende:

interface de usuário;
núcleo da aplicação (Core);
módulos pedagógicos;
plugins técnicos;
serviços compartilhados;
mecanismos de persistência;
infraestrutura de sincronização;
documentação arquitetural.

A plataforma representa o produto de software como um todo.

5.2 Core

O Core constitui o núcleo da arquitetura da plataforma.

Sua responsabilidade é coordenar o funcionamento geral da aplicação, disponibilizando infraestrutura comum aos demais componentes.

Entre suas principais responsabilidades estão:

gerenciamento do ciclo de vida da aplicação;
roteamento e navegação;
gerenciamento de estado global;
carregamento de plugins;
disponibilização de serviços compartilhados;
coordenação da sessão do usuário;
gerenciamento de eventos da aplicação.

O Core não deve conter lógica pedagógica específica nem implementação particular de módulos.

Seu papel é fornecer infraestrutura para execução da plataforma.

5.3 Interface

A Interface representa a camada responsável pela interação entre o usuário e a plataforma.

Ela compreende todos os elementos visuais utilizados para apresentação das informações e realização das interações.

Entre suas responsabilidades destacam-se:

navegação;
renderização das telas;
apresentação dos conteúdos;
coleta de entradas do usuário;
feedback visual;
acessibilidade.

A Interface não deve implementar regras de negócio nem acessar diretamente mecanismos de persistência.

5.4 Módulo Pedagógico

O Módulo Pedagógico representa uma unidade de aprendizagem organizada segundo objetivos educacionais.

Cada módulo estrutura uma experiência de aprendizagem composta por conteúdos, atividades, simulações, estudos de caso, avaliações e mecanismos de acompanhamento.

O módulo define o que será ensinado, mas não determina como cada funcionalidade será implementada tecnicamente.

Exemplos de módulos incluem:

Frenagem;
Suspensão;
Gases Otto;
Opacidade Diesel;
Veículos Elétricos;
Produtos Perigosos.

O módulo pertence ao domínio pedagógico da plataforma.

5.5 Plugin Técnico

O Plugin Técnico representa uma unidade de software carregável responsável pela implementação de funcionalidades especializadas da plataforma.

Plugins constituem o principal mecanismo de extensibilidade da arquitetura e podem ser reutilizados por diferentes módulos pedagógicos.

Todo plugin pertence ao domínio tecnológico da plataforma e deve respeitar o contrato arquitetural definido pelo Core.

Os plugins são classificados em três categorias:

Tool Plugins, que implementam funcionalidades técnicas reutilizáveis;
Experience Plugins, que implementam experiências completas de aprendizagem utilizando um ou mais Tool Plugins;
Integration Plugins, responsáveis pela comunicação com sistemas externos.

Essa classificação organiza o ecossistema de plugins segundo sua finalidade arquitetural, preservando a independência entre domínio pedagógico e domínio tecnológico.

5.5.1 Tool Plugin

Um Tool Plugin implementa uma funcionalidade técnica reutilizável.

Seu objetivo é fornecer capacidades computacionais que podem ser utilizadas por diferentes módulos ou Experience Plugins.

Exemplos:

Quiz;
Simulador;
Calculadora;
Timeline;
Chart;
PDF Viewer;
Comparador.

Tool Plugins não possuem conhecimento sobre conteúdos curriculares específicos.

5.5.2 Experience Plugin

Um Experience Plugin implementa uma experiência digital completa de aprendizagem.

Pode combinar diferentes Tool Plugins para oferecer ao estudante uma sequência integrada de atividades, simulações, avaliações e feedbacks.

Exemplos:

Laboratório Virtual de Emissões Otto;
Diagnóstico de Sistema ABS;
Estudo de Caso de Inspeção Veicular;
Simulação de Recuperação de Grande Monta.

Experience Plugins permanecem pertencendo ao domínio técnico da plataforma, podendo ser associados a um ou mais módulos pedagógicos.

5.5.3 Integration Plugin

Um Integration Plugin encapsula a comunicação entre a plataforma e serviços externos.

Exemplos:

Moodle;
Google Drive;
Google Sheets;
Microsoft Teams;
OpenAI;
APIs institucionais.

Seu objetivo é isolar dependências externas, preservando a estabilidade da arquitetura interna.

5.6 Serviço

Um Serviço corresponde a um componente compartilhado responsável por disponibilizar funcionalidades utilizadas por múltiplas partes da aplicação.

Serviços normalmente não possuem interface própria e são acessados pelo Core ou pelos plugins.

Exemplos:

persistência;
sincronização;
exportação;
autenticação;
armazenamento;
analytics.

Sempre que uma funcionalidade passar a ser utilizada por diferentes componentes, sua implementação deverá ser considerada candidata à transformação em um serviço compartilhado.

5.7 Engine

Uma Engine representa um componente reutilizável responsável pela execução de um tipo específico de processamento.

Diferentemente de um plugin, que implementa funcionalidades completas percebidas pelo usuário, uma engine fornece capacidades técnicas reutilizáveis utilizadas por diferentes plugins ou serviços.

Exemplos previstos incluem:

Quiz Engine;
Simulation Engine;
Chart Engine;
Rule Engine.

Engines não devem conter conteúdo pedagógico específico.

5.8 Dashboard

O Dashboard corresponde à interface responsável pela consolidação e apresentação de informações relevantes ao usuário.

Dependendo do perfil de utilização, diferentes dashboards poderão existir.

Exemplos:

Dashboard do Estudante;
Dashboard do Docente;
Dashboard Administrativo.

Os dashboards apresentam informações produzidas por outros componentes da plataforma e não constituem mecanismos de persistência.

5.9 Persistência

A Persistência corresponde ao conjunto de mecanismos responsáveis pelo armazenamento e recuperação das informações produzidas durante a utilização da plataforma.

Inicialmente a arquitetura adota uma estratégia offline-first, priorizando armazenamento local com sincronização posterior.

A camada de persistência deverá abstrair os mecanismos físicos de armazenamento, permitindo evolução futura da infraestrutura sem impacto sobre os demais componentes.

5.10 Sessão

A Sessão representa o conjunto de informações temporárias relacionadas ao uso corrente da plataforma.

Durante uma sessão podem ser mantidos, entre outros:

usuário ativo;
módulo em utilização;
progresso temporário;
estado da navegação;
preferências de interface.

Informações de sessão não necessariamente correspondem a dados persistentes.

5.11 Estado da Aplicação

O Estado da Aplicação corresponde ao conjunto de informações necessárias para representar a situação corrente da plataforma durante sua execução.

O gerenciamento adequado do estado permite manter consistência entre interface, plugins, serviços e persistência.

Sempre que possível, deverá existir uma única fonte de verdade (single source of truth) para cada informação compartilhada entre múltiplos componentes.

5.12 Contrato Arquitetural

Um Contrato Arquitetural define o conjunto de responsabilidades, interfaces e comportamentos esperados de determinado tipo de componente.

Contratos garantem que diferentes implementações possam coexistir mantendo compatibilidade com a arquitetura.

O exemplo mais importante da plataforma é o contrato mínimo de um plugin técnico, composto pelos métodos e metadados definidos pela arquitetura.

Outros contratos poderão ser estabelecidos para serviços, engines e adaptadores conforme a evolução da plataforma.

5.13 Adaptador

Um Adaptador é um componente responsável por encapsular a comunicação entre a plataforma e sistemas externos.

Seu objetivo é isolar dependências específicas de tecnologias, APIs ou serviços remotos, reduzindo o impacto de alterações externas sobre a arquitetura interna.

Exemplos futuros incluem adaptadores para:

Google Apps Script;
Google Sheets;
ambientes virtuais de aprendizagem (LMS);
serviços de autenticação institucional;
provedores de inteligência artificial.
Relação entre os Conceitos

A Figura correspondente ao diagrama D05 — Modelo Conceitual de Módulos e Plugins, apresentada no documento architecture-diagrams.md, ilustra a separação entre domínio pedagógico (módulos) e domínio tecnológico (plugins), bem como a forma como esses conceitos se relacionam com o Core da plataforma.

De forma resumida:

Plataforma
│
├── Interface
│
├── Core
│ ├── Serviços
│ ├── Engines
│ ├── Estado
│ └── Sessão
│
├── Módulos Pedagógicos
│ │
│ └── utilizam
│
├── Plugins Técnicos
│
└── Persistência
Observações Arquiteturais

Os conceitos apresentados nesta seção possuem caráter normativo para a arquitetura da plataforma.

Novos componentes deverão utilizar essa terminologia de forma consistente, evitando a criação de conceitos redundantes ou sobrepostos. Quando a evolução da plataforma exigir novos conceitos arquiteturais, suas definições deverão ser incorporadas a esta seção e, quando aplicável, formalizadas por meio de um Architecture Decision Record (ADR).

6. Arquitetura Geral

A arquitetura do LabInspeção_UniSENAI foi concebida segundo uma abordagem modular, orientada por componentes e estruturada em camadas de responsabilidade.

Essa organização busca reduzir o acoplamento entre as diferentes partes da aplicação, favorecer a reutilização de funcionalidades, simplificar a manutenção e permitir evolução incremental da plataforma sem comprometer sua estabilidade.

Em vez de concentrar todas as funcionalidades em um único bloco de software, a arquitetura distribui responsabilidades entre componentes especializados, coordenados pelo Core, que atua como elemento central da aplicação.

A Figura correspondente ao diagrama D01 — Visão Geral da Plataforma apresenta essa organização em alto nível.

6.1 Visão Arquitetural

A arquitetura da plataforma é composta pelos seguintes elementos principais:

Interface;
Core;
Módulos Pedagógicos;
Plugins Técnicos;
Serviços Compartilhados;
Persistência.

Cada um desses componentes possui responsabilidades específicas e comunica-se com os demais por meio de contratos arquiteturais bem definidos.

A separação entre esses elementos constitui a principal estratégia para reduzir dependências e permitir crescimento sustentável da plataforma.

6.2 Arquitetura em Camadas

Embora a plataforma seja organizada em componentes independentes, sua arquitetura pode ser compreendida por meio de uma visão em camadas.

As camadas representam níveis crescentes de abstração e responsabilidade, organizando o fluxo de informações entre a interface do usuário e os mecanismos de persistência.

O diagrama D02 — Arquitetura em Camadas apresenta essa organização.

As camadas são:

Interface

Responsável pela interação entre usuário e aplicação.

Inclui:

telas;
navegação;
formulários;
dashboards;
gráficos;
elementos visuais.

A Interface nunca acessa diretamente mecanismos de persistência nem implementa regras de negócio complexas.

Core

Representa o núcleo operacional da plataforma.

É responsável por:

inicialização da aplicação;
gerenciamento do ciclo de vida;
roteamento;
gerenciamento de estado;
carregamento de plugins;
coordenação dos serviços compartilhados.

Todo o fluxo principal da aplicação passa pelo Core.

Módulos Pedagógicos

Representam a organização didática da plataforma.

Cada módulo corresponde a uma unidade de aprendizagem estruturada a partir de objetivos educacionais.

Os módulos descrevem a experiência de aprendizagem, mas não implementam diretamente funcionalidades técnicas.

Plugins Técnicos

Implementam os recursos computacionais utilizados pelos módulos pedagógicos.

Entre eles:

simuladores;
calculadoras;
gráficos;
questionários;
animações;
componentes interativos.

Os plugins são carregados sob demanda e podem ser reutilizados por diferentes módulos.

Serviços Compartilhados

Executam funcionalidades transversais utilizadas por múltiplos componentes.

Exemplos:

persistência;
sincronização;
exportação;
analytics;
gerenciamento de sessão;
armazenamento.

Os serviços constituem a infraestrutura funcional da aplicação.

Persistência

Corresponde aos mecanismos responsáveis pelo armazenamento e recuperação de dados.

Inicialmente, a plataforma utiliza armazenamento local com sincronização posterior para serviços remotos.

Essa estratégia garante funcionamento mesmo na ausência de conexão com a Internet.

6.3 Fluxo Geral de Execução

A operação da plataforma segue um fluxo coordenado pelo Core.

De forma simplificada:

Usuário
│
▼
Interface
│
▼
Core
│
├────────────► Serviços Compartilhados
│
▼
Módulo Pedagógico
│
▼
Plugin Técnico
│
├────────────► Persistência
│
▼
Resultado apresentado ao usuário

Esse fluxo demonstra que os componentes não se comunicam livremente entre si.

O Core atua como elemento coordenador da arquitetura, reduzindo dependências diretas e preservando a consistência da aplicação.

6.4 Comunicação entre Componentes

A comunicação entre componentes deve obedecer às seguintes diretrizes:

componentes devem conhecer apenas as interfaces públicas dos demais componentes;
chamadas diretas entre plugins devem ser evitadas;
módulos pedagógicos não devem acessar serviços de persistência diretamente;
plugins devem utilizar exclusivamente os serviços disponibilizados pelo Core;
serviços não devem conter dependências específicas de módulos pedagógicos.

Essa organização reduz o acoplamento da arquitetura e facilita futuras substituições ou expansões.

6.5 Ciclo de Vida da Aplicação

O funcionamento da plataforma é baseado em um ciclo de vida explícito.

Em linhas gerais, esse ciclo compreende:

inicialização da aplicação;
criação do estado inicial;
carregamento da interface;
seleção de um módulo pedagógico;
localização do plugin correspondente;
renderização da interface do plugin;
inicialização (mount);
interação do usuário;
persistência dos resultados;
desmontagem (unmount);
carregamento de novo módulo.

O detalhamento desse processo é apresentado no diagrama D07 — Ciclo de Vida dos Plugins.

6.6 Relação entre Arquitetura Pedagógica e Arquitetura Técnica

A arquitetura da plataforma estabelece uma separação explícita entre dois domínios distintos.

O primeiro corresponde ao domínio pedagógico, responsável por organizar a experiência de aprendizagem.

O segundo corresponde ao domínio tecnológico, responsável pela implementação dos recursos computacionais utilizados durante essa experiência.

Essa separação permite que:

mudanças curriculares não exijam alterações estruturais da plataforma;
funcionalidades técnicas sejam reutilizadas em diferentes módulos;
componentes tecnológicos evoluam independentemente da organização didática;
novos módulos sejam incorporados com baixo impacto sobre a infraestrutura existente.

Essa distinção constitui uma das principais características arquiteturais da versão 4.x do LabInspeção_UniSENAI.

6.7 Organização Arquitetural Alvo

A arquitetura apresentada neste documento representa a estrutura-alvo da plataforma.

Durante as fases iniciais de desenvolvimento, alguns componentes poderão estar parcialmente implementados ou ainda não existir.

Essa situação é considerada natural em um processo de desenvolvimento incremental.

A evolução da plataforma deverá ocorrer por aproximações sucessivas da arquitetura definida neste documento, evitando reestruturações radicais e preservando compatibilidade entre os componentes já implementados.

6.8 Considerações Arquiteturais

A arquitetura geral do LabInspeção_UniSENAI foi concebida para equilibrar simplicidade, flexibilidade e capacidade de evolução.

A adoção de componentes especializados, contratos arquiteturais bem definidos e uma separação clara entre responsabilidades permite que a plataforma cresça de forma sustentável, mantendo a coerência entre infraestrutura tecnológica e objetivos pedagógicos.

Essa organização fornece a base para as seções seguintes, nas quais cada componente será descrito individualmente em maior nível de detalhe.

7. Componentes da Plataforma

Esta seção descreve os principais componentes que compõem a arquitetura do LabInspeção_UniSENAI, detalhando suas responsabilidades, limites de atuação, dependências e interações.

Cada componente representa uma unidade arquitetural especializada, projetada para desempenhar um conjunto bem definido de funções dentro da plataforma.

A divisão em componentes busca promover alta coesão, baixo acoplamento e reutilização, permitindo que cada parte evolua de forma relativamente independente.

Os relacionamentos estruturais entre esses componentes encontram-se representados nos diagramas do documento architecture-diagrams.md, especialmente os diagramas D01, D02, D03 e D04.

7.1 Interface
Finalidade

A Interface é responsável pela interação entre o usuário e a plataforma.

Seu objetivo é apresentar informações, receber entradas do usuário e fornecer uma experiência consistente de navegação.

Ela representa a camada mais externa da arquitetura.

Responsabilidades

A Interface é responsável por:

renderizar páginas e componentes visuais;
apresentar conteúdos pedagógicos;
coletar entradas do usuário;
exibir resultados de simulações;
apresentar dashboards;
controlar navegação;
garantir acessibilidade e responsividade.
Não é responsabilidade da Interface

A Interface não deve:

implementar regras de negócio;
acessar armazenamento diretamente;
executar cálculos complexos;
conhecer detalhes internos dos plugins;
controlar persistência.
Dependências

A Interface depende apenas do:

Core;
Componentes Visuais Compartilhados.
7.2 Core
Finalidade

O Core constitui o núcleo operacional da plataforma.

É responsável por coordenar a execução da aplicação e disponibilizar infraestrutura comum aos demais componentes.

Nenhuma funcionalidade específica de um módulo pedagógico deve ser implementada no Core.

Responsabilidades

O Core é responsável por:

inicializar a aplicação;
carregar configuração global;
gerenciar estado;
controlar navegação;
localizar plugins;
realizar carregamento dinâmico;
fornecer APIs internas;
coordenar serviços compartilhados;
gerenciar eventos globais;
controlar ciclo de vida dos plugins.
O Core NÃO deve
implementar simuladores;
conter conteúdo pedagógico;
conhecer detalhes específicos de módulos;
implementar lógica de avaliação.
Componentes internos do Core

O Core poderá ser organizado em subsistemas como:

Router;
Plugin Manager;
Lifecycle Manager;
Event Bus;
State Manager;
Session Manager;
Service Registry;
Configuration Manager.

A implementação desses subsistemas poderá evoluir conforme a maturidade da plataforma.

7.3 Módulos Pedagógicos
Finalidade

Os módulos representam a organização educacional da plataforma.

Cada módulo corresponde a uma unidade curricular ou temática composta por objetivos de aprendizagem, conteúdos, atividades e avaliações.

O módulo define a experiência pedagógica, não sua implementação técnica.

Estrutura típica

Cada módulo poderá conter:

metadados;
objetivos;
competências;
conteúdos;
sequência didática;
atividades;
estudos de caso;
simuladores associados;
avaliações;
referências.
Responsabilidades

Os módulos são responsáveis por:

organizar conteúdos;
definir fluxo pedagógico;
selecionar plugins;
registrar metadados educacionais.
Não é responsabilidade do módulo

O módulo não deve:

implementar lógica computacional;
acessar armazenamento;
controlar interface;
executar algoritmos.
7.4 Plugins Técnicos

Os Plugins Técnicos constituem o principal mecanismo de extensibilidade da plataforma.

Arquiteturalmente são classificados em três categorias.

Tool Plugins

Implementam funcionalidades reutilizáveis.

Exemplos:

Quiz;
Chart;
Simulador;
Timeline;
PDF Viewer.
Experience Plugins

Implementam experiências completas de aprendizagem.

Podem orquestrar múltiplos Tool Plugins para construir laboratórios, estudos de caso, desafios ou avaliações complexas.

Integration Plugins

Implementam integração com serviços externos.

Exemplos:

Moodle;
Google Drive;
APIs REST;
OpenAI.

7.5 Serviços Compartilhados
Finalidade

Serviços implementam funcionalidades utilizadas por diversos componentes da plataforma.

São responsáveis por reduzir duplicações de código e centralizar comportamentos comuns.

Exemplos previstos
Storage Service
Sync Service
Export Service
Logging Service
Notification Service
Configuration Service
Analytics Service
Características

Os serviços:

não possuem interface própria;
podem ser utilizados por múltiplos plugins;
possuem ciclo de vida controlado pelo Core.
7.6 Engines
Finalidade

As Engines encapsulam algoritmos reutilizáveis utilizados por diferentes plugins.

Enquanto plugins representam funcionalidades completas, as engines representam capacidades técnicas.

Exemplos futuros
Simulation Engine
Quiz Engine
Rule Engine
Physics Engine
Chart Engine
AI Engine
Benefícios

A utilização de engines reduz duplicação de algoritmos e facilita evolução da plataforma.

7.7 Persistência
Finalidade

A camada de Persistência é responsável pelo armazenamento dos dados produzidos durante a utilização da plataforma.

Informações persistidas

Exemplos:

progresso do estudante;
resultados;
configurações;
preferências;
respostas;
métricas;
estado dos módulos.
Estratégia

A arquitetura adota inicialmente:

Local Storage;
IndexedDB;
sincronização posterior;
abstração dos mecanismos físicos.
Evolução prevista

Futuramente poderão ser incorporados:

banco remoto;
autenticação;
sincronização institucional;
armazenamento em nuvem.

Sem alterações na arquitetura dos demais componentes.

7.8 Dashboards
Finalidade

Dashboards consolidam informações produzidas pela plataforma e apresentam indicadores ao usuário.

Tipos previstos
Dashboard do Estudante;
Dashboard do Docente;
Dashboard Administrativo;
Dashboard Institucional.
Informações

Poderão apresentar:

progresso;
desempenho;
estatísticas;
histórico;
competências;
indicadores de aprendizagem.
7.9 Adaptadores
Finalidade

Adaptadores isolam integrações externas.

Permitem substituir tecnologias externas sem alterar o restante da arquitetura.

Integrações futuras
Google Sheets;
Google Apps Script;
Moodle;
Microsoft Teams;
APIs REST;
IA Generativa.
7.10 Comunicação entre Componentes

A comunicação segue rigorosamente os princípios definidos na arquitetura.

O fluxo permitido pode ser representado de forma simplificada:

Interface
│
▼
Core
│
├────────► Serviços
│
├────────► Persistência
│
▼
Módulos
│
▼
Plugins
│
▼
Engines

Comunicações não previstas nesse fluxo deverão ser evitadas ou justificadas por meio de um ADR.

7.11 Dependências Permitidas

A tabela a seguir resume as dependências arquiteturais permitidas entre os principais componentes da plataforma.

Componente Pode depender de
Interface Core
Core Serviços, Persistência
Módulos Pedagógicos Core
Plugins Core, Serviços, Engines
Engines Nenhum componente de nível superior
Serviços Persistência
Persistência Infraestrutura de armazenamento
Adaptadores APIs externas

Essa matriz busca preservar o baixo acoplamento e evitar dependências circulares.

7.12 Evolução dos Componentes

Novos componentes poderão ser incorporados à plataforma desde que:

possuam responsabilidade claramente definida;
não dupliquem funcionalidades existentes;
respeitem os princípios arquiteturais estabelecidos neste documento;
sejam documentados antes de sua integração ao sistema;
mantenham compatibilidade com os contratos arquiteturais vigentes.

Alterações que modifiquem significativamente a estrutura de componentes deverão ser registradas por meio de um Architecture Decision Record (ADR).

8. Organização do Projeto

Esta seção descreve a organização física do repositório do LabInspeção_UniSENAI, estabelecendo a correspondência entre a arquitetura definida neste documento e sua implementação.

A estrutura adotada procura refletir diretamente os princípios estabelecidos pelos Architecture Decision Records (ADR), privilegiando modularidade, separação de responsabilidades, reutilização de componentes e simplicidade de manutenção.

A organização física do repositório constitui parte integrante da arquitetura da plataforma e deverá evoluir apenas quando houver justificativa técnica documentada.

8.1 Princípios de Organização

A organização do projeto observa os seguintes princípios:

refletir a arquitetura da plataforma;
favorecer alta coesão entre arquivos relacionados;
minimizar dependências entre diretórios;
facilitar a localização dos componentes;
permitir crescimento incremental;
separar claramente infraestrutura, componentes reutilizáveis e módulos didáticos;
evitar duplicação de código;
preservar uma estrutura simples e previsível.

Sempre que possível, a organização física deverá corresponder à organização lógica da aplicação.

8.2 Estrutura Geral do Repositório

A organização atual do projeto é apresentada a seguir.

LabInspecao_UniSENAI/

├── docs/
│ ├── architecture/
│ │ ├── adr/
│ │ ├── diagrams/
│ │ ├── software-architecture.md
│ │ └── architecture-diagrams.md
│ │
│ ├── development/
│ ├── pedagogy/
│ ├── project/
│ └── user/
│
├── public/
│
├── src/
│ ├── app/
│ │ ├── navigation/
│ │ ├── router/
│ │ ├── session/
│ │ └── views/
│ │
│ ├── components/
│ │ ├── ui/
│ │ ├── educational/
│ │ ├── charts/
│ │ └── controls/
│ │
│ ├── styles/
│ │ ├── base/
│ │ ├── layout/
│ │ ├── utilities/
│ │ └── components/
│ │ ├── ui/
│ │ ├── educational/
│ │ ├── charts/
│ │ └── controls/
│ │
│ ├── modules/
│ │ ├── template/
│ │ ├── frenagem/
│ │ ├── suspensao/
│ │ ├── gases-otto/
│ │ └── ...
│ │
│ ├── assets/
│ ├── utils/
│ └── main.js
│
├── tests/
├── scripts/
├── package.json
├── vite.config.js
└── README.md

Essa estrutura representa a organização oficial da versão 1.0 da plataforma.

8.3 Organização da Documentação

Toda a documentação deverá permanecer concentrada no diretório docs/.

A organização segue a seguinte divisão:

Diretório Finalidade
architecture Arquitetura, diagramas e ADRs
development Guias técnicos de desenvolvimento
pedagogy Organização pedagógica e conteúdos
project Planejamento, backlog e roadmap
user Manuais destinados aos usuários

Essa separação facilita a manutenção da documentação e reduz a mistura entre artefatos de natureza distinta.

8.4 Organização do Código-Fonte

O diretório src/ concentra toda a implementação da aplicação.

app/

Contém a infraestrutura da aplicação responsável por:

navegação;
roteamento;
gerenciamento de sessão;
renderização das views.

Não contém conteúdo pedagógico nem lógica específica dos módulos.

components/

Reúne componentes reutilizáveis compartilhados por toda a plataforma.

Os componentes são organizados em quatro categorias:

ui/ — componentes básicos de interface;
educational/ — componentes pedagógicos;
charts/ — componentes gráficos;
controls/ — componentes de entrada e interação.

Sempre que um componente puder ser reutilizado por mais de um módulo, deverá ser colocado neste diretório.

styles/

Centraliza os estilos compartilhados da aplicação.

Os estilos acompanham a organização dos componentes, preservando a separação entre apresentação e lógica.

modules/

Contém os módulos didáticos da plataforma.

Cada módulo constitui uma unidade independente de aprendizagem e segue a estrutura definida pelo Template Oficial de Módulos.

assets/

Armazena recursos estáticos compartilhados, como:

imagens;
ícones;
vídeos;
arquivos JSON;
animações.
utils/

Contém funções utilitárias independentes, reutilizáveis por diferentes partes da aplicação.

Essas funções não devem manter estado nem implementar regras de negócio específicas.

8.5 Organização dos Módulos

Todos os módulos deverão seguir a estrutura oficial definida pela arquitetura.

Exemplo:

modules/

└── frenagem/

    ├── index.js
    ├── content.js
    ├── simulation.js
    ├── module.json
    ├── quiz.json
    │
    └── sections/

        ├── hero.js
        ├── fundamentos.js
        ├── frenometro.js
        ├── sintese.js
        ├── estudo-caso.js
        ├── simulador.js
        └── avaliacao.js

Essa organização permite que cada módulo concentre sua lógica, conteúdo e recursos, mantendo independência em relação aos demais.

8.6 Convenções de Nomenclatura

Para manter consistência no código, adotam-se as seguintes convenções:

Elemento Convenção
Diretórios kebab-case
Arquivos JavaScript camelCase.js
Componentes PascalCase.js
Constantes globais UPPER_SNAKE_CASE
Variáveis camelCase
Funções camelCase
Classes PascalCase
Módulos kebab-case

A plataforma utiliza JavaScript ES Modules como padrão de implementação.

8.7 Organização dos Testes

Sempre que possível, os testes deverão acompanhar a estrutura do código.

Exemplo:

modules/

    frenagem/

        simulation.js
        simulation.test.js

Essa estratégia reduz divergências entre implementação e testes.

8.8 Arquivos de Configuração

Os arquivos de configuração permanecem concentrados na raiz do projeto.

Exemplos:

package.json
vite.config.js
.editorconfig
.gitignore
eslint.config.js (quando utilizado)
8.9 Evolução da Estrutura

A organização do projeto deverá permanecer estável durante a versão 1.0.

Novos diretórios somente deverão ser criados quando houver responsabilidade claramente distinta que justifique sua existência.

Alterações estruturais significativas deverão:

ser justificadas tecnicamente;
ser registradas por meio de um Architecture Decision Record (ADR);
ser refletidas neste documento antes de sua adoção na implementação.

9. Arquitetura dos Módulos

A arquitetura do LabInspeção_UniSENAI é organizada em torno de módulos didáticos independentes, que constituem a principal unidade funcional da plataforma.

Cada módulo reúne, em uma única estrutura, os conteúdos pedagógicos, os recursos de simulação, os estudos de caso, os mecanismos de avaliação e os metadados necessários para sua execução.

Essa organização busca reduzir o acoplamento entre diferentes unidades de aprendizagem, favorecer a reutilização de componentes compartilhados e simplificar a evolução incremental da plataforma.

Diferentemente de arquiteturas baseadas em aplicações independentes, todos os módulos compartilham uma infraestrutura comum de navegação, renderização e gerenciamento de sessão, preservando uma experiência uniforme para estudantes e docentes.

9.1 Objetivos da Arquitetura dos Módulos

A organização modular da plataforma possui os seguintes objetivos arquiteturais:

permitir a incorporação progressiva de novos módulos;
reduzir o acoplamento entre diferentes unidades didáticas;
favorecer reutilização de componentes compartilhados;
concentrar responsabilidades relacionadas em um único local;
facilitar manutenção e testes;
permitir evolução incremental da plataforma;
preservar independência entre módulos.

Cada módulo representa uma unidade autônoma de desenvolvimento, podendo evoluir sem exigir modificações estruturais nos demais módulos.

9.2 Conceito de Módulo

Um módulo corresponde a uma unidade completa de aprendizagem.

Cada módulo combina:

conteúdo didático;
seções de aprendizagem;
recursos de simulação;
estudos de caso;
avaliação;
metadados;
configuração própria.

Embora compartilhem componentes comuns da aplicação, os módulos permanecem independentes entre si.

Nenhum módulo deverá conhecer detalhes internos da implementação de outro módulo.

9.3 Estrutura Oficial

Todos os módulos deverão seguir a estrutura oficial definida pela arquitetura.

modules/

└── frenagem/

    ├── index.js
    ├── content.js
    ├── simulation.js
    ├── module.json
    ├── quiz.json
    │
    └── sections/

        ├── hero.js
        ├── fundamentos.js
        ├── frenometro.js
        ├── estudo-caso.js
        ├── simulador.js
        ├── sintese.js
        └── avaliacao.js

Essa estrutura padronizada permite que todos os módulos apresentem organização semelhante, facilitando manutenção, revisão de código e expansão da plataforma.

9.4 Responsabilidade dos Arquivos

Cada arquivo possui responsabilidade claramente definida.

index.js

Responsável por orquestrar o ciclo de vida do módulo.

Coordena:

carregamento;
renderização;
inicialização dos componentes;
limpeza dos recursos utilizados.

Não deve conter conteúdo didático nem implementar cálculos específicos da simulação.

content.js

Concentra o conteúdo textual do módulo.

Pode incluir:

títulos;
textos;
referências;
descrições;
legendas.

Seu objetivo é separar o conteúdo da lógica de execução.

simulation.js

Implementa exclusivamente a lógica da simulação.

Pode conter:

cálculos;
validações;
processamento de entradas;
geração de resultados.

Não deve manipular diretamente a navegação da aplicação.

module.json

Contém os metadados do módulo.

Exemplos:

identificador;
título;
descrição;
autor;
versão;
palavras-chave.

Esses metadados permitem que a aplicação organize e identifique os módulos disponíveis.

quiz.json

Define a avaliação do módulo.

Inclui:

questões;
alternativas;
respostas corretas;
explicações;
critérios de aprovação.

A lógica de execução da avaliação permanece separada dos dados.

sections/

Cada arquivo representa uma seção da experiência de aprendizagem.

A divisão em seções reduz o tamanho dos arquivos e facilita manutenção.

9.5 Organização das Seções

A experiência de aprendizagem é organizada por seções independentes.

A sequência recomendada é:

Hero
Fundamentos
Equipamento ou Tecnologia
Estudo de Caso
Simulador
Síntese
Avaliação

Cada seção possui responsabilidade específica e deve produzir apenas a interface correspondente ao seu conteúdo.

Sempre que possível, as seções deverão utilizar componentes compartilhados em vez de implementar soluções próprias.

9.6 Ciclo de Vida do Módulo

Todos os módulos seguem o ciclo de vida definido no ADR-004.

load

↓

render

↓

bind

↓

active

↓

destroy

Cada etapa possui responsabilidade específica.

load

Prepara os recursos necessários para execução.

render

Produz a interface visual do módulo.

bind

Conecta eventos e componentes interativos.

active

Representa o período durante o qual o módulo permanece em utilização.

destroy

Remove listeners, libera recursos temporários e encerra a execução do módulo.

Nenhum módulo deverá permanecer parcialmente ativo após sua destruição.

9.7 Componentes Compartilhados

Os módulos não implementam seus próprios componentes básicos de interface.

Sempre que possível, deverão reutilizar componentes disponíveis em:

components/

ui/

educational/

charts/

controls/

Essa estratégia:

reduz duplicação de código;
mantém consistência visual;
facilita manutenção;
simplifica evolução da plataforma.
9.8 Isolamento entre Módulos

Cada módulo deverá operar de forma independente.

Não é permitido:

acessar variáveis internas de outro módulo;
modificar diretamente o estado de outro módulo;
depender da existência de elementos produzidos por outro módulo;
registrar listeners permanentes fora de sua área de atuação.

A comunicação entre módulos deverá ocorrer exclusivamente por mecanismos disponibilizados pela infraestrutura da aplicação.

9.9 Dependências Permitidas

As dependências entre os principais elementos da arquitetura são resumidas a seguir.

Elemento Pode depender de
Módulo app, components, styles, utils
Sections components, simulation, content
simulation.js utils
content.js nenhuma dependência funcional
quiz.json nenhuma
module.json nenhuma

Essa organização preserva baixo acoplamento e reduz dependências circulares.

9.10 Inclusão de Novos Módulos

A incorporação de um novo módulo deverá seguir o Template Oficial de Módulos.

O processo recomendado compreende:

criação da estrutura do diretório;
definição dos metadados;
elaboração do conteúdo;
implementação da simulação;
criação da avaliação;
integração com a navegação da aplicação;
validação funcional.

Todos os novos módulos deverão respeitar a estrutura definida nesta seção.

9.11 Critérios de Conformidade

Um módulo será considerado compatível com a arquitetura quando:

respeitar a estrutura oficial de diretórios;
implementar o ciclo de vida definido pela plataforma;
utilizar componentes compartilhados sempre que possível;
manter independência em relação aos demais módulos;
concentrar responsabilidades relacionadas;
evitar duplicação de funcionalidades existentes.
9.12 Evolução da Arquitetura dos Módulos

A arquitetura descrita nesta seção representa a organização oficial da versão 1.0 da plataforma.

Novas capacidades poderão ser incorporadas futuramente, como mecanismos de descoberta automática de módulos, catálogos institucionais ou sistemas de extensão, desde que preservem os princípios arquiteturais estabelecidos neste documento e sejam formalizadas por meio de um Architecture Decision Record (ADR).

Até que essas evoluções sejam adotadas, a plataforma utilizará exclusivamente a estrutura modular definida nesta seção como mecanismo oficial de organização e expansão do sistema.

Avaliação da nova Seção 9

Esta versão apresenta algumas vantagens importantes em relação à anterior:

Alinhamento integral com os ADRs: incorpora o ciclo de vida (load → render → bind → active → destroy) definido no ADR-004 e a arquitetura modular estabelecida no ADR-002.
Correspondência direta com a implementação: documenta a estrutura real dos módulos (index.js, content.js, simulation.js, module.json, quiz.json e sections/), reduzindo divergências entre documentação e código.
Foco na versão 1.0: elimina conceitos ainda não implementados (Plugin Manager, Tool Plugins, Experience Plugins), mantendo apenas uma referência à evolução futura quando apropriado.
Melhor rastreabilidade: a estrutura descrita pode ser usada diretamente como referência para revisão de código, criação de novos módulos e elaboração do MODULE_TEMPLATE.md, evitando duplicação de conceitos e preservando a coerência da documentação arquitetural.

10. Tecnologias da Plataforma

Esta seção apresenta as tecnologias adotadas na implementação do LabInspeção_UniSENAI e os critérios arquiteturais que orientam sua seleção, utilização e evolução.

As tecnologias descritas representam a implementação corrente da arquitetura, não constituindo elementos permanentes do modelo arquitetural. Alterações tecnológicas poderão ocorrer ao longo do ciclo de vida da plataforma, desde que preservem os princípios, contratos e responsabilidades definidos neste documento.

A arquitetura foi concebida para minimizar dependências de tecnologias específicas, permitindo que componentes sejam evoluídos ou substituídos com impacto reduzido sobre o restante da plataforma.

10.1 Princípios para Adoção de Tecnologias

Toda tecnologia incorporada ao projeto deverá atender aos seguintes critérios:

aderência à arquitetura definida neste documento;
maturidade e estabilidade comprovadas;
ampla documentação e suporte da comunidade;
compatibilidade com padrões abertos da Web;
facilidade de manutenção e evolução;
integração com TypeScript;
baixo risco de obsolescência;
independência em relação a fornecedores específicos (vendor lock-in).

A adoção de novas tecnologias deverá privilegiar soluções consolidadas e justificar claramente os benefícios obtidos em relação às alternativas existentes.

Mudanças que alterem significativamente a infraestrutura tecnológica deverão ser registradas por meio de um Architecture Decision Record (ADR).

10.2 Plataforma de Execução

O LabInspeção_UniSENAI é concebido como uma Progressive Web Application (PWA) executada diretamente no navegador.

Essa decisão arquitetural proporciona:

independência do sistema operacional;
distribuição simplificada;
atualização centralizada;
compatibilidade com computadores, tablets e smartphones;
suporte à operação offline;
instalação opcional pelo usuário.

Sempre que possível, deverão ser priorizadas APIs nativas dos navegadores antes da adoção de bibliotecas externas.

10.3 Linguagem de Programação

A implementação utiliza TypeScript como linguagem principal.

Sua adoção visa aumentar a robustez da plataforma por meio de:

tipagem estática;
contratos explícitos entre componentes;
melhor suporte à refatoração;
redução de erros em tempo de execução;
maior previsibilidade durante a evolução da arquitetura.

O uso consistente da tipagem é considerado parte integrante da estratégia de qualidade da plataforma.

10.4 Framework de Interface

A camada de apresentação utiliza React, adotando arquitetura baseada em componentes.

Essa escolha está alinhada aos princípios arquiteturais de:

modularidade;
reutilização;
separação de responsabilidades;
composição de interfaces;
desenvolvimento incremental.

Componentes de interface deverão permanecer desacoplados da lógica de negócio, do gerenciamento de estado global e da persistência.

10.5 Ferramenta de Build

O ambiente de desenvolvimento utiliza Vite.

Sua adoção proporciona:

inicialização rápida;
recarga instantânea (Hot Module Replacement);
suporte nativo a ES Modules;
configuração simplificada;
excelente integração com React e TypeScript.

A justificativa para essa escolha encontra-se registrada no ADR-001.

10.6 Gerenciamento de Estado

A arquitetura prevê um mecanismo centralizado de gerenciamento de estado coordenado pelo Core.

Esse mecanismo deverá observar os seguintes princípios:

existência de uma única fonte de verdade (Single Source of Truth);
separação entre estado global e estado local dos plugins;
isolamento entre componentes;
sincronização consistente da interface.

Cada plugin deverá manter apenas o estado estritamente necessário ao seu funcionamento.

Informações compartilhadas deverão utilizar exclusivamente os serviços disponibilizados pelo Core.

A tecnologia específica utilizada para gerenciamento de estado poderá evoluir ao longo do projeto sem alterar esse modelo arquitetural.

10.7 Persistência de Dados

A persistência segue a estratégia Offline First, priorizando armazenamento local com sincronização posterior.

Dependendo da natureza dos dados, poderão ser utilizados:

IndexedDB;
Local Storage;
Session Storage.

O acesso aos mecanismos físicos de armazenamento deverá ocorrer exclusivamente por intermédio da camada de Persistência, vedando seu uso direto por plugins ou componentes de interface.

Essa abstração permite substituir ou ampliar os mecanismos de armazenamento sem impacto sobre os demais componentes da arquitetura.

10.8 Comunicação com Sistemas Externos

Toda comunicação com serviços externos deverá ser realizada por meio de Integration Plugins ou adaptadores controlados pelo Core.

Essa abordagem evita dependências diretas entre componentes internos e APIs externas, preservando a estabilidade da arquitetura.

Exemplos de integrações previstas incluem:

ambientes virtuais de aprendizagem (LMS);
sistemas acadêmicos;
serviços de armazenamento em nuvem;
APIs institucionais;
serviços de inteligência artificial;
plataformas analíticas.
10.9 Estratégia de Operação Offline

A plataforma deverá permanecer operacional mesmo na ausência de conexão com a Internet.

Para isso, poderão ser empregados mecanismos como:

Service Workers;
Cache Storage;
IndexedDB;
sincronização assíncrona.

A indisponibilidade temporária da rede não deverá impedir a utilização das funcionalidades essenciais da plataforma.

10.10 Arquitetura Visual

A interface deverá ser construída a partir de um Design System próprio, organizado em componentes reutilizáveis.

Esse sistema compreenderá, entre outros elementos:

componentes de interface;
tokens de design;
temas;
tipografia;
cores;
espaçamentos;
ícones;
diretrizes de acessibilidade.

A existência de um Design System garante consistência visual e reduz duplicações na implementação da interface.

10.11 Qualidade do Código

A qualidade da implementação será apoiada por ferramentas de desenvolvimento integradas ao processo do projeto.

Entre elas destacam-se:

Git para controle de versão;
npm para gerenciamento de dependências;
ESLint para análise estática;
Prettier para padronização de código;
Vitest para testes unitários;
Playwright (quando aplicável) para testes de interface;
GitHub Actions para integração contínua.

Essas ferramentas poderão evoluir conforme as necessidades do projeto.

10.12 Tecnologias Adotadas

A tabela a seguir resume a pilha tecnológica atualmente prevista.

Categoria Tecnologia
Plataforma Progressive Web Application (PWA)
Linguagem TypeScript
Interface React
Build Vite
Gerenciamento de Pacotes npm
Persistência Local IndexedDB, Local Storage, Session Storage
Controle de Versão Git
Hospedagem Inicial GitHub Pages
Documentação Markdown
Diagramas Mermaid
Testes Unitários Vitest
Testes E2E Playwright (quando adotado)
Integração Contínua GitHub Actions (quando adotada)
10.13 Evolução Tecnológica

A arquitetura foi projetada para reduzir dependências de tecnologias específicas.

Frameworks, bibliotecas e ferramentas poderão ser substituídos sem comprometer:

o modelo de componentes;
o Core;
o modelo de plugins;
os contratos arquiteturais;
a separação entre domínio pedagógico e domínio tecnológico.

Toda mudança tecnológica deverá ser avaliada à luz dos objetivos arquiteturais definidos neste documento.

Quando implicar alterações estruturais relevantes, deverá ser registrada por meio de um Architecture Decision Record (ADR).

10.14 Decisões Tecnológicas Registradas

As principais decisões relacionadas à infraestrutura tecnológica da plataforma são registradas por meio de Architecture Decision Records (ADR).

Entre elas destacam-se:

ADR Decisão
ADR-001 Adoção do Vite como ferramenta de build
ADR-002 Arquitetura modular baseada em componentes
ADR-003 Estratégia Offline First

Novas decisões tecnológicas deverão seguir o mesmo processo de documentação, garantindo rastreabilidade e coerência arquitetural.

11. Arquitetura Pedagógica

O LabInspeção_UniSENAI é uma plataforma educacional cuja arquitetura de software foi concebida para apoiar, e não determinar, a organização pedagógica dos recursos de aprendizagem.

Por essa razão, a plataforma estabelece uma separação explícita entre o domínio pedagógico e o domínio tecnológico.

O domínio pedagógico organiza competências, conteúdos, atividades e avaliações. O domínio tecnológico fornece os mecanismos computacionais necessários para implementar essas experiências de aprendizagem.

Essa separação constitui um dos princípios fundamentais da arquitetura da plataforma, permitindo que mudanças curriculares e evoluções tecnológicas ocorram de forma independente.

11.1 Arquitetura Pedagógica e Arquitetura Tecnológica

A arquitetura do LabInspeção_UniSENAI é composta por duas perspectivas complementares.

Arquitetura Pedagógica

Organiza:

competências;
objetivos de aprendizagem;
módulos;
conteúdos;
atividades;
avaliações;
trilhas de aprendizagem;
evidências de aprendizagem.

Essa arquitetura responde à pergunta:

"O que o estudante deve aprender?"

Arquitetura Tecnológica

Organiza:

Core;
Interface;
Plugins;
Serviços;
Persistência;
Integrações;
Componentes reutilizáveis.

Essa arquitetura responde à pergunta:

"Como a plataforma implementa essa aprendizagem?"

Ambas evoluem de forma coordenada, porém permanecem estruturalmente independentes.

11.2 Módulo Pedagógico

O Módulo Pedagógico representa a principal unidade de organização da aprendizagem.

Cada módulo corresponde a um conjunto coerente de competências e objetivos educacionais relacionados a determinado tema.

Um módulo poderá conter:

apresentação;
objetivos;
competências;
conteúdos;
atividades;
avaliações;
referências;
indicação de Experience Plugins.

O módulo organiza a experiência educacional, mas não implementa funcionalidades computacionais.

11.3 Competências

A arquitetura pedagógica é orientada ao desenvolvimento de competências.

Cada módulo deverá explicitar:

competências técnicas;
capacidades associadas;
conhecimentos;
atitudes;
critérios de desempenho;
evidências esperadas.

Essa organização aproxima a plataforma das diretrizes adotadas pelo SENAI-SP para educação profissional e tecnológica.

11.4 Conteúdos

Os conteúdos representam os conhecimentos necessários ao desenvolvimento das competências previstas no módulo.

Podem assumir diferentes formatos:

texto;
imagem;
vídeo;
animação;
documentos técnicos;
normas;
estudos de caso;
referências externas.

Os conteúdos permanecem independentes das tecnologias utilizadas para sua apresentação.

11.5 Atividades de Aprendizagem

As atividades representam situações estruturadas nas quais o estudante aplica conhecimentos e desenvolve competências.

Exemplos:

exercícios;
desafios;
laboratórios;
diagnósticos;
estudos de caso;
simulações;
projetos.

Cada atividade poderá utilizar um ou mais Experience Plugins, conforme sua natureza.

11.6 Experience Plugins na Arquitetura Pedagógica

Os Experience Plugins constituem o principal ponto de integração entre a arquitetura pedagógica e a arquitetura tecnológica.

Cada Experience Plugin implementa uma experiência digital completa de aprendizagem.

Pode combinar diversos Tool Plugins para oferecer uma atividade integrada.

Exemplo:

Módulo Pedagógico

↓

Atividade

↓

Experience Plugin

↓

Simulador

Quiz

Dashboard

Timeline

Exportação

Essa organização permite reutilizar ferramentas sem comprometer a identidade pedagógica de cada atividade.

11.7 Tool Plugins como Recursos Didáticos

Os Tool Plugins representam instrumentos computacionais reutilizáveis.

Exemplos:

simuladores;
quizzes;
calculadoras;
gráficos;
visualizadores;
editores.

Esses plugins não possuem conhecimento sobre conteúdos específicos.

Seu comportamento é parametrizado pelos Experience Plugins ou pelos módulos que os utilizam.

11.8 Avaliações

A arquitetura permite diferentes modalidades de avaliação.

Entre elas:

diagnóstica;
formativa;
somativa;
autoavaliação;
avaliação prática.

As avaliações poderão utilizar Experience Plugins específicos ou combinar diferentes Tool Plugins.

A arquitetura não impõe um modelo único de avaliação.

11.9 Evidências de Aprendizagem

Durante a utilização da plataforma poderão ser produzidas diversas evidências.

Exemplos:

respostas;
relatórios;
diagnósticos;
resultados de simulações;
decisões tomadas;
arquivos produzidos;
indicadores de desempenho.

Essas evidências poderão ser utilizadas para acompanhamento do progresso do estudante.

A arquitetura apenas provê os mecanismos de registro e persistência, cabendo ao modelo pedagógico definir seu significado educacional.

11.10 Trilhas de Aprendizagem

A plataforma permite organizar módulos em diferentes sequências.

Essas sequências constituem trilhas de aprendizagem.

Uma trilha poderá:

agrupar módulos;
estabelecer pré-requisitos;
recomendar atividades;
adaptar percursos;
registrar progresso.

Essa flexibilidade permite reutilizar os mesmos módulos em diferentes cursos ou programas de formação.

11.11 Reutilização Pedagógica

A separação entre módulos e plugins favorece a reutilização em diferentes níveis.

Por exemplo:

um módulo pode utilizar diversos Experience Plugins;
um Experience Plugin pode ser utilizado em diferentes módulos;
um Tool Plugin pode ser compartilhado por inúmeros Experience Plugins.

Essa organização reduz duplicações e facilita a expansão da plataforma.

11.12 Modelo Conceitual

A relação entre os principais elementos da arquitetura pedagógica pode ser representada da seguinte forma:

Curso
│
▼
Módulo Pedagógico
│
├── Competências
├── Conteúdos
├── Atividades
├── Avaliações
└── Referências
│
▼
Experience Plugin
│
▼
Tool Plugins
│
▼
Core

Essa representação evidencia que a arquitetura tecnológica oferece suporte à arquitetura pedagógica, preservando sua autonomia conceitual.

11.13 Escalabilidade Pedagógica

A organização adotada permite que a plataforma evolua sem necessidade de reestruturações curriculares.

Novos módulos poderão ser incorporados por meio da associação de Experience Plugins existentes ou da criação de novas experiências.

Da mesma forma, novos Tool Plugins poderão enriquecer atividades já existentes sem alterar a estrutura dos módulos pedagógicos.

Essa independência favorece a evolução contínua tanto da plataforma quanto dos materiais educacionais.

11.14 Princípios da Arquitetura Pedagógica

A arquitetura pedagógica do LabInspeção_UniSENAI é orientada pelos seguintes princípios:

centralidade no desenvolvimento de competências;
separação entre organização pedagógica e implementação tecnológica;
reutilização de recursos educacionais;
composição de experiências de aprendizagem;
flexibilidade curricular;
independência entre conteúdos e tecnologias;
evolução incremental;
rastreabilidade das evidências de aprendizagem.

Esses princípios asseguram que a plataforma possa acompanhar mudanças curriculares, avanços tecnológicos e novas metodologias de ensino sem comprometer sua coerência arquitetural.

12. Arquitetura de Comunicação

A arquitetura de comunicação do LabInspeção_UniSENAI define os mecanismos pelos quais os componentes da plataforma interagem durante sua execução.

Seu principal objetivo é garantir que a troca de informações ocorra de forma padronizada, previsível e com baixo acoplamento, preservando a independência entre módulos, plugins e serviços.

Como princípio geral, a comunicação deverá ocorrer por meio de interfaces públicas e serviços disponibilizados pelo Core, evitando dependências diretas entre componentes.

12.1 Objetivos

A arquitetura de comunicação busca:

reduzir o acoplamento entre componentes;
facilitar a evolução da plataforma;
permitir substituição de implementações;
favorecer reutilização;
simplificar testes;
aumentar previsibilidade do comportamento da aplicação.
12.2 Princípios

Toda comunicação deverá observar os seguintes princípios.

Encapsulamento

Cada componente expõe apenas sua interface pública.

Sua implementação interna permanece isolada.

Baixo Acoplamento

Componentes não devem conhecer detalhes internos uns dos outros.

As dependências devem ocorrer exclusivamente através de contratos públicos.

Alta Coesão

Cada componente comunica apenas informações relacionadas às suas responsabilidades.

Comunicação Mediada

Sempre que possível, a comunicação deverá ocorrer por meio do Core ou de serviços compartilhados.

Independência Tecnológica

O protocolo de comunicação não deverá depender de bibliotecas específicas.

12.3 Comunicação entre Componentes

O fluxo geral pode ser representado da seguinte forma.

Interface
│
▼
Core
│
┌────┼───────────────┐
▼ ▼ ▼
Services Plugin Manager Persistência
│
┌──────────┼───────────────┐
▼ ▼ ▼
Tool Experience Integration
Plugins Plugins Plugins

O Core atua como elemento central de coordenação.

12.4 Comunicação entre Plugins

Plugins não devem estabelecer comunicação direta entre si.

Por exemplo:

❌ Não recomendado

Quiz Plugin
│
▼
Simulation Plugin

Em vez disso:

Quiz Plugin
│
▼
Core
│
▼
Simulation Plugin

Essa abordagem reduz dependências e facilita a evolução independente de cada plugin.

12.5 Comunicação por Serviços

Quando múltiplos componentes necessitarem compartilhar funcionalidades, deverá ser utilizado um serviço comum.

Exemplos:

serviço de autenticação;
serviço de persistência;
serviço de notificações;
serviço de arquivos;
serviço de configurações.

Os serviços constituem recursos compartilhados disponibilizados pelo Core.

12.6 Comunicação Baseada em Eventos

Sempre que possível, componentes deverão comunicar mudanças de estado utilizando eventos.

Exemplos:

QuizFinished

VehicleSelected

InspectionCompleted

PluginLoaded

PluginDisposed

ReportGenerated

Essa abordagem reduz dependências explícitas entre componentes.

12.7 Fluxo de Execução de uma Experiência

O fluxo típico de uma atividade ocorre conforme o diagrama abaixo.

Usuário

↓

Interface

↓

Core

↓

Plugin Manager

↓

Experience Plugin

↓

Tool Plugins

↓

Persistência

↓

Interface

Durante esse processo, cada componente executa apenas as responsabilidades sob sua competência.

12.8 Comunicação com Sistemas Externos

Toda comunicação externa deverá ocorrer exclusivamente através de Integration Plugins.

Core

↓

Integration Plugin

↓

API Externa

Nenhum componente interno deverá consumir diretamente APIs externas.

Essa diretriz preserva o isolamento da arquitetura e facilita substituições futuras.

12.9 Fluxo de Persistência

O acesso aos dados segue o seguinte modelo.

Interface

↓

Core

↓

Serviço de Persistência

↓

IndexedDB

Plugins não devem acessar diretamente mecanismos físicos de armazenamento.

12.10 Fluxo de Carregamento de Plugins

O carregamento de um plugin ocorre segundo as etapas abaixo.

Plugin Manager

↓

Descoberta

↓

Validação

↓

Registro

↓

Inicialização

↓

Montagem

↓

Disponibilização

Cada etapa poderá registrar eventos de auditoria.

12.11 Tratamento de Erros

Exceções não deverão ser propagadas indiscriminadamente entre componentes.

O tratamento seguirá os seguintes princípios:

captura no componente responsável;
registro estruturado;
comunicação padronizada ao Core;
recuperação sempre que possível;
isolamento de falhas.

Erros em um plugin não deverão comprometer a estabilidade da plataforma.

12.12 Observabilidade

A arquitetura deverá oferecer mecanismos para acompanhamento da execução da plataforma.

Entre eles:

logs;
eventos;
métricas;
mensagens de diagnóstico;
rastreamento de execução (tracing).

Esses recursos auxiliam manutenção, testes e depuração.

12.13 Contratos de Comunicação

Toda comunicação entre componentes deverá ocorrer por contratos bem definidos.

Esses contratos deverão especificar:

responsabilidades;
parâmetros de entrada;
resultados esperados;
condições de erro;
eventos produzidos.

Contratos estáveis reduzem impactos durante a evolução da arquitetura.

12.14 Evolução

Novos mecanismos de comunicação poderão ser incorporados futuramente, desde que:

preservem o baixo acoplamento;
mantenham a mediação pelo Core;
não introduzam dependências circulares;
respeitem os contratos arquiteturais existentes.

Alterações significativas deverão ser registradas por meio de um Architecture Decision Record (ADR).

13. Gerenciamento de Estado

O gerenciamento de estado define como as informações são mantidas, compartilhadas e atualizadas durante a execução do LabInspeção_UniSENAI.

Seu objetivo é garantir que todos os componentes da plataforma operem sobre informações consistentes, preservando a integridade dos dados, reduzindo o acoplamento entre componentes e permitindo que a interface reflita corretamente o estado atual da aplicação.

A arquitetura adota o princípio de que o estado constitui um recurso compartilhado da plataforma e, portanto, deve ser gerenciado pelo Core, evitando que componentes implementem mecanismos próprios de compartilhamento de informações.

13.1 Objetivos

A arquitetura de gerenciamento de estado possui os seguintes objetivos:

garantir consistência das informações durante a execução;
evitar duplicação de estados equivalentes;
reduzir dependências entre componentes;
facilitar sincronização entre interface, plugins e serviços;
permitir evolução da plataforma sem alterações nos consumidores do estado;
suportar operação offline;
facilitar testes e depuração.
13.2 Princípios

O gerenciamento de estado deverá observar os seguintes princípios arquiteturais.

Fonte Única da Verdade (Single Source of Truth)

Cada informação compartilhada deverá possuir apenas uma representação oficial dentro da plataforma.

Componentes consumidores deverão acessar essa representação por meio dos serviços disponibilizados pelo Core.

Separação entre Estado Global e Estado Local

A arquitetura distingue dois tipos de estado.

Estado Global

Compartilhado por diferentes componentes da plataforma.

Exemplos:

usuário autenticado;
módulo ativo;
configuração da aplicação;
idioma;
tema visual;
progresso do estudante.
Estado Local

Mantido exclusivamente por um componente durante sua execução.

Exemplos:

campo de formulário;
posição de uma janela;
resposta ainda não enviada;
etapa corrente de um assistente.
Imutabilidade Conceitual

Atualizações do estado deverão ocorrer de maneira controlada e previsível.

Componentes consumidores não deverão modificar diretamente estruturas compartilhadas.

Toda alteração deverá ocorrer pelos mecanismos oficiais disponibilizados pelo Core.

Encapsulamento

A implementação física do gerenciamento de estado deverá permanecer encapsulada.

Componentes utilizarão apenas interfaces públicas.

Dessa forma, mudanças na tecnologia empregada não afetam o restante da arquitetura.

13.3 Categorias de Estado

A plataforma reconhece diferentes categorias de estado, de acordo com seu escopo e ciclo de vida.

Categoria Escopo Responsável
Estado Global Plataforma Core
Estado do Módulo Módulo Pedagógico Core
Estado da Experiência Experience Plugin Plugin
Estado da Ferramenta Tool Plugin Plugin
Estado da Interface Componentes React Interface
Estado Temporário Sessão corrente Core

Essa classificação reduz ambiguidades sobre onde cada informação deve ser mantida.

13.4 Estado Global

O estado global representa informações compartilhadas por toda a plataforma.

Exemplos incluem:

usuário atual;
curso selecionado;
módulo ativo;
configurações gerais;
preferências do usuário;
indicadores globais de progresso.

O acesso ao estado global deverá ocorrer exclusivamente pelos serviços disponibilizados pelo Core.

13.5 Estado dos Módulos Pedagógicos

Cada módulo pedagógico poderá manter informações relacionadas ao progresso do estudante.

Entre elas:

atividades concluídas;
competências desenvolvidas;
avaliações realizadas;
recursos acessados;
indicadores de desempenho.

Essas informações pertencem ao domínio pedagógico e deverão permanecer independentes da implementação dos plugins utilizados.

13.6 Estado dos Experience Plugins

Cada Experience Plugin poderá manter informações relacionadas à experiência de aprendizagem em execução.

Exemplos:

etapa atual;
decisões tomadas;
resultados intermediários;
objetos manipulados;
parâmetros da simulação.

Esse estado deverá permanecer isolado das demais experiências.

13.7 Estado dos Tool Plugins

Os Tool Plugins mantêm apenas o estado necessário à sua funcionalidade específica.

Exemplos:

pergunta atual de um quiz;
posição de um marcador em um gráfico;
parâmetros de um simulador;
conteúdo temporário de um editor.

Tool Plugins não deverão armazenar informações permanentes relacionadas ao progresso do estudante.

13.8 Fluxo de Atualização

Toda atualização de estado deverá seguir um fluxo controlado.

Interface
│
▼
Evento do Usuário
│
▼
Core
│
▼
Atualização do Estado
│
▼
Componentes Interessados

Esse modelo reduz dependências diretas entre componentes e garante consistência durante a propagação das alterações.

13.9 Sincronização

Sempre que diferentes componentes dependerem da mesma informação, a sincronização deverá ocorrer automaticamente a partir do estado oficial mantido pelo Core.

Não é permitido que múltiplos componentes mantenham cópias independentes de informações compartilhadas.

Essa diretriz evita inconsistências decorrentes de atualizações concorrentes.

13.10 Persistência do Estado

A arquitetura distingue claramente estado de execução e dados persistentes.

O estado representa informações necessárias durante a operação corrente da aplicação.

Quando essas informações precisarem ser preservadas entre sessões, deverão ser encaminhadas à camada de persistência descrita na Seção 14.

Essa separação reduz responsabilidades e simplifica a evolução da arquitetura.

13.11 Recuperação do Estado

Sempre que possível, a plataforma deverá ser capaz de restaurar automaticamente o contexto de trabalho do usuário.

Entre as informações que poderão ser recuperadas destacam-se:

módulo ativo;
experiência em execução;
preferências da interface;
progresso não finalizado;
configurações do ambiente.

A restauração deverá respeitar as políticas de persistência e segurança definidas pela plataforma.

13.12 Observabilidade do Estado

O Core poderá disponibilizar mecanismos para inspeção do estado durante desenvolvimento e testes.

Esses mecanismos poderão incluir:

visualização do estado global;
histórico de alterações;
registro de eventos;
rastreamento de atualizações;
ferramentas de depuração.

Esses recursos destinam-se exclusivamente ao desenvolvimento e manutenção da plataforma.

13.13 Evolução

O mecanismo de gerenciamento de estado poderá evoluir ao longo do ciclo de vida da plataforma.

A substituição de bibliotecas ou ferramentas não deverá alterar:

a distinção entre estado global e local;
a responsabilidade do Core pela coordenação do estado compartilhado;
os contratos públicos utilizados pelos componentes;
os princípios arquiteturais definidos nesta seção.

Alterações que modifiquem o modelo conceitual de gerenciamento de estado deverão ser formalizadas por meio de um Architecture Decision Record (ADR).

Diagrama conceitual
Core
│
┌────────────┼────────────┐
│ │ │
▼ ▼ ▼
Estado Global Estado do Serviços
Módulo
│
▼
Experience Plugin
│
▼
Tool Plugin
│
▼
Estado Local da UI

          14. Arquitetura de Persistência

A arquitetura de persistência define como os dados do LabInspeção_UniSENAI são armazenados, recuperados, versionados e protegidos ao longo do ciclo de vida da aplicação.

Seu objetivo é garantir que informações relevantes permaneçam disponíveis entre sessões, mesmo em condições de conectividade limitada ou inexistente, preservando integridade, rastreabilidade e compatibilidade com futuras evoluções da plataforma.

A persistência deverá permanecer desacoplada da interface, dos módulos pedagógicos e dos plugins. Nenhum desses componentes deverá depender diretamente de um mecanismo físico de armazenamento.

14.1 Objetivos

A arquitetura de persistência possui os seguintes objetivos:

assegurar armazenamento confiável dos dados;
suportar a estratégia Offline First;
preservar dados entre sessões;
evitar acesso direto aos mecanismos físicos de armazenamento;
permitir migração e evolução das estruturas de dados;
facilitar sincronização futura com serviços remotos;
reduzir o impacto da substituição de tecnologias;
garantir rastreabilidade das operações relevantes.
14.2 Princípios

A persistência deverá observar os seguintes princípios arquiteturais.

Abstração

Os componentes da aplicação não deverão conhecer a tecnologia utilizada para armazenar os dados.

O acesso deverá ocorrer exclusivamente por meio de serviços e repositórios disponibilizados pela camada de persistência.

Separação de Responsabilidades

A persistência será responsável por:

salvar;
recuperar;
atualizar;
excluir;
versionar;
migrar dados.

Ela não será responsável por interpretar o significado pedagógico dessas informações.

Persistência Orientada a Contratos

Toda operação deverá ocorrer por interfaces explicitamente definidas.

Exemplo conceitual:

interface ProgressRepository {
save(progress: ProgressData): Promise<void>;
findByModule(moduleId: string): Promise<ProgressData | null>;
remove(moduleId: string): Promise<void>;
}

A implementação concreta poderá mudar sem alterar os consumidores do contrato.

Resiliência

Falhas temporárias de armazenamento não deverão comprometer a estabilidade geral da aplicação.

A plataforma deverá:

detectar falhas;
preservar dados em memória quando possível;
informar o usuário de maneira adequada;
tentar recuperação sem duplicar registros.
14.3 Estratégia Offline First

A persistência é estruturada segundo a estratégia Offline First.

Isso significa que o armazenamento local constitui o mecanismo primário de operação da plataforma, e não apenas uma solução de contingência.

O fluxo preferencial será:

Usuário
│
▼
Aplicação
│
▼
Persistência Local
│
▼
Sincronização Remota Futura

A indisponibilidade de rede não deverá impedir:

acesso a conteúdos previamente armazenados;
execução de atividades;
registro de progresso;
geração de resultados;
recuperação do contexto anterior.
14.4 Camada de Persistência

A camada de persistência deverá centralizar todas as operações de armazenamento.

Arquiteturalmente, poderá ser organizada nos seguintes elementos:

Persistência
│
├── Repositórios
├── Adaptadores de Armazenamento
├── Serviço de Migração
├── Serviço de Sincronização
├── Serviço de Backup
└── Controle de Versão dos Dados

Essa organização separa contratos de acesso, tecnologias físicas e mecanismos de evolução.

14.5 Repositórios

Os repositórios representam a interface entre o domínio da aplicação e os mecanismos de armazenamento.

Exemplos:

ModuleRepository;
ProgressRepository;
SessionRepository;
AssessmentRepository;
PluginStateRepository;
SettingsRepository.

Cada repositório deverá possuir responsabilidade específica e não deverá acumular dados pertencentes a diferentes domínios.

14.6 Adaptadores de Armazenamento

Os adaptadores implementam a comunicação com tecnologias concretas.

Exemplos:

adaptador para IndexedDB;
adaptador para Local Storage;
adaptador para Session Storage;
adaptador futuro para API remota;
adaptador para exportação de arquivos.

Os repositórios dependerão das abstrações desses adaptadores, e não de implementações específicas.

14.7 IndexedDB

A IndexedDB deverá ser o mecanismo preferencial para armazenamento local estruturado.

Seu uso é indicado para:

progresso do estudante;
resultados de atividades;
estado persistente de experiências;
conteúdos armazenados para operação offline;
dados com maior volume;
registros que necessitem consultas estruturadas.

A estrutura dos bancos e coleções deverá ser versionada.

14.8 Local Storage

O Local Storage poderá ser utilizado para pequenas configurações persistentes e de baixa complexidade.

Exemplos:

preferência de tema;
idioma;
última rota acessada;
opções de interface;
identificadores não sensíveis.

Não deverá ser utilizado para:

grandes volumes de dados;
informações complexas;
dados sensíveis;
registros pedagógicos extensos;
estruturas que exijam consultas avançadas.
14.9 Session Storage

O Session Storage deverá ser utilizado apenas para informações temporárias associadas à sessão atual do navegador.

Exemplos:

etapa corrente de um fluxo;
filtros temporários;
parâmetros de navegação;
dados descartáveis após o encerramento da aba.

Informações relevantes ao progresso do estudante não deverão depender exclusivamente desse mecanismo.

14.10 Classificação dos Dados

Os dados deverão ser classificados antes da definição do mecanismo de persistência.

Categoria Exemplos Mecanismo Preferencial
Configuração simples tema, idioma, preferências Local Storage
Estado temporário filtros, etapa transitória Session Storage
Dados estruturados progresso, avaliações, resultados IndexedDB
Recursos offline conteúdos, arquivos, metadados IndexedDB e Cache Storage
Dados remotos registros sincronizados API por Integration Plugin

Essa classificação deverá orientar decisões de implementação.

14.11 Identificação dos Registros

Todo registro persistente deverá possuir identificação estável.

Quando aplicável, deverá conter:

identificador único;
tipo do registro;
versão da estrutura;
data de criação;
data de atualização;
origem;
estado de sincronização.

Exemplo conceitual:

interface PersistedRecord {
id: string;
schemaVersion: number;
createdAt: string;
updatedAt: string;
syncStatus?: "local" | "pending" | "synced" | "conflict";
}
14.12 Versionamento dos Dados

As estruturas persistidas deverão possuir versionamento independente da versão da aplicação.

Essa distinção é necessária porque uma nova versão do software poderá continuar operando sobre dados produzidos anteriormente.

O versionamento deverá permitir:

identificar a estrutura utilizada;
verificar compatibilidade;
aplicar migrações;
rejeitar dados inválidos;
preservar registros históricos.
14.13 Migração de Estruturas

Mudanças nas estruturas de dados deverão ser acompanhadas por mecanismos explícitos de migração.

O processo conceitual será:

Detectar versão existente
│
▼
Validar compatibilidade
│
▼
Executar migração
│
▼
Validar resultado
│
▼
Registrar nova versão

Migrações deverão ser:

determinísticas;
testáveis;
reversíveis, quando viável;
executadas de forma controlada;
registradas em log.
14.14 Integridade dos Dados

A camada de persistência deverá validar os dados antes de armazená-los.

As validações poderão incluir:

presença de campos obrigatórios;
tipos corretos;
consistência entre entidades;
valores permitidos;
versão da estrutura;
duplicidade de identificadores.

Dados inválidos não deverão ser persistidos silenciosamente.

14.15 Operações Atômicas

Sempre que uma operação envolver múltiplas alterações relacionadas, deverá ser executada de forma atômica.

Ou todas as alterações são concluídas, ou nenhuma delas é considerada válida.

Esse princípio é especialmente importante para:

conclusão de atividades;
atualização simultânea de progresso e evidências;
migração de estruturas;
sincronização de registros correlacionados.
14.16 Persistência do Estado dos Plugins

Plugins não deverão acessar diretamente IndexedDB, Local Storage ou Session Storage.

Quando precisarem preservar informações, deverão utilizar os serviços oficiais do Core.

O Core deverá associar os dados persistidos a:

identificador do plugin;
versão do plugin;
usuário ou sessão;
módulo ou experiência correspondente;
versão da estrutura de dados.

Isso evita colisões entre plugins e facilita descarregamento, atualização e migração.

14.17 Persistência de Evidências de Aprendizagem

As evidências produzidas durante atividades poderão incluir:

respostas;
resultados de simulações;
decisões;
relatórios;
arquivos;
indicadores;
histórico de tentativas.

Esses dados deverão permanecer associados ao contexto pedagógico que lhes confere significado.

Exemplo:

Usuário
└── Curso
└── Módulo
└── Atividade
└── Evidência

A arquitetura deverá distinguir evidências pedagógicas de dados meramente operacionais.

14.18 Cache de Conteúdo

Recursos necessários à operação offline poderão ser armazenados por mecanismos de cache.

Exemplos:

páginas estáticas;
imagens;
estilos;
scripts;
arquivos pedagógicos;
metadados de módulos.

O Cache Storage deverá ser utilizado para recursos estáticos e de distribuição, enquanto a IndexedDB deverá armazenar dados estruturados da aplicação.

Essa separação evita o uso inadequado de um mecanismo para finalidades para as quais não foi projetado.

14.19 Backup e Exportação

A arquitetura deverá permitir, futuramente, mecanismos de backup e exportação.

Esses mecanismos poderão incluir:

exportação de progresso;
geração de relatórios;
cópia de dados locais;
restauração de sessões;
transferência entre dispositivos.

Os formatos de exportação deverão ser documentados e, preferencialmente, baseados em padrões abertos.

14.20 Sincronização com Serviços Remotos

A sincronização remota será incorporada por meio de Integration Plugins ou serviços especializados.

O fluxo deverá preservar o funcionamento local:

Persistência Local
│
▼
Fila de Sincronização
│
▼
Integration Plugin
│
▼
Serviço Remoto

A sincronização não deverá bloquear a execução da aplicação.

14.21 Estados de Sincronização

Registros sujeitos à sincronização poderão assumir estados como:

local;
pendente;
sincronizando;
sincronizado;
conflito;
erro.

Esses estados deverão ser explícitos, evitando que falhas de comunicação sejam confundidas com perda de dados.

14.22 Resolução de Conflitos

Quando houver divergência entre dados locais e remotos, a arquitetura deverá aplicar uma política definida de resolução de conflitos.

Possíveis estratégias incluem:

prevalência do registro mais recente;
prevalência do registro local;
prevalência do servidor;
mesclagem de campos;
resolução manual.

A estratégia deverá depender do tipo de dado.

Registros pedagógicos relevantes não deverão ser sobrescritos sem rastreabilidade.

14.23 Segurança e Privacidade

A persistência deverá observar os princípios de minimização e necessidade.

A plataforma deverá armazenar apenas os dados necessários ao funcionamento da experiência educacional.

Dados sensíveis não deverão ser mantidos em armazenamento local sem justificativa, proteção adequada e política explícita.

Aspectos adicionais de segurança serão tratados na Seção 15.

14.24 Tratamento de Falhas

Falhas de persistência deverão ser tratadas de maneira previsível.

A arquitetura deverá distinguir, pelo menos:

indisponibilidade temporária;
limite de armazenamento;
registro corrompido;
versão incompatível;
falha de migração;
conflito de sincronização.

O usuário deverá receber mensagens compreensíveis, enquanto os detalhes técnicos deverão ser registrados para diagnóstico.

14.25 Observabilidade

A camada de persistência deverá produzir informações suficientes para manutenção e diagnóstico.

Poderão ser registrados:

operação executada;
repositório envolvido;
duração;
resultado;
versão da estrutura;
falhas;
migrações aplicadas;
estado de sincronização.

Logs não deverão expor dados pessoais ou conteúdo pedagógico sensível.

14.26 Estratégia de Limpeza

A plataforma deverá possuir critérios para remoção segura de dados obsoletos.

A limpeza poderá considerar:

expiração;
versão incompatível;
conclusão de sessão;
solicitação do usuário;
descarte de cache;
desinstalação de plugin.

Dados pedagógicos não deverão ser removidos automaticamente sem política explícita.

14.27 Fluxo Geral de Persistência
Componente
│
▼
Serviço do Core
│
▼
Repositório
│
▼
Adaptador
│
├── IndexedDB
├── Local Storage
├── Session Storage
├── Cache Storage
└── API Remota

O componente consumidor não conhece o mecanismo físico utilizado.

14.28 Evolução

A arquitetura de persistência deverá permitir a substituição ou ampliação das tecnologias de armazenamento sem alterar os contratos utilizados pelos componentes.

Poderão ser incorporados futuramente:

bancos remotos;
sincronização institucional;
armazenamento em nuvem;
múltiplos perfis de usuário;
criptografia local;
repositórios colaborativos.

Alterações que modifiquem contratos, políticas de versionamento, sincronização ou classificação dos dados deverão ser formalizadas por meio de um Architecture Decision Record (ADR).

Quadro-resumo
Elemento Responsabilidade
Serviço de Persistência Coordenar operações de armazenamento
Repositório Representar operações de um domínio específico
Adaptador Acessar uma tecnologia concreta
IndexedDB Armazenar dados locais estruturados
Local Storage Armazenar preferências simples
Session Storage Manter dados temporários da sessão
Cache Storage Armazenar recursos necessários à operação offline
Serviço de Migração Evoluir estruturas persistidas
Serviço de Sincronização Coordenar comunicação com armazenamento remoto

15. Segurança da Plataforma

A arquitetura de segurança do LabInspeção_UniSENAI define os princípios, controles e responsabilidades destinados a proteger a plataforma, seus dados, seus usuários e seu ecossistema de plugins.

A segurança deverá ser tratada como uma característica transversal da arquitetura, e não como funcionalidade isolada. Por essa razão, seus requisitos alcançam o Core, a interface, os plugins, os serviços, a persistência, as integrações externas e os mecanismos de distribuição.

A estratégia adotada deverá considerar tanto o funcionamento conectado quanto a operação offline, preservando confidencialidade, integridade, disponibilidade e rastreabilidade das informações.

15.1 Objetivos

A arquitetura de segurança possui os seguintes objetivos:

proteger a integridade do Core;
impedir que falhas em um plugin comprometam a plataforma;
restringir acessos indevidos a dados e serviços;
proteger informações persistidas localmente;
controlar a comunicação com sistemas externos;
reduzir riscos decorrentes da execução offline;
assegurar rastreabilidade das operações relevantes;
permitir evolução segura do ecossistema de plugins;
preservar a privacidade dos usuários.
15.2 Princípios de Segurança

A segurança da plataforma deverá observar os princípios apresentados a seguir.

Defesa em Profundidade

A proteção não deverá depender de um único mecanismo.

Controles complementares deverão ser aplicados em diferentes camadas, incluindo:

interface;
Core;
plugins;
persistência;
comunicação;
distribuição;
integração externa.
Privilégio Mínimo

Cada componente deverá receber apenas as permissões necessárias ao cumprimento de sua responsabilidade.

Um plugin não deverá possuir acesso irrestrito à plataforma, aos dados ou aos serviços externos.

Negação por Padrão

Toda ação não explicitamente autorizada deverá ser considerada proibida.

Permissões deverão ser concedidas de forma intencional e documentada.

Separação de Responsabilidades

Componentes críticos deverão possuir responsabilidades bem delimitadas.

Por exemplo:

plugins executam funcionalidades especializadas;
o Core controla permissões;
a camada de persistência controla armazenamento;
Integration Plugins controlam comunicação externa.
Minimização de Dados

A plataforma deverá coletar e armazenar apenas os dados necessários ao funcionamento das experiências educacionais.

Informações sem finalidade definida não deverão ser mantidas.

Segurança por Projeto

Requisitos de segurança deverão ser considerados desde o planejamento de cada componente, plugin ou integração.

A segurança não deverá ser adicionada apenas após a implementação.

15.3 Modelo de Ameaças

A evolução da plataforma deverá considerar, no mínimo, as seguintes categorias de ameaça:

execução indevida de código;
manipulação do estado global;
acesso não autorizado a dados persistidos;
vazamento de informações pessoais;
comunicação insegura com APIs externas;
adulteração de plugins;
corrupção de dados locais;
perda de dados durante sincronização;
uso indevido de permissões;
injeção de conteúdo malicioso;
exposição de credenciais;
dependências de terceiros vulneráveis.

A análise de riscos deverá considerar a probabilidade, o impacto e os controles disponíveis para cada ameaça.

15.4 Fronteiras de Confiança

A arquitetura deverá reconhecer explicitamente suas fronteiras de confiança.

Usuário
│
▼
Interface
│
▼
Core
│
├── Serviços internos
├── Persistência
└── Plugin Manager
│
├── Tool Plugins
├── Experience Plugins
└── Integration Plugins
│
▼
Sistemas Externos

As principais fronteiras encontram-se:

entre o usuário e a interface;
entre plugins e Core;
entre persistência local e componentes consumidores;
entre Integration Plugins e serviços externos;
entre o pacote distribuído e a origem de atualização.

Toda travessia de fronteira deverá possuir validação e controle apropriados.

15.5 Segurança do Core

O Core constitui o principal domínio confiável da plataforma.

Compete a ele:

aplicar contratos arquiteturais;
controlar permissões;
validar plugins;
gerenciar estado compartilhado;
mediar acesso à persistência;
coordenar comunicação externa;
isolar falhas;
registrar eventos relevantes.

Plugins não deverão modificar diretamente:

configurações internas do Core;
estado global;
registro de outros plugins;
políticas de segurança;
mecanismos de persistência;
serviços de autenticação.
15.6 Isolamento dos Plugins

Cada plugin deverá operar dentro dos limites definidos por seu contrato e por suas permissões.

O isolamento deverá impedir que um plugin:

acesse diretamente dados pertencentes a outro plugin;
manipule o ciclo de vida de outro plugin;
altere estado global sem autorização;
execute chamadas externas não declaradas;
acesse armazenamento físico diretamente;
carregue código arbitrário em tempo de execução;
modifique elementos globais da interface fora de sua área de montagem.

O nível de isolamento poderá evoluir conforme a plataforma incorporar plugins externos ou de terceiros.

15.7 Manifesto de Permissões

Cada plugin deverá declarar previamente as capacidades de que necessita.

Exemplo conceitual:

interface PluginPermissions {
persistence?: "none" | "read" | "read-write";
network?: string[];
events?: string[];
files?: "none" | "read" | "export";
userData?: string[];
}

As permissões deverão:

ser explícitas;
possuir escopo limitado;
ser validadas pelo Plugin Manager;
permanecer associadas à versão do plugin;
ser negadas quando incompatíveis com a política da plataforma.
15.8 Validação de Plugins

Antes do carregamento, cada plugin deverá ser submetido a validações mínimas.

Entre elas:

integridade dos metadados;
compatibilidade de versão;
existência do contrato obrigatório;
validade das permissões declaradas;
ausência de dependências proibidas;
conformidade com as convenções arquiteturais;
origem autorizada;
integridade do pacote, quando aplicável.

Plugins inválidos não deverão ser inicializados.

15.9 Categorias de Confiança dos Plugins

A plataforma poderá distinguir diferentes níveis de confiança.

Categoria Origem Tratamento
Interno Desenvolvido pela equipe da plataforma Validação padrão
Institucional Produzido por equipe autorizada Validação e homologação
Terceiro homologado Desenvolvido externamente e revisado Controles reforçados
Não confiável Origem desconhecida ou não homologada Execução proibida

Essa classificação torna-se especialmente importante na eventual criação de um catálogo ou marketplace.

15.10 Autenticação

A autenticação identifica o usuário que acessa a plataforma.

A versão inicial poderá operar sem autenticação centralizada, especialmente em cenários locais ou demonstrativos.

Quando incorporada, a autenticação deverá:

utilizar protocolos consolidados;
evitar armazenamento local de senhas;
permitir revogação de sessão;
separar identidade de autorização;
suportar integração institucional;
preservar funcionamento offline de forma controlada.

Credenciais não deverão ser incorporadas ao código-fonte ou aos pacotes distribuídos.

15.11 Autorização

A autorização determina quais ações um usuário ou componente pode executar.

A arquitetura poderá adotar perfis como:

estudante;
docente;
autor de conteúdo;
administrador;
desenvolvedor;
auditor.

Cada perfil deverá possuir permissões explicitamente definidas.

A autorização deverá ser aplicada nos serviços responsáveis pela operação, e não apenas por ocultação de elementos da interface.

15.12 Controle de Acesso Baseado em Papéis

Quando necessário, a plataforma poderá adotar controle de acesso baseado em papéis, conhecido como Role-Based Access Control — RBAC.

Exemplo conceitual:

Estudante
├── Executar atividades
├── Consultar próprio progresso
└── Exportar próprio relatório

Docente
├── Consultar resultados de turmas autorizadas
├── Acompanhar evidências
└── Configurar experiências permitidas

Administrador
├── Gerenciar usuários
├── Gerenciar plugins
└── Gerenciar políticas

Os papéis deverão refletir responsabilidades reais e evitar privilégios excessivos.

15.13 Segurança da Persistência Local

Dados armazenados no navegador deverão ser tratados como potencialmente acessíveis ao usuário do dispositivo.

Por essa razão:

segredos não deverão ser armazenados em texto simples;
dados sensíveis deverão ser evitados;
tokens deverão possuir escopo e duração limitados;
informações pessoais deverão ser minimizadas;
dados deverão ser removidos quando deixarem de ser necessários;
o logout deverá limpar dados de sessão quando aplicável.

IndexedDB, Local Storage e Session Storage não deverão ser considerados mecanismos seguros por si próprios.

15.14 Proteção de Dados Sensíveis

Quando a plataforma processar dados pessoais ou informações educacionais identificáveis, deverá observar:

finalidade específica;
necessidade;
minimização;
transparência;
controle de acesso;
retenção limitada;
descarte seguro.

A arquitetura deverá diferenciar:

dados operacionais;
dados pedagógicos;
dados pessoais;
dados de autenticação;
dados de telemetria.

Essa classificação orientará políticas de armazenamento, acesso e sincronização.

15.15 Segurança na Operação Offline

A operação offline introduz riscos específicos.

Entre eles:

uso compartilhado do dispositivo;
acesso físico ao navegador;
dados desatualizados;
expiração de credenciais;
conflitos de sincronização;
adulteração local.

A plataforma deverá considerar:

expiração de sessões;
bloqueio de operações que exijam validação remota;
identificação clara de dados não sincronizados;
revalidação após reconexão;
políticas de limpeza local;
diferenciação entre modo autenticado e modo offline anônimo.
15.16 Comunicação Segura

Toda comunicação com sistemas externos deverá utilizar canais protegidos.

A arquitetura deverá exigir:

HTTPS;
validação de origem;
limites de tempo;
tratamento de indisponibilidade;
validação de respostas;
proteção contra repetição indevida;
ausência de credenciais embutidas no cliente.

Integration Plugins deverão encapsular os detalhes de autenticação e comunicação.

15.17 Validação de Entradas

Toda entrada externa deverá ser considerada não confiável.

Isso inclui:

dados digitados pelo usuário;
arquivos importados;
respostas de APIs;
parâmetros de URL;
metadados de plugins;
conteúdo carregado remotamente;
dados recuperados da persistência.

As entradas deverão ser validadas quanto a:

tipo;
formato;
tamanho;
valores permitidos;
estrutura;
versão;
contexto de uso.
15.18 Proteção da Interface

A interface deverá impedir que conteúdo dinâmico não confiável seja interpretado como código.

Devem ser evitados:

inserção direta de HTML não sanitizado;
execução de scripts externos não autorizados;
montagem de conteúdo por concatenação insegura;
URLs construídas sem validação;
uso indiscriminado de APIs de execução dinâmica.

Conteúdos pedagógicos importados deverão ser tratados como dados, não como código executável.

15.19 Segurança das Integrações Externas

Cada Integration Plugin deverá possuir responsabilidade limitada a uma integração específica.

Ele deverá:

declarar os serviços acessados;
proteger credenciais;
validar respostas;
limitar dados enviados;
tratar indisponibilidade;
registrar falhas sem expor informações sensíveis;
respeitar as políticas de privacidade da plataforma.

Um Integration Plugin não deverá reutilizar credenciais de outro sem autorização explícita.

15.20 Gestão de Credenciais

Segredos, chaves e tokens não deverão ser armazenados no repositório de código.

A gestão de credenciais deverá utilizar mecanismos apropriados ao ambiente de implantação.

Em aplicações puramente client-side, não deverão ser incorporados segredos que precisem permanecer confidenciais.

Quando uma integração exigir segredo privado, deverá ser considerada a adoção de um serviço intermediário seguro.

15.21 Dependências de Terceiros

Bibliotecas e pacotes externos representam parte da superfície de ataque da plataforma.

A gestão de dependências deverá incluir:

versões controladas;
revisão de origem;
atualização periódica;
análise de vulnerabilidades;
remoção de dependências desnecessárias;
prevenção de pacotes abandonados;
registro de alterações relevantes.

A adoção de nova dependência deverá possuir justificativa técnica.

15.22 Segurança da Cadeia de Distribuição

O processo de build e distribuição deverá preservar a integridade dos artefatos publicados.

A arquitetura deverá considerar:

builds reproduzíveis;
dependências fixadas;
revisão de alterações;
automação controlada;
proteção da branch principal;
validação antes da publicação;
rastreabilidade entre versão e commit;
restrição de permissões de implantação.

Esses aspectos serão detalhados na Seção 18.

15.23 Logs e Auditoria

Operações relevantes poderão gerar registros de auditoria.

Exemplos:

autenticação;
alteração de permissões;
carregamento ou rejeição de plugins;
migração de dados;
sincronização;
falha de segurança;
exportação de dados;
alteração administrativa.

Os logs deverão evitar:

senhas;
tokens;
conteúdo pessoal desnecessário;
respostas completas de avaliações;
dados sensíveis em texto aberto.
15.24 Tratamento de Incidentes

A arquitetura deverá permitir identificar, conter e diagnosticar incidentes de segurança.

O fluxo conceitual será:

Detecção
│
▼
Registro
│
▼
Isolamento
│
▼
Avaliação
│
▼
Correção
│
▼
Recuperação
│
▼
Prevenção de Recorrência

Plugins suspeitos deverão poder ser desabilitados sem interromper toda a plataforma.

15.25 Recuperação Segura

Após falhas ou incidentes, a plataforma deverá:

validar a integridade dos dados;
evitar restauração de código comprometido;
reaplicar políticas de segurança;
invalidar sessões ou credenciais quando necessário;
registrar as ações executadas;
preservar evidências técnicas relevantes.
15.26 Privacidade

A plataforma deverá adotar privacidade por padrão.

Isso implica:

não coletar dados sem finalidade definida;
não ativar telemetria desnecessária;
limitar compartilhamento externo;
permitir exclusão quando aplicável;
informar o usuário sobre dados armazenados;
separar dados identificáveis de métricas agregadas.

A eventual adoção de analytics deverá ser precedida por análise específica de privacidade.

15.27 Segurança e Dados Educacionais

Dados de progresso, avaliação e desempenho possuem significado educacional e não deverão ser tratados como simples telemetria.

O acesso a esses dados deverá observar:

finalidade pedagógica;
perfil autorizado;
contexto institucional;
rastreabilidade;
retenção definida;
proteção contra exposição indevida.

A exportação deverá respeitar o escopo do usuário e da instituição.

15.28 Tratamento de Erros de Segurança

Mensagens apresentadas ao usuário deverão ser compreensíveis, mas não deverão revelar detalhes internos que facilitem exploração.

Exemplo:

mensagem ao usuário: “Não foi possível concluir a operação com segurança”;
registro técnico: código, componente, contexto, versão e causa identificada.

Erros de autorização não deverão ser tratados como simples falhas de interface.

15.29 Testes de Segurança

A estratégia de testes deverá contemplar:

validação de permissões;
isolamento entre plugins;
entradas inválidas;
conteúdo malicioso;
acesso indevido a dados;
falhas de autenticação;
expiração de sessão;
comunicação externa;
migrações inseguras;
dependências vulneráveis.

A Seção 17 detalhará a estratégia geral de testes.

15.30 Responsabilidades
Componente Responsabilidade de segurança
Core Aplicar políticas e controlar acessos
Plugin Manager Validar, autorizar e isolar plugins
Plugins Respeitar contratos e permissões
Persistência Proteger, validar e versionar dados
Integration Plugins Controlar comunicação externa
Interface Validar entradas e evitar execução insegura
Pipeline de build Preservar integridade dos artefatos
Governança Definir políticas, revisar riscos e registrar decisões
15.31 Limitações da Aplicação Client-Side

Por ser executada no navegador, a plataforma possui limitações inerentes.

Não é possível garantir confidencialidade absoluta de:

código distribuído;
dados armazenados localmente;
chaves presentes no cliente;
regras executadas exclusivamente no navegador.

Portanto, operações que exijam segredo, autoridade institucional ou validação incontestável deverão ser delegadas a serviços remotos confiáveis.

Essa limitação deverá ser considerada em qualquer evolução da plataforma.

15.32 Evolução

A arquitetura de segurança poderá evoluir com a incorporação de:

autenticação institucional;
federação de identidade;
controle de acesso baseado em atributos;
assinatura de plugins;
verificação de integridade;
criptografia local;
sandbox reforçado;
serviços remotos;
auditoria institucional;
gestão centralizada de políticas.

Mudanças que alterem fronteiras de confiança, modelo de permissões, autenticação, autorização ou tratamento de dados pessoais deverão ser formalizadas por meio de um Architecture Decision Record (ADR).

Quadro-resumo
Dimensão Diretriz principal
Core Domínio confiável e mediador
Plugins Isolamento e privilégio mínimo
Permissões Declaração explícita e negação por padrão
Persistência Minimização e proteção de dados locais
Offline Limites claros e revalidação após reconexão
Integrações Comunicação exclusiva por Integration Plugins
Credenciais Nunca embutidas no cliente
Dependências Controle, revisão e atualização
Privacidade Coleta mínima e finalidade definida
Auditoria Rastreabilidade sem exposição de dados sensíveis

16. Qualidade Arquitetural

A qualidade arquitetural do LabInspeção_UniSENAI representa o conjunto de atributos, critérios e práticas utilizados para preservar a coerência, a robustez e a capacidade de evolução da plataforma.

Esta seção não trata apenas da qualidade do código. Seu foco é verificar se a arquitetura continua cumprindo seus objetivos à medida que novos módulos, plugins, integrações e funcionalidades são incorporados.

A qualidade arquitetural deverá ser avaliada continuamente, considerando tanto características técnicas quanto pedagógicas.

16.1 Objetivos

A gestão da qualidade arquitetural possui os seguintes objetivos:

preservar a modularidade da plataforma;
evitar acoplamentos indevidos;
manter responsabilidades bem definidas;
favorecer reutilização;
facilitar testes;
permitir substituição de tecnologias;
reduzir dívida técnica;
melhorar observabilidade;
assegurar desempenho adequado;
preservar a arquitetura pedagógica;
sustentar a evolução de longo prazo.
16.2 Atributos de Qualidade

A arquitetura deverá ser avaliada a partir de atributos de qualidade explícitos.

Os principais atributos considerados são:

modularidade;
coesão;
baixo acoplamento;
extensibilidade;
testabilidade;
manutenibilidade;
reutilização;
interoperabilidade;
desempenho;
confiabilidade;
disponibilidade;
segurança;
acessibilidade;
usabilidade;
observabilidade;
portabilidade;
compatibilidade;
rastreabilidade pedagógica.

Esses atributos não possuem necessariamente a mesma prioridade em todos os contextos.

Decisões arquiteturais deverão considerar os compromissos existentes entre eles.

16.3 Modularidade

A modularidade representa a capacidade de dividir a plataforma em componentes independentes, com responsabilidades claramente delimitadas.

A arquitetura deverá preservar a separação entre:

Core;
interface;
módulos pedagógicos;
Tool Plugins;
Experience Plugins;
Integration Plugins;
serviços;
engines;
persistência;
adaptadores.

Um componente não deverá assumir responsabilidades pertencentes a outro domínio arquitetural.

16.4 Critérios de Modularidade

Um componente será considerado adequadamente modular quando:

possuir responsabilidade identificável;
expuser uma interface pública limitada;
não depender de detalhes internos de outros componentes;
puder ser testado isoladamente;
puder evoluir com impacto restrito;
possuir dependências justificadas;
não introduzir ciclos arquiteturais.

A inclusão de um novo componente deverá ser justificada por uma responsabilidade concreta.

16.5 Coesão

A coesão representa o grau de relação entre as responsabilidades reunidas em um mesmo componente.

Componentes deverão possuir alta coesão.

Isso significa que suas funções, dados e comportamentos deverão pertencer ao mesmo propósito arquitetural.

Exemplo adequado:

ProgressRepository
├── salvar progresso
├── recuperar progresso
├── atualizar progresso
└── remover progresso

Exemplo inadequado:

GeneralService
├── salvar progresso
├── autenticar usuário
├── gerar PDF
├── controlar tema
└── chamar API externa

Serviços genéricos e excessivamente abrangentes deverão ser evitados.

16.6 Baixo Acoplamento

O baixo acoplamento permite que componentes sejam alterados com impacto limitado sobre o restante da plataforma.

A arquitetura deverá impedir:

acesso direto à implementação de outro componente;
dependências entre plugins;
acesso direto de plugins à persistência;
acesso direto de módulos pedagógicos a tecnologias;
consumo direto de APIs externas fora de Integration Plugins;
dependência da interface em detalhes internos do Core.

A comunicação deverá ocorrer por contratos, eventos ou serviços explicitamente definidos.

16.7 Dependências Permitidas

As dependências deverão seguir a direção arquitetural estabelecida.

Exemplo conceitual:

Interface
↓
Core
↓
Contratos
↓
Serviços e Plugins
↓
Adaptadores

Dependências em sentido contrário deverão ser evitadas.

Em particular:

o Core não deverá depender de implementações concretas de plugins;
módulos pedagógicos não deverão depender de bibliotecas de interface;
contratos não deverão depender de implementações;
adaptadores poderão depender de contratos, mas contratos não dependerão de adaptadores.
16.8 Dependências Circulares

Dependências circulares deverão ser consideradas violações arquiteturais.

Exemplo proibido:

Core → Plugin A → Serviço B → Core

Ciclos aumentam o acoplamento, dificultam testes e tornam o comportamento da aplicação menos previsível.

Ferramentas automatizadas poderão ser utilizadas para identificar ciclos no grafo de dependências.

16.9 Extensibilidade

A extensibilidade representa a capacidade de incorporar novos recursos sem alterar significativamente componentes existentes.

A plataforma deverá permitir a inclusão de:

novos módulos pedagógicos;
novos Tool Plugins;
novos Experience Plugins;
novos Integration Plugins;
novos repositórios;
novos adaptadores;
novas engines;
novos mecanismos de apresentação.

A extensão deverá ocorrer preferencialmente por composição e implementação de contratos, e não por modificação contínua do Core.

16.10 Princípio Aberto–Fechado

Os principais pontos de extensão da plataforma deverão ser:

abertos para extensão;
fechados para modificações desnecessárias.

Isso significa que a adição de um novo plugin não deverá exigir alterações estruturais no Plugin Manager ou no Core, desde que o plugin respeite o contrato vigente.

16.11 Reutilização

A reutilização deverá ocorrer nos níveis técnico e pedagógico.

Reutilização Técnica

Inclui:

componentes de interface;
serviços;
Tool Plugins;
engines;
adaptadores;
utilitários;
contratos.
Reutilização Pedagógica

Inclui:

atividades;
avaliações;
experiências;
trilhas;
conteúdos;
evidências;
configurações de módulos.

A reutilização não deverá criar dependências indevidas entre domínios.

16.12 Composição

A composição será o mecanismo preferencial para construção de funcionalidades mais complexas.

Exemplo:

Experience Plugin
├── Quiz Tool Plugin
├── Chart Tool Plugin
├── Simulator Tool Plugin
└── Report Tool Plugin

Essa abordagem permite combinar funcionalidades reutilizáveis sem criar componentes monolíticos.

16.13 Testabilidade

A arquitetura deverá permitir que cada componente seja testado em isolamento.

Para isso, os componentes deverão:

depender de abstrações;
receber dependências explicitamente;
evitar estado global oculto;
reduzir efeitos colaterais;
expor comportamentos verificáveis;
permitir substituição por objetos simulados;
manter contratos claros.

Componentes difíceis de testar deverão ser considerados sinais de possível problema arquitetural.

16.14 Manutenibilidade

A manutenibilidade representa a facilidade de compreender, corrigir e evoluir a plataforma.

Ela deverá ser favorecida por:

organização consistente do projeto;
nomenclatura clara;
documentação atualizada;
componentes pequenos e coesos;
contratos explícitos;
testes automatizados;
ADRs;
controle de dependências;
tratamento padronizado de erros.

Mudanças simples não deverão exigir alterações distribuídas por muitos componentes sem relação direta.

16.15 Legibilidade Arquitetural

A estrutura do código deverá tornar visível a arquitetura definida no documento.

A organização dos diretórios, nomes e dependências deverá permitir reconhecer:

o que pertence ao Core;
o que constitui um plugin;
o que constitui um módulo;
onde estão os contratos;
onde estão os serviços;
onde estão os adaptadores;
onde estão os testes.

Quando a arquitetura documentada não puder ser identificada na estrutura real do projeto, haverá divergência arquitetural.

16.16 Conformidade Arquitetural

A conformidade arquitetural representa o grau em que a implementação respeita as regras definidas neste documento.

Poderão ser verificadas regras como:

plugins não importam outros plugins;
módulos não acessam persistência diretamente;
integrações externas passam por Integration Plugins;
estado global é gerenciado pelo Core;
contratos não dependem de implementações;
componentes de domínio não dependem da interface;
dependências circulares não existem.

Essas regras deverão ser automatizadas sempre que possível.

16.17 Observabilidade

A observabilidade permite compreender o comportamento interno da plataforma a partir de informações produzidas durante sua execução.

Ela deverá contemplar:

logs;
métricas;
eventos;
rastreamento;
diagnósticos;
estados de sincronização;
desempenho de plugins;
erros de persistência;
falhas de integração.

A observabilidade deverá apoiar desenvolvimento, testes, suporte e auditoria.

16.18 Logging

Os logs deverão ser:

estruturados;
categorizados;
contextualizados;
consistentes;
filtráveis;
seguros.

Exemplo conceitual:

interface LogEntry {
timestamp: string;
level: "debug" | "info" | "warning" | "error";
component: string;
event: string;
correlationId?: string;
details?: Record<string, unknown>;
}

Logs não deverão conter segredos ou dados pessoais desnecessários.

16.19 Métricas Técnicas

A plataforma poderá coletar métricas técnicas como:

tempo de inicialização;
tempo de carregamento de plugins;
tempo de persistência;
latência de integrações;
taxa de falhas;
consumo de armazenamento;
tamanho do pacote;
tempo de resposta da interface;
quantidade de erros não tratados.

As métricas deverão possuir finalidade definida.

16.20 Métricas Arquiteturais

Também poderão ser acompanhadas métricas relacionadas à estrutura do software.

Exemplos:

número de dependências por componente;
quantidade de ciclos;
profundidade das dependências;
cobertura de testes;
complexidade ciclomática;
tamanho dos componentes;
quantidade de responsabilidades;
número de violações arquiteturais;
dependências entre camadas.

Essas métricas deverão funcionar como indicadores, e não como objetivos isolados.

16.21 Desempenho

O desempenho deverá ser considerado desde o projeto arquitetural.

A plataforma deverá evitar:

carregamento desnecessário de plugins;
processamento repetitivo;
consultas excessivas à persistência;
atualizações desnecessárias da interface;
pacotes iniciais excessivamente grandes;
bloqueio da thread principal;
sincronização remota bloqueante.

A otimização deverá ser baseada em evidências e medições.

16.22 Orçamento de Desempenho

A plataforma poderá definir limites objetivos para aspectos como:

tamanho do pacote inicial;
tempo de inicialização;
tempo de interação;
tempo de carregamento de uma experiência;
consumo máximo de memória;
volume de armazenamento local.

O orçamento de desempenho deverá ser ajustado aos dispositivos e contextos de uso esperados.

16.23 Carregamento Sob Demanda

Plugins, módulos e recursos não utilizados imediatamente deverão ser carregados sob demanda quando tecnicamente viável.

Inicialização
│
├── Core
├── Interface essencial
└── Configuração inicial

Acesso à atividade
│
└── Carregamento do Experience Plugin necessário

Essa estratégia reduz o custo inicial da aplicação.

16.24 Confiabilidade

A confiabilidade representa a capacidade de executar funções corretamente e de maneira previsível.

A plataforma deverá:

validar entradas;
tratar erros;
isolar falhas;
preservar dados;
evitar estados inválidos;
restaurar operações interrompidas quando possível;
registrar condições anormais.

Falhas em componentes não críticos não deverão comprometer a aplicação inteira.

16.25 Disponibilidade

Como aplicação PWA com orientação Offline First, a plataforma deverá permanecer funcional mesmo quando serviços externos estiverem indisponíveis.

A disponibilidade dependerá de:

cache correto dos recursos;
persistência local;
tratamento de falhas;
sincronização assíncrona;
degradação controlada;
independência de integrações não essenciais.

Funcionalidades dependentes de rede deverão informar claramente sua indisponibilidade.

16.26 Degradação Controlada

Quando uma funcionalidade não puder ser executada, a aplicação deverá preservar as demais capacidades.

Exemplo:

Integração com LMS indisponível
│
▼
Atividade continua localmente
│
▼
Resultado é marcado como pendente
│
▼
Sincronização posterior

A falha de uma integração não deverá impedir o uso local da plataforma.

16.27 Interoperabilidade

A plataforma deverá permitir integração com sistemas externos sem comprometer seu modelo interno.

A interoperabilidade deverá ocorrer por:

contratos;
formatos documentados;
adaptadores;
APIs;
Integration Plugins;
padrões abertos, quando disponíveis.

Dados externos deverão ser convertidos para modelos internos antes de serem utilizados pelo domínio da aplicação.

16.28 Portabilidade

A arquitetura deverá reduzir dependências específicas de um único ambiente.

A plataforma deverá ser capaz de operar, dentro de seus requisitos, em diferentes:

navegadores;
sistemas operacionais;
dispositivos;
ambientes de hospedagem;
contextos institucionais.

Recursos não amplamente suportados deverão possuir alternativa ou degradação controlada.

16.29 Compatibilidade

A compatibilidade deverá ser considerada em três dimensões:

Compatibilidade da Aplicação

Relação entre versão da plataforma e ambiente de execução.

Compatibilidade dos Plugins

Relação entre versão do plugin e contrato do Core.

Compatibilidade dos Dados

Relação entre versão da aplicação e estruturas persistidas.

Essas três dimensões deverão possuir mecanismos independentes de versionamento e validação.

16.30 Usabilidade

A qualidade arquitetural também envolve a capacidade de oferecer experiências compreensíveis e consistentes.

A interface deverá:

apresentar padrões uniformes;
reduzir carga cognitiva;
comunicar estados;
informar erros;
preservar contexto;
evitar comportamentos inesperados;
oferecer navegação previsível.

Plugins deverão respeitar o Design System e os padrões de interação da plataforma.

16.31 Acessibilidade

A acessibilidade deverá ser considerada requisito arquitetural, e não apenas característica visual.

A plataforma deverá favorecer:

navegação por teclado;
semântica adequada;
contraste;
textos alternativos;
leitura por tecnologias assistivas;
controle de foco;
mensagens compreensíveis;
adaptação a diferentes tamanhos de tela;
ausência de dependência exclusiva de cor, som ou movimento.

Novos plugins deverão demonstrar conformidade com os requisitos mínimos de acessibilidade.

16.32 Qualidade Pedagógica

A qualidade da plataforma não poderá ser avaliada apenas por critérios técnicos.

A arquitetura deverá preservar:

alinhamento entre competência, atividade e avaliação;
rastreabilidade de evidências;
clareza dos objetivos de aprendizagem;
adequação dos recursos técnicos;
coerência das experiências;
independência entre conteúdo e tecnologia;
possibilidade de revisão pedagógica.

Uma experiência tecnicamente sofisticada, mas pedagogicamente desconectada, não deverá ser considerada de alta qualidade.

16.33 Rastreabilidade Pedagógica

A arquitetura deverá permitir relacionar:

Competência
↓
Objetivo de Aprendizagem
↓
Atividade
↓
Experience Plugin
↓
Evidência
↓
Avaliação

Essa rastreabilidade permite verificar se os recursos tecnológicos efetivamente contribuem para a aprendizagem esperada.

16.34 Critérios de Aceitação Arquitetural

Uma nova funcionalidade poderá ser considerada arquiteturalmente aceitável quando:

possuir responsabilidade clara;
respeitar a direção das dependências;
utilizar contratos existentes ou propor novos contratos justificáveis;
não introduzir acoplamento indevido;
possuir estratégia de testes;
observar segurança;
preservar acessibilidade;
possuir tratamento de erros;
considerar operação offline;
possuir documentação suficiente;
manter rastreabilidade pedagógica quando aplicável.
16.35 Revisões Arquiteturais

Alterações relevantes deverão ser submetidas a revisão arquitetural.

A revisão deverá considerar:

aderência aos princípios;
impactos sobre o Core;
dependências introduzidas;
riscos de segurança;
impacto na persistência;
compatibilidade;
testabilidade;
desempenho;
impacto pedagógico;
necessidade de ADR.

A revisão não deverá ser restrita à avaliação estética do código.

16.36 Dívida Técnica

Dívida técnica representa compromissos assumidos para acelerar uma entrega, mas que geram custo futuro.

Ela deverá ser:

identificada;
registrada;
classificada;
priorizada;
acompanhada;
reduzida de forma planejada.

Exemplos:

dependência provisória entre componentes;
ausência de migração;
plugin fora do contrato definitivo;
falta de testes;
duplicação de lógica;
documentação desatualizada.

Dívida técnica não registrada tende a se tornar parte permanente da arquitetura.

16.37 Dívida Arquitetural

A dívida arquitetural constitui uma forma mais estrutural de dívida técnica.

Exemplos:

Core excessivamente centralizado;
contratos instáveis;
comunicação direta entre plugins;
dependências circulares;
persistência acoplada à interface;
ausência de isolamento;
módulos com conhecimento tecnológico;
crescimento descontrolado de serviços genéricos.

Esses problemas deverão possuir prioridade superior a imperfeições meramente locais.

16.38 Automação da Qualidade

A verificação da qualidade deverá ser automatizada sempre que possível.

O pipeline poderá incluir:

lint;
formatação;
checagem de tipos;
testes unitários;
testes de integração;
análise de dependências;
detecção de ciclos;
verificação de vulnerabilidades;
análise de tamanho do pacote;
auditoria de acessibilidade;
validação de contratos;
build de produção.

Falhas críticas deverão impedir a publicação.

16.39 Quality Gates

A plataforma poderá estabelecer portões de qualidade para integração e distribuição.

Exemplos:

Critério Resultado esperado
Type checking Sem erros
Testes obrigatórios Aprovados
Violações arquiteturais Nenhuma crítica
Vulnerabilidades críticas Nenhuma
Build de produção Concluído
Compatibilidade de plugins Validada
Migrações Testadas
Acessibilidade mínima Atendida
Documentação Atualizada

Os limites deverão ser definidos de forma realista e progressiva.

16.40 Responsabilidades
Papel ou componente Responsabilidade
Arquitetura Definir atributos e regras
Core Aplicar contratos e isolamento
Desenvolvedores Implementar em conformidade
Autores de plugins Respeitar contratos e padrões
Equipe pedagógica Validar coerência educacional
Pipeline CI/CD Automatizar verificações
Revisores Identificar violações e riscos
Governança Gerenciar exceções e evolução
16.41 Exceções Arquiteturais

Em situações justificadas, uma regra arquitetural poderá ser temporariamente flexibilizada.

Toda exceção deverá:

possuir justificativa;
identificar impacto;
registrar riscos;
possuir responsável;
definir prazo de correção;
ser documentada;
ser revisada periodicamente.

Exceções permanentes que alterem a arquitetura deverão ser formalizadas por ADR.

16.42 Modelo Conceitual de Qualidade
Qualidade Arquitetural
│
├── Estrutura
│ ├── Modularidade
│ ├── Coesão
│ └── Baixo Acoplamento
│
├── Evolução
│ ├── Extensibilidade
│ ├── Manutenibilidade
│ └── Reutilização
│
├── Operação
│ ├── Desempenho
│ ├── Confiabilidade
│ ├── Disponibilidade
│ └── Observabilidade
│
├── Experiência
│ ├── Usabilidade
│ ├── Acessibilidade
│ └── Compatibilidade
│
└── Educação
├── Coerência Pedagógica
├── Evidências
└── Rastreabilidade
16.43 Evolução

Os atributos, métricas e critérios de qualidade deverão evoluir conforme a maturidade da plataforma.

Nas fases iniciais, a prioridade deverá recair sobre:

modularidade;
contratos;
testabilidade;
operação offline;
isolamento de plugins;
organização do projeto.

Com o crescimento da plataforma, deverão ganhar maior relevância:

desempenho em escala;
interoperabilidade;
observabilidade;
segurança institucional;
governança de plugins;
métricas pedagógicas;
disponibilidade de serviços.

Alterações significativas nos atributos prioritários ou nos critérios de conformidade deverão ser registradas por meio de um Architecture Decision Record (ADR).

Quadro-resumo
Atributo Diretriz
Modularidade Responsabilidades separadas
Coesão Um propósito principal por componente
Acoplamento Dependências mínimas e explícitas
Extensibilidade Crescimento por contratos e composição
Testabilidade Componentes isoláveis
Manutenibilidade Código e arquitetura compreensíveis
Desempenho Medição e carregamento sob demanda
Confiabilidade Validação, recuperação e isolamento
Disponibilidade Operação local e degradação controlada
Observabilidade Logs, métricas e rastreamento
Acessibilidade Requisito transversal
Qualidade pedagógica Alinhamento e rastreabilidade
Conformidade Regras verificáveis e automatizadas

17. Estratégia de Testes

A estratégia de testes do LabInspeção_UniSENAI define como os componentes da plataforma serão verificados ao longo do desenvolvimento, da integração, da distribuição e da evolução arquitetural.

Seu objetivo é garantir que a plataforma funcione de forma previsível, segura e compatível com os requisitos técnicos e pedagógicos estabelecidos.

Os testes deverão ser tratados como parte da arquitetura, e não apenas como atividade posterior à implementação.

17.1 Objetivos

A estratégia de testes possui os seguintes objetivos:

verificar o comportamento esperado dos componentes;
identificar regressões;
validar contratos arquiteturais;
proteger o Core contra alterações indevidas;
assegurar compatibilidade entre plugins e plataforma;
validar persistência e migrações;
verificar operação offline;
testar integrações externas;
avaliar segurança;
preservar acessibilidade;
validar experiências pedagógicas;
apoiar evolução contínua.
17.2 Princípios

A estratégia deverá observar os seguintes princípios.

Testes Automatizados como Regra

Sempre que um comportamento puder ser verificado de forma repetível, deverá existir preferência por automação.

Testes Próximos da Responsabilidade

Cada componente deverá possuir testes compatíveis com sua responsabilidade.

Exemplo:

contratos são testados por conformidade;
serviços são testados por comportamento;
plugins são testados por ciclo de vida;
experiências são testadas por fluxo;
persistência é testada por integridade e migração.
Isolamento

Testes unitários não deverão depender de:

rede;
navegador real;
armazenamento persistente real;
serviços externos;
ordem de execução;
estado residual.

Dependências deverão ser substituídas por implementações controladas.

Reprodutibilidade

O mesmo teste deverá produzir o mesmo resultado quando executado nas mesmas condições.

Dados aleatórios deverão utilizar sementes controladas quando aplicável.

Rastreabilidade

Testes relevantes deverão estar associados a:

requisito;
contrato;
risco;
incidente;
regra arquitetural;
objetivo pedagógico.
17.3 Pirâmide de Testes

A estratégia adotará uma distribuição equilibrada entre diferentes níveis.

                 Testes de Ponta a Ponta
                        /\
                       /  \
              Testes de Experiência
                    /        \
           Testes de Integração
                /              \
             Testes Unitários

A base deverá concentrar maior quantidade de testes rápidos e isolados.

Os testes de ponta a ponta deverão ser menos numerosos e focados nos fluxos críticos.

17.4 Níveis de Teste

A plataforma deverá contemplar, no mínimo:

testes unitários;
testes de contrato;
testes de integração;
testes de componentes;
testes de plugins;
testes de experiências;
testes de persistência;
testes offline;
testes de segurança;
testes de acessibilidade;
testes de desempenho;
testes de ponta a ponta;
testes de aceitação pedagógica.

Cada nível possui finalidade própria e não deverá substituir os demais.

17.5 Testes Unitários

Os testes unitários verificam comportamentos isolados.

São indicados para:

funções puras;
validadores;
transformadores;
regras de negócio;
serviços sem efeitos externos;
cálculos;
estados;
reducers;
engines;
utilitários.

Exemplo conceitual:

describe("calculateModuleProgress", () => {
it("returns 100 when all activities are completed", () => {
const result = calculateModuleProgress({
totalActivities: 4,
completedActivities: 4
});

    expect(result).toBe(100);

});
});
17.6 Critérios para Testes Unitários

Um teste unitário deverá:

verificar uma responsabilidade;
possuir preparação mínima;
evitar dependências externas;
ser rápido;
apresentar mensagem clara em caso de falha;
cobrir condições normais e excepcionais.

Deverão ser testados:

valores válidos;
limites;
ausência de dados;
formatos inválidos;
erros esperados;
estados extremos.
17.7 Testes de Contrato

Os testes de contrato verificam se uma implementação respeita a interface e o comportamento esperado.

São essenciais para:

plugins;
repositórios;
adaptadores;
serviços;
engines;
integrações externas.

Exemplo:

interface PluginLifecycleContract {
initialize(): Promise<void>;
mount(container: HTMLElement): Promise<void>;
unmount(): Promise<void>;
dispose(): Promise<void>;
}

Toda implementação deverá demonstrar conformidade com esse ciclo de vida.

17.8 Suítes de Conformidade

A plataforma poderá disponibilizar suítes reutilizáveis.

Exemplo conceitual:

export function pluginContractTests(
createPlugin: () => Plugin
): void {
it("initializes successfully", async () => {
const plugin = createPlugin();
await expect(plugin.initialize()).resolves.toBeUndefined();
});

it("disposes without leaving active resources", async () => {
const plugin = createPlugin();
await plugin.initialize();
await expect(plugin.dispose()).resolves.toBeUndefined();
});
}

Cada novo plugin deverá executar a mesma suíte mínima.

17.9 Testes de Integração

Os testes de integração verificam a colaboração entre componentes reais ou parcialmente reais.

Exemplos:

Core e Plugin Manager;
repositório e IndexedDB;
Experience Plugin e Tool Plugin;
Core e serviço de persistência;
Integration Plugin e adaptador de API;
estado global e interface.

Esses testes deverão verificar fronteiras arquiteturais.

17.10 Testes de Componentes de Interface

Componentes de interface deverão ser testados quanto a:

renderização;
propriedades;
eventos;
estados;
mensagens de erro;
navegação por teclado;
semântica;
foco;
integração com serviços.

Os testes deverão priorizar o comportamento visível, e não detalhes internos de implementação.

17.11 Testes do Core

O Core deverá possuir cobertura rigorosa, especialmente para:

inicialização;
registro de serviços;
gerenciamento de estado;
despacho de eventos;
tratamento de erros;
autorização;
carregamento de plugins;
descarregamento;
recuperação de falhas;
persistência;
sincronização.

Alterações no Core deverão exigir revisão e testes reforçados.

17.12 Testes do Plugin Manager

O Plugin Manager deverá ser testado para os seguintes cenários:

descoberta;
validação;
registro;
inicialização;
montagem;
desmontagem;
descarte;
incompatibilidade de versão;
permissões inválidas;
falha de inicialização;
falha de montagem;
tentativa de registro duplicado;
plugin inexistente;
isolamento de falhas.
17.13 Testes de Tool Plugins

Cada Tool Plugin deverá demonstrar:

funcionamento isolado;
aderência ao contrato;
ausência de dependência pedagógica;
possibilidade de reutilização;
tratamento de entradas inválidas;
descarte correto;
acessibilidade;
ausência de efeitos globais indevidos.

Exemplos:

quiz;
gráfico;
calculadora;
simulador;
timeline;
visualizador de PDF.
17.14 Testes de Experience Plugins

Experience Plugins deverão ser testados como unidades de experiência.

Os testes deverão abranger:

fluxo completo;
transições de etapa;
composição de Tool Plugins;
estado interno;
interrupção;
retomada;
persistência;
conclusão;
geração de evidências;
tratamento de erro.
17.15 Testes de Integração entre Experience e Tool Plugins

A composição deverá ser verificada sem permitir dependências indevidas.

Exemplo:

Experience Plugin
│
├── solicita Tool Plugin
├── recebe evento
├── atualiza estado
└── registra evidência

O teste deverá confirmar que a comunicação ocorre por contratos ou eventos definidos.

17.16 Testes dos Módulos Pedagógicos

Os módulos pedagógicos deverão ser testados quanto a:

estrutura válida;
metadados obrigatórios;
competências definidas;
atividades referenciadas;
experiências existentes;
sequência válida;
avaliações associadas;
rastreabilidade de evidências;
ausência de dependências técnicas indevidas.

Esses testes poderão validar arquivos de configuração ou modelos declarativos.

17.17 Testes de Persistência

A camada de persistência deverá ser testada para:

criação;
leitura;
atualização;
exclusão;
consultas;
versionamento;
integridade;
concorrência;
falhas;
limites;
corrupção de dados;
recuperação;
limpeza.

Os testes deverão utilizar bancos temporários ou ambientes controlados.

17.18 Testes de Migração

Cada migração deverá possuir testes próprios.

O teste deverá verificar:

versão de origem;
versão de destino;
preservação dos dados;
transformação correta;
idempotência quando aplicável;
tratamento de estrutura inválida;
falha controlada;
registro da migração.

Migrações não testadas não deverão ser distribuídas.

17.19 Testes de Operações Atômicas

Operações relacionadas deverão ser verificadas quanto à atomicidade.

Exemplo:

Concluir atividade
├── salvar resposta
├── gerar evidência
├── atualizar progresso
└── registrar conclusão

Se uma etapa falhar, o sistema não deverá produzir estado parcial inconsistente.

17.20 Testes Offline

A estratégia Offline First exige testes específicos.

Deverão ser verificados:

carregamento sem rede;
acesso a recursos armazenados;
execução de atividades;
persistência local;
retomada;
fila de sincronização;
reconexão;
conflito;
atualização de cache;
indisponibilidade de API;
expiração de conteúdo.
17.21 Cenários de Conectividade

Os testes deverão simular:

conexão estável;
ausência total de rede;
rede lenta;
perda durante operação;
reconexão;
resposta parcial;
tempo limite;
serviço remoto indisponível;
resposta inválida.

A experiência do usuário deverá permanecer coerente em cada cenário.

17.22 Testes do Service Worker

Quando adotado, o Service Worker deverá ser testado para:

instalação;
ativação;
atualização;
cache inicial;
invalidação;
recuperação de recurso;
navegação offline;
remoção de caches antigos;
falha de atualização;
coexistência entre versões.

Atualizações não deverão eliminar dados persistentes do usuário.

17.23 Testes de Sincronização

A sincronização deverá ser testada para:

envio de registros pendentes;
confirmação;
repetição segura;
duplicidade;
falha parcial;
conflito;
ordem de operações;
perda de conexão;
reprocessamento;
resposta inválida.

Operações repetidas não deverão duplicar registros quando o processo exigir idempotência.

17.24 Testes de Segurança

Os testes de segurança deverão incluir:

permissões de plugins;
acesso não autorizado;
manipulação de metadados;
entrada maliciosa;
HTML não sanitizado;
tentativa de acesso direto à persistência;
comunicação externa não declarada;
exposição de tokens;
sessão expirada;
dependências vulneráveis;
alteração indevida do estado global.
17.25 Testes de Isolamento de Plugins

Deverá ser verificado que um plugin não consegue:

importar outro plugin diretamente;
acessar dados privados de outro;
registrar eventos não autorizados;
alterar o estado global sem serviço autorizado;
montar interface fora do contêiner concedido;
permanecer ativo após descarte;
manter listeners ou timers residuais.
17.26 Testes de Autorização

As regras de autorização deverão ser verificadas no serviço responsável.

Exemplos:

estudante não acessa funções administrativas;
docente visualiza apenas turmas autorizadas;
usuário anônimo não sincroniza dados identificados;
plugin sem permissão não grava dados;
Integration Plugin não acessa serviço não declarado.

A simples ocultação de elementos visuais não será considerada teste de autorização.

17.27 Testes de Acessibilidade

A acessibilidade deverá ser verificada por automação e revisão manual.

Os testes deverão contemplar:

semântica;
ordem de foco;
navegação por teclado;
rótulos;
contraste;
textos alternativos;
mensagens de erro;
regiões dinâmicas;
responsividade;
leitores de tela.

Ferramentas automáticas não substituem validação humana.

17.28 Testes de Usabilidade

Os testes de usabilidade deverão avaliar:

clareza da navegação;
compreensão das instruções;
previsibilidade;
feedback;
recuperação de erro;
carga cognitiva;
consistência;
conclusão de tarefas.

Esses testes poderão envolver usuários representativos.

17.29 Testes de Desempenho

Os testes de desempenho deverão avaliar:

inicialização;
carregamento de módulos;
carregamento de plugins;
resposta da interface;
persistência;
volume de dados;
consumo de memória;
tamanho do pacote;
operação em dispositivos limitados;
sincronização.

As medições deverão utilizar cenários e limites definidos.

17.30 Testes de Carga

Quando a plataforma incorporar serviços remotos, deverão ser considerados testes de carga para:

autenticação;
sincronização;
relatórios;
analytics;
distribuição de conteúdos;
integrações institucionais.

Esses testes não são prioritários para uma versão exclusivamente local, mas deverão fazer parte da evolução.

17.31 Testes de Compatibilidade

A compatibilidade deverá ser testada em:

navegadores suportados;
diferentes resoluções;
dispositivos móveis;
sistemas operacionais;
ambientes institucionais;
versões de dados;
versões de plugins.

A matriz de compatibilidade deverá ser documentada.

17.32 Testes de Ponta a Ponta

Os testes de ponta a ponta deverão cobrir apenas fluxos críticos.

Exemplos:

Abrir plataforma
↓
Selecionar módulo
↓
Iniciar experiência
↓
Executar atividade
↓
Salvar evidência
↓
Concluir
↓
Consultar progresso

Também deverão existir cenários para:

retomada;
operação offline;
falha de plugin;
sincronização;
atualização da aplicação.
17.33 Testes de Regressão

Toda correção de defeito deverá, quando viável, gerar um teste que impeça sua recorrência.

A suíte de regressão deverá ser executada:

em pull requests;
antes de releases;
após alterações de dependências;
após migrações;
após mudanças no Core;
após alterações no Plugin Manager.
17.34 Testes Exploratórios

Testes automatizados não cobrem todos os comportamentos possíveis.

Testes exploratórios deverão ser utilizados para:

experiências novas;
fluxos complexos;
problemas de interface;
acessibilidade;
combinações inesperadas;
cenários pedagógicos;
comportamento em dispositivos reais.

Os resultados relevantes deverão ser registrados.

17.35 Testes de Aceitação

A aceitação técnica deverá verificar se a funcionalidade atende:

critérios definidos;
contratos;
requisitos;
segurança;
qualidade;
documentação.

A aceitação não deverá se limitar à ausência de erros aparentes.

17.36 Testes de Aceitação Pedagógica

Atividades e experiências deverão passar por avaliação pedagógica.

Essa avaliação deverá verificar:

alinhamento com competências;
clareza dos objetivos;
adequação da atividade;
coerência da avaliação;
qualidade do feedback;
produção de evidências;
adequação ao público;
acessibilidade didática.
17.37 Validação com Usuários

Sempre que possível, experiências relevantes deverão ser validadas com:

estudantes;
docentes;
especialistas de conteúdo;
equipe pedagógica;
usuários com necessidades de acessibilidade.

A observação do uso real poderá revelar problemas não identificados em testes técnicos.

17.38 Dados de Teste

Os dados utilizados deverão ser:

controlados;
reproduzíveis;
não sensíveis;
representativos;
versionados quando necessário.

Dados reais identificáveis não deverão ser utilizados sem justificativa e proteção adequadas.

17.39 Ambientes de Teste

A plataforma poderá utilizar diferentes ambientes.

Ambiente Finalidade
Local Desenvolvimento
Teste Execução automatizada
Homologação Validação integrada
Produção Uso final

Os ambientes deverão manter configurações separadas.

17.40 Dublês de Teste

A estratégia poderá utilizar:

stubs;
mocks;
fakes;
spies;
simuladores.

Esses recursos deverão ser aplicados de forma criteriosa.

Testes excessivamente baseados em mocks podem verificar implementação, e não comportamento.

17.41 Cobertura de Testes

A cobertura deverá ser utilizada como indicador auxiliar.

Poderão ser acompanhadas:

cobertura de linhas;
funções;
ramos;
contratos;
fluxos críticos;
regras arquiteturais.

Uma porcentagem elevada não garante qualidade.

A prioridade deverá recair sobre comportamentos relevantes e riscos.

17.42 Priorização Baseada em Risco

Os testes deverão ser priorizados conforme risco.

Componentes de maior criticidade incluem:

Core;
Plugin Manager;
persistência;
migrações;
sincronização;
autenticação;
autorização;
evidências pedagógicas;
atualização offline.

Quanto maior o impacto de uma falha, maior deverá ser o rigor da validação.

17.43 Automação no Pipeline

O pipeline de integração contínua deverá executar, no mínimo:

Instalação controlada
↓
Lint
↓
Type checking
↓
Testes unitários
↓
Testes de integração
↓
Validação arquitetural
↓
Build
↓
Testes de segurança

Testes adicionais poderão ser executados em releases ou rotinas agendadas.

17.44 Testes em Pull Requests

Toda alteração relevante deverá ser verificada antes da integração.

O processo deverá confirmar:

testes existentes aprovados;
novos comportamentos testados;
ausência de regressão;
contratos preservados;
documentação atualizada;
qualidade mínima atendida.
17.45 Critérios de Bloqueio

Uma alteração não deverá ser integrada quando houver:

erro de compilação;
falha em teste obrigatório;
violação arquitetural crítica;
vulnerabilidade crítica;
migração não validada;
incompatibilidade de contrato;
build de produção inválido;
regressão em fluxo essencial.
17.46 Relatórios de Teste

A automação deverá produzir informações suficientes para diagnóstico.

Os relatórios poderão incluir:

suíte;
cenário;
duração;
resultado;
mensagem;
evidência;
ambiente;
versão;
artefatos de falha.

Capturas e registros não deverão expor dados sensíveis.

17.47 Responsabilidades
Elemento Responsabilidade
Desenvolvedor Criar e manter testes técnicos
Autor de plugin Demonstrar conformidade
Equipe pedagógica Validar experiências
Revisores Avaliar cobertura e risco
CI/CD Executar testes automatizados
Arquitetura Definir regras verificáveis
Segurança Avaliar cenários críticos
Usuários-piloto Validar uso real
17.48 Matriz de Testes por Componente
Componente Testes prioritários
Core Unitários, integração, segurança e regressão
Plugin Manager Contrato, ciclo de vida, isolamento e falhas
Tool Plugin Contrato, componente, acessibilidade e descarte
Experience Plugin Fluxo, composição, persistência e evidência
Integration Plugin Contrato, falhas, segurança e idempotência
Persistência CRUD, migração, atomicidade e recuperação
Interface Componente, acessibilidade, responsividade e E2E
Módulo pedagógico Estrutura, rastreabilidade e aceitação pedagógica
17.49 Estratégia Inicial

Na primeira fase do projeto, deverão ser priorizados:

testes unitários do Core;
testes de contrato dos plugins;
testes do ciclo de vida;
testes da camada de persistência;
testes das migrações;
testes de operação offline;
testes dos fluxos essenciais;
validação arquitetural de dependências.

A estratégia poderá se tornar mais ampla conforme a plataforma amadurecer.

17.50 Evolução

A estratégia de testes deverá evoluir com a arquitetura.

Poderão ser incorporados futuramente:

testes visuais;
testes de mutação;
testes de contrato entre cliente e servidor;
testes de caos;
ambientes efêmeros;
testes em múltiplos dispositivos;
validação automática de plugins;
testes de carga institucional;
telemetria de qualidade em produção.

Alterações significativas na estratégia, nas ferramentas ou nos critérios de bloqueio deverão ser registradas em um Architecture Decision Record (ADR).

Modelo conceitual
Requisito ou Risco
│
▼
Nível de Teste
│
▼
Cenário
│
▼
Execução
│
▼
Evidência
│
▼
Critério de Aceitação
Quadro-resumo
Dimensão Diretriz
Unidade Comportamentos isolados
Contrato Conformidade entre abstração e implementação
Integração Colaboração entre componentes
Plugin Ciclo de vida, permissões e isolamento
Persistência Integridade, migração e recuperação
Offline Continuidade e sincronização
Segurança Ataques, acessos e exposição
Acessibilidade Automação e validação humana
Desempenho Limites e cenários representativos
E2E Fluxos críticos
Pedagogia Alinhamento, evidência e adequação
CI/CD Execução automática e bloqueio

18. Implantação e Distribuição

A arquitetura de implantação e distribuição do LabInspeção_UniSENAI define como a plataforma será construída, versionada, validada, publicada, atualizada e disponibilizada aos usuários.

Seu objetivo é garantir que o processo de entrega seja reproduzível, rastreável, seguro e compatível com a estratégia de Progressive Web App — PWA e com a operação Offline First.

A implantação não deverá ser tratada como uma atividade isolada ao final do desenvolvimento. Ela integra a arquitetura da plataforma e deverá ser considerada desde a organização do código, a gestão de configurações e a definição dos ambientes.

18.1 Objetivos

A arquitetura de implantação e distribuição possui os seguintes objetivos:

produzir artefatos de build reproduzíveis;
separar os ambientes de desenvolvimento, teste, homologação e produção;
automatizar verificações antes da publicação;
assegurar rastreabilidade entre código, versão e artefato distribuído;
permitir publicação estática quando aplicável;
suportar instalação como PWA;
preservar funcionamento offline;
controlar atualizações;
reduzir riscos de regressão;
facilitar reversão;
preparar a plataforma para futuras integrações e serviços remotos.
18.2 Princípios

A implantação deverá observar os seguintes princípios.

Automação

Tarefas repetitivas e críticas deverão ser automatizadas.

Isso inclui:

instalação de dependências;
checagem de tipos;
testes;
validação arquitetural;
build;
geração de artefatos;
publicação;
registro de versão.
Reprodutibilidade

O mesmo código-fonte, com as mesmas dependências e configurações, deverá produzir artefatos equivalentes.

Para isso, deverão ser utilizados:

versões controladas de dependências;
arquivos de lock;
scripts padronizados;
variáveis de ambiente documentadas;
configuração de build versionada;
ambiente de execução definido.
Imutabilidade dos Artefatos

Um artefato de release publicado não deverá ser alterado silenciosamente.

Correções deverão gerar nova versão e novo artefato.

Separação entre Build e Configuração

O artefato deverá conter apenas configurações públicas e compatíveis com distribuição client-side.

Segredos, credenciais privadas e configurações sensíveis não deverão ser incorporados ao build.

Entrega Gradual

Alterações relevantes deverão avançar por etapas controladas:

Desenvolvimento
↓
Integração
↓
Homologação
↓
Produção

A publicação direta em produção deverá ser evitada.

18.3 Ambientes

A plataforma poderá utilizar os seguintes ambientes:

Ambiente Finalidade
Desenvolvimento local Implementação e depuração
Integração contínua Validação automatizada
Homologação Testes integrados e aceitação
Produção Uso final
Pré-visualização Avaliação de branches ou pull requests

Cada ambiente deverá possuir configuração própria, sem misturar dados, credenciais ou endpoints.

18.4 Ambiente de Desenvolvimento

O ambiente local deverá permitir:

inicialização rápida;
recarregamento durante alterações;
logs detalhados;
uso de dados simulados;
substituição de integrações externas;
execução isolada de plugins;
testes automatizados;
simulação de operação offline.

O comportamento local deverá permanecer suficientemente próximo do build de produção para evitar divergências relevantes.

18.5 Ambiente de Homologação

O ambiente de homologação deverá reproduzir, tanto quanto possível, as condições de produção.

Deverá ser utilizado para:

validar releases;
testar PWA;
testar cache e atualizações;
verificar compatibilidade de plugins;
testar persistência e migrações;
executar testes de aceitação;
realizar validação pedagógica;
verificar integrações institucionais.

Dados utilizados nesse ambiente deverão ser não sensíveis ou devidamente anonimizados.

18.6 Ambiente de Produção

O ambiente de produção deverá conter apenas artefatos validados.

Deverá possuir:

versão identificável;
configuração controlada;
publicação rastreável;
monitoramento apropriado;
política de atualização;
mecanismo de reversão;
documentação de release.

Não deverão ser ativados recursos experimentais sem controle explícito.

18.7 Configuração por Ambiente

As configurações deverão ser separadas conforme o ambiente.

Exemplos:

endereço de API;
nível de log;
ativação de recursos;
origem de conteúdos;
integração com LMS;
parâmetros de sincronização;
identificadores públicos de aplicação.

As configurações deverão ser validadas antes da execução.

Exemplo conceitual:

interface AppConfig {
environment: "development" | "test" | "staging" | "production";
apiBaseUrl?: string;
enableOffline: boolean;
enableTelemetry: boolean;
logLevel: "debug" | "info" | "warning" | "error";
}
18.8 Variáveis de Ambiente

Variáveis de ambiente poderão ser utilizadas para diferenciar configurações públicas entre builds.

Entretanto, em aplicações client-side, seu conteúdo deverá ser considerado visível ao usuário.

Por essa razão, não deverão conter:

senhas;
chaves privadas;
tokens permanentes;
segredos de integração;
credenciais administrativas.
18.9 Processo de Build

O build deverá transformar o código-fonte em artefatos otimizados para distribuição.

O fluxo conceitual será:

Código-fonte
↓
Instalação controlada
↓
Validação
↓
Compilação
↓
Empacotamento
↓
Otimização
↓
Geração do artefato

O processo deverá falhar quando forem detectados erros críticos.

18.10 Etapas Mínimas do Build

O pipeline de build deverá incluir, no mínimo:

instalação baseada em arquivo de lock;
checagem de tipos;
lint;
testes obrigatórios;
validação arquitetural;
build de produção;
validação do artefato;
geração de metadados da versão.
18.11 Otimização do Artefato

O build de produção deverá considerar:

minificação;
remoção de código não utilizado;
divisão de pacotes;
carregamento sob demanda;
compressão;
otimização de imagens;
controle de source maps;
versionamento de arquivos estáticos;
geração de manifesto PWA.

As otimizações não deverão comprometer depuração, acessibilidade ou compatibilidade.

18.12 Divisão de Pacotes

A aplicação deverá evitar concentrar todo o código em um único pacote inicial.

Poderão ser separados:

Core;
interface essencial;
módulos;
Tool Plugins;
Experience Plugins;
Integration Plugins;
bibliotecas pesadas;
recursos pedagógicos.

Essa divisão favorece carregamento sob demanda e reduz o custo inicial.

18.13 Artefatos de Distribuição

O build poderá gerar:

arquivos HTML;
JavaScript;
CSS;
manifesto da aplicação;
Service Worker;
imagens;
fontes permitidas;
metadados;
mapas de código, quando autorizados;
arquivo de versão.

O conjunto deverá ser suficiente para hospedagem estática, salvo quando houver serviços remotos adicionais.

18.14 Hospedagem Estática

A versão inicial da plataforma poderá ser distribuída por hospedagem estática.

Essa abordagem é compatível com:

Vite;
PWA;
GitHub Pages;
servidores institucionais;
serviços de hospedagem de arquivos estáticos;
redes internas.

A hospedagem estática reduz complexidade operacional, mas não suporta sozinha operações que exijam backend seguro.

18.15 GitHub Pages

O GitHub Pages poderá ser utilizado para versões demonstrativas, acadêmicas, de homologação ou produção de baixo risco.

A configuração deverá considerar:

caminho-base do repositório;
roteamento de Single Page Application;
URLs relativas;
HTTPS;
cache;
publicação por workflow;
branch ou artefato de origem;
domínio personalizado, quando aplicável.

Exemplo conceitual de caminho-base:

export default defineConfig({
base: "/LabInspecao_UniSENAI/"
});

O valor deverá corresponder ao caminho real de publicação.

18.16 Roteamento em Hospedagem Estática

Aplicações com roteamento no cliente deverão tratar adequadamente acessos diretos a rotas internas.

Possíveis estratégias incluem:

uso de hash routing;
página de fallback;
redirecionamento controlado;
configuração específica do servidor.

A estratégia deverá ser definida de forma compatível com o ambiente de hospedagem.

18.17 Progressive Web App

A plataforma deverá ser distribuível como PWA quando os requisitos técnicos estiverem atendidos.

A PWA deverá possuir:

manifesto válido;
ícones;
nome da aplicação;
cor temática;
modo de exibição;
URL inicial;
escopo;
Service Worker;
origem segura;
política de atualização.

A instalação não deverá ser requisito para uso da versão web.

18.18 Manifesto da Aplicação

O manifesto deverá definir, no mínimo:

nome;
nome curto;
descrição;
ícones;
URL inicial;
escopo;
modo de exibição;
cor de fundo;
cor de tema;
orientação, quando necessária.

Essas informações deverão permanecer consistentes com a identidade visual da plataforma.

18.19 Service Worker

O Service Worker será responsável por capacidades como:

cache de recursos;
navegação offline;
atualização controlada;
remoção de caches antigos;
interceptação de requisições;
recuperação de recursos.

Sua implementação deverá permanecer separada da persistência de dados pedagógicos.

18.20 Estratégias de Cache

As estratégias de cache deverão variar conforme o tipo de recurso.

Tipo de recurso Estratégia possível
Arquivos essenciais Cache First
Conteúdo atualizável Stale While Revalidate
APIs críticas Network First com fallback
Dados pedagógicos Persistência estruturada
Recursos versionados Cache imutável

A estratégia deverá ser escolhida de acordo com atualização, criticidade e disponibilidade.

18.21 Precaching

Recursos essenciais poderão ser armazenados durante a instalação do Service Worker.

Exemplos:

shell da aplicação;
CSS principal;
JavaScript essencial;
ícones;
página de fallback;
configuração mínima.

O precache não deverá incluir indiscriminadamente todos os módulos e plugins.

18.22 Atualização da PWA

A atualização de uma PWA deverá ser controlada para evitar:

coexistência inconsistente de versões;
interrupção de atividades;
perda de estado;
incompatibilidade com dados persistidos;
carregamento parcial de recursos.

O fluxo recomendado será:

Nova versão detectada
↓
Download em segundo plano
↓
Validação
↓
Notificação ao usuário
↓
Ativação em momento seguro
↓
Migração, se necessária
18.23 Política de Atualização

A plataforma poderá adotar diferentes políticas:

atualização automática imediata;
atualização automática após reinício;
solicitação ao usuário;
atualização obrigatória;
atualização adiada durante atividade.

A política deverá considerar o risco de interromper uma experiência pedagógica em andamento.

18.24 Compatibilidade entre Versão e Dados

Antes da ativação de uma nova versão, deverá ser verificada a compatibilidade com dados persistidos.

Quando houver migração:

ela deverá ser validada;
deverá ocorrer em momento controlado;
falhas deverão ser tratadas;
dados não deverão ser descartados silenciosamente;
a versão anterior deverá poder ser preservada quando viável.
18.25 Versionamento da Aplicação

A aplicação deverá adotar versionamento semântico quando adequado.

Formato:

MAJOR.MINOR.PATCH

Exemplo:

1.4.2

Interpretação:

MAJOR: alteração incompatível;
MINOR: nova funcionalidade compatível;
PATCH: correção compatível.

Versões prévias poderão utilizar identificadores como:

0.3.0-alpha.2
18.26 Versionamento Independente

A arquitetura deverá distinguir:

versão da aplicação;
versão do Core;
versão do contrato de plugins;
versão dos plugins;
versão dos módulos;
versão do esquema de dados;
versão dos conteúdos pedagógicos.

Essas versões poderão evoluir em ritmos diferentes.

18.27 Identificação da Versão

A versão em execução deverá poder ser consultada.

Poderá incluir:

versão semântica;
hash do commit;
data do build;
ambiente;
versão do contrato;
versão do esquema de dados.

Exemplo:

interface BuildInfo {
version: string;
commit: string;
builtAt: string;
environment: string;
}
18.28 Releases

Cada release deverá possuir:

identificador;
artefato;
commit de origem;
notas de versão;
mudanças relevantes;
incompatibilidades;
migrações;
riscos conhecidos;
procedimento de reversão.

Releases não deverão depender exclusivamente do histórico informal de commits.

18.29 Notas de Versão

As notas deverão informar, conforme aplicável:

novas funcionalidades;
correções;
alterações de arquitetura;
mudanças de contratos;
atualizações de plugins;
migrações de dados;
limitações;
riscos;
instruções de atualização.

A linguagem deverá ser adequada ao público destinatário.

18.30 Estratégia de Branches

O repositório poderá adotar uma estratégia compatível com o porte da equipe.

Exemplo:

main: versão estável;
branches de funcionalidade;
branches de correção;
branches de release, se necessárias;
tags para releases.

A estratégia deverá evitar branches de longa duração sem integração frequente.

18.31 Pull Requests

Alterações deverão ser integradas por meio de pull requests sempre que possível.

Cada pull request deverá permitir avaliar:

objetivo;
impacto;
testes;
documentação;
risco;
dependências;
necessidade de ADR;
compatibilidade;
efeito pedagógico.
18.32 Integração Contínua

A integração contínua deverá validar cada alteração antes da incorporação à branch principal.

Fluxo mínimo:

Pull Request
↓
Instalação
↓
Lint
↓
Type checking
↓
Testes
↓
Validação arquitetural
↓
Build
↓
Relatório

Falhas críticas deverão bloquear a integração.

18.33 Entrega Contínua

A entrega contínua deverá manter a aplicação em condição permanente de publicação.

Isso significa que:

a branch estável permanece validada;
o build é reproduzível;
os artefatos são gerados automaticamente;
a publicação pode ocorrer de forma controlada.

Entrega contínua não implica publicação automática irrestrita em produção.

18.34 Implantação Contínua

A implantação contínua poderá ser adotada em ambientes de baixo risco, como pré-visualização ou homologação.

Para produção, deverá ser avaliada conforme:

criticidade;
maturidade dos testes;
risco de migração;
dependência institucional;
necessidade de aprovação humana.
18.35 Workflows de Publicação

A publicação poderá ser acionada por:

merge na branch principal;
criação de tag;
release aprovada;
execução manual autorizada.

O gatilho deverá ser documentado e protegido.

18.36 Publicação no GitHub Pages

Um fluxo possível será:

Tag ou merge aprovado
↓
Execução do workflow
↓
Instalação de dependências
↓
Testes
↓
Build
↓
Upload do artefato
↓
Publicação no GitHub Pages

A publicação deverá utilizar o artefato validado no próprio pipeline.

18.37 Pré-visualização de Alterações

Branches ou pull requests poderão gerar ambientes temporários de visualização.

Esses ambientes facilitam:

revisão de interface;
validação pedagógica;
teste de plugins;
demonstração;
aceitação antes do merge.

Ambientes temporários não deverão utilizar dados de produção.

18.38 Feature Flags

Funcionalidades em desenvolvimento poderão ser controladas por feature flags.

Elas permitem:

ativação gradual;
teste em grupos específicos;
desativação rápida;
separação entre deploy e release;
redução de risco.

Feature flags temporárias deverão possuir prazo de remoção.

18.39 Reversão

A arquitetura deverá prever reversão quando uma publicação causar falha crítica.

A reversão poderá envolver:

republicação da versão anterior;
desativação de feature flag;
restauração de configuração;
desativação de plugin;
bloqueio de atualização.

A reversão de código não deverá presumir automaticamente reversão de dados.

18.40 Rollback de Dados

Migrações de dados exigem tratamento específico.

Quando a reversão completa não for viável, deverão existir estratégias como:

backup;
migração compensatória;
leitura compatível com versão anterior;
preservação do formato original;
recuperação assistida.

Migrações destrutivas deverão ser evitadas.

18.41 Disponibilidade Durante Atualizações

Atualizações deverão preservar a continuidade de uso sempre que possível.

Em hospedagem estática, a publicação de novos arquivos não deverá invalidar prematuramente recursos ainda utilizados por sessões abertas.

Arquivos versionados por hash auxiliam a coexistência temporária de versões.

18.42 Segurança do Pipeline

O pipeline de implantação deverá ser protegido.

Deverão ser considerados:

permissões mínimas;
proteção de branches;
revisão obrigatória;
controle de secrets;
restrição de workflows;
dependências confiáveis;
logs de execução;
atualização de actions;
validação dos artefatos.
18.43 Gestão de Secrets

Quando necessários em workflows, secrets deverão ser armazenados no mecanismo seguro da plataforma de CI/CD.

Não deverão:

aparecer em logs;
ser gravados no repositório;
ser incorporados ao build client-side;
ser compartilhados entre ambientes sem necessidade;
possuir permissões excessivas.
18.44 Integridade da Cadeia de Suprimentos

A distribuição deverá considerar riscos de dependências e automações externas.

Controles possíveis:

lockfile;
versões fixadas;
revisão de atualizações;
análise de vulnerabilidades;
verificação de licenças;
minimização de dependências;
assinatura de releases;
inventário de componentes.
18.45 Source Maps

Source maps poderão facilitar diagnóstico, mas também expor detalhes do código.

Sua publicação deverá ser definida conforme o ambiente:

desenvolvimento: habilitados;
homologação: controlados;
produção: privados, restritos ou desabilitados, conforme risco.

A decisão deverá equilibrar observabilidade e exposição.

18.46 Domínio e HTTPS

A PWA deverá ser servida por origem segura.

Em produção, deverão ser considerados:

HTTPS;
domínio institucional;
certificado válido;
redirecionamento de HTTP;
política de origem;
cabeçalhos de segurança;
controle de cache.

O GitHub Pages fornece HTTPS para domínios suportados, mas ambientes institucionais deverão ser configurados explicitamente.

18.47 Cabeçalhos de Segurança

Quando o ambiente de hospedagem permitir, deverão ser configurados cabeçalhos como:

Content Security Policy;
X-Content-Type-Options;
Referrer-Policy;
Permissions-Policy;
proteção contra enquadramento indevido;
políticas de cache.

Em plataformas estáticas com controle limitado, essas restrições deverão ser consideradas na escolha da hospedagem.

18.48 Conteúdo e Recursos Externos

Recursos externos deverão ser minimizados.

Quando utilizados, deverão ser avaliados quanto a:

disponibilidade;
integridade;
privacidade;
licença;
compatibilidade offline;
risco de alteração;
impacto de desempenho.

Recursos essenciais não deverão depender de terceiros sem estratégia de fallback.

18.49 Distribuição de Plugins

Na fase inicial, plugins poderão ser incorporados ao mesmo build da plataforma e descobertos estaticamente.

Futuramente, poderão ser distribuídos separadamente, desde que existam mecanismos para:

validação;
compatibilidade;
assinatura;
permissões;
atualização;
rollback;
isolamento;
auditoria.

A distribuição dinâmica não deverá ser adotada antes da maturidade do modelo de segurança.

18.50 Catálogo de Plugins

Um catálogo futuro poderá registrar:

identificador;
nome;
categoria;
versão;
contrato requerido;
permissões;
autor;
origem;
integridade;
status de homologação;
data de publicação.

O catálogo não deverá permitir instalação automática de componentes não confiáveis.

18.51 Distribuição de Módulos Pedagógicos

Módulos poderão ser distribuídos separadamente da aplicação quando o modelo declarativo estiver estabilizado.

Nesse cenário, deverão existir:

esquema validável;
versão;
dependências de plugins;
metadados;
compatibilidade;
assinatura ou origem confiável;
política de atualização;
validação pedagógica.
18.52 Distribuição Offline Institucional

A plataforma poderá ser distribuída em ambientes com conectividade restrita por meio de:

servidor local;
rede interna;
pacote estático;
mídia institucional;
imagem pré-configurada;
kiosk;
dispositivo gerenciado.

Essa distribuição deverá preservar versionamento, integridade e mecanismo de atualização.

18.53 Instalação em Dispositivos Compartilhados

Em laboratórios ou salas de aula, a plataforma poderá operar em dispositivos compartilhados.

Nesse contexto, deverão ser definidas políticas para:

perfis;
limpeza de dados;
cache;
sessões;
atualização;
restauração do ambiente;
armazenamento local;
privacidade.
18.54 Telemetria de Implantação

A plataforma poderá registrar métricas técnicas de distribuição, como:

versão em uso;
falha de atualização;
tempo de carregamento;
erro de Service Worker;
incompatibilidade;
falha de migração.

Qualquer telemetria deverá respeitar os princípios de privacidade definidos na Seção 15.

18.55 Critérios de Liberação

Uma versão estará apta à publicação quando:

o build for concluído;
os testes obrigatórios forem aprovados;
não houver violação arquitetural crítica;
as migrações estiverem validadas;
os contratos permanecerem compatíveis;
as vulnerabilidades críticas estiverem tratadas;
a documentação estiver atualizada;
os fluxos essenciais forem verificados;
a versão estiver identificada;
o plano de reversão estiver definido.
18.56 Checklist de Release

O processo de release deverá verificar:

[ ] Versão atualizada
[ ] Changelog atualizado
[ ] Testes aprovados
[ ] Build validado
[ ] PWA verificada
[ ] Operação offline testada
[ ] Migrações testadas
[ ] Plugins compatíveis
[ ] Documentação atualizada
[ ] Segurança verificada
[ ] Artefato identificado
[ ] Rollback definido
18.57 Responsabilidades
Elemento Responsabilidade
Desenvolvedores Manter scripts e configurações
Arquitetura Definir padrões de implantação
CI/CD Automatizar validação e publicação
Revisores Avaliar risco e conformidade
Responsável pelo release Autorizar publicação
Equipe pedagógica Homologar alterações educacionais
Segurança Avaliar pipeline e distribuição
Operação Monitorar e recuperar versões
18.58 Estratégia Inicial Recomendada

Para a fase atual do LabInspeção_UniSENAI, recomenda-se:

aplicação estática construída com Vite;
publicação inicial no GitHub Pages;
descoberta estática de plugins;
execução de CI em pull requests;
publicação por workflow;
versionamento semântico;
geração de BuildInfo;
Service Worker controlado;
atualização da PWA mediante confirmação;
ausência de segredos no cliente;
release identificado por tag;
homologação antes da produção.

Essa estratégia reduz a complexidade operacional sem limitar a evolução futura.

18.59 Modelo Conceitual de Implantação
Repositório Git
│
▼
Pull Request
│
▼
Integração Contínua
│
├── Qualidade
├── Testes
├── Segurança
└── Build
│
▼
Artefato Versionado
│
┌──────┴──────┐
▼ ▼
Homologação Produção
│ │
└──────┬──────┘
▼
PWA / Navegador
18.60 Evolução

A arquitetura de implantação poderá evoluir para incorporar:

ambientes temporários por pull request;
assinatura de artefatos;
publicação institucional;
múltiplos canais de release;
distribuição separada de plugins;
catálogo de módulos;
backend seguro;
containers;
orquestração;
observabilidade centralizada;
implantação regional;
atualização gerenciada de dispositivos.

Mudanças que alterem o modelo de hospedagem, a cadeia de distribuição, a política de atualização ou o mecanismo de publicação deverão ser formalizadas por meio de um Architecture Decision Record — ADR.

Quadro-resumo
Dimensão Diretriz
Build Automatizado e reproduzível
Ambientes Separados por finalidade
Artefatos Imutáveis e identificáveis
Hospedagem Estática na fase inicial
GitHub Pages Publicação automatizada
PWA Instalação opcional e operação offline
Atualização Controlada e compatível com dados
Versionamento Semântico e independente por componente
CI Validação de todas as alterações
CD Entrega controlada
Segurança Pipeline protegido e sem segredos no cliente
Rollback Planejado antes da publicação
Plugins Distribuição estática inicialmente
Evolução Preparação para serviços e distribuição dinâmica

19. Governança Arquitetural

A governança arquitetural do LabInspeção_UniSENAI define como decisões estruturais serão propostas, analisadas, registradas, implementadas, verificadas e revisadas ao longo da evolução da plataforma.

Seu objetivo é preservar a coerência entre a arquitetura documentada e a implementação real, sem transformar a arquitetura em uma barreira burocrática ao desenvolvimento.

A governança deverá assegurar que mudanças relevantes sejam realizadas de forma consciente, rastreável e compatível com os objetivos técnicos e pedagógicos da plataforma.

19.1 Objetivos

A governança arquitetural possui os seguintes objetivos:

preservar os princípios arquiteturais estabelecidos;
manter alinhamento entre documentação e implementação;
tornar decisões relevantes rastreáveis;
reduzir divergências entre componentes;
controlar a evolução do Core e dos contratos;
estabelecer critérios para criação de módulos e plugins;
gerir exceções arquiteturais;
acompanhar dívida técnica e arquitetural;
apoiar decisões coletivas;
facilitar integração de novos colaboradores;
evitar mudanças estruturais implícitas;
garantir continuidade do projeto no longo prazo.
19.2 Princípios de Governança

A governança deverá observar os princípios apresentados a seguir.

Decisões Explícitas

Mudanças arquiteturais relevantes não deverão surgir apenas como consequência incidental de uma implementação.

Elas deverão ser identificadas, discutidas e registradas.

Rastreabilidade

Deverá ser possível compreender:

qual decisão foi tomada;
por que foi tomada;
quais alternativas foram consideradas;
quais consequências foram aceitas;
quem participou da decisão;
quando ela entrou em vigor;
quais componentes foram afetados.
Proporcionalidade

O nível de formalização deverá ser proporcional ao impacto da mudança.

Uma alteração local de interface não exige o mesmo processo de uma modificação no contrato de plugins.

Evolução Controlada

A arquitetura não deverá ser considerada imutável.

Ela poderá evoluir, desde que as mudanças sejam:

justificadas;
avaliadas;
documentadas;
testadas;
comunicadas;
implementadas de forma consistente.
Arquitetura como Responsabilidade Compartilhada

A preservação da arquitetura não será responsabilidade exclusiva de uma pessoa.

Desenvolvedores, autores de plugins, equipe pedagógica e revisores deverão contribuir para sua manutenção.

19.3 Escopo da Governança

A governança arquitetural deverá abranger, no mínimo:

Core;
Plugin Manager;
contratos;
módulos pedagógicos;
Tool Plugins;
Experience Plugins;
Integration Plugins;
persistência;
estado;
comunicação;
segurança;
testes;
implantação;
documentação;
dependências;
padrões de desenvolvimento;
evolução pedagógica da plataforma.
19.4 Níveis de Decisão

As decisões poderão ser classificadas conforme seu impacto.

Nível Tipo de decisão Exemplo
Local Restrita a um componente Nome de função interna
Técnica Afeta uma funcionalidade ou subsistema Escolha de biblioteca de validação
Arquitetural Afeta estrutura, contratos ou princípios Novo tipo de plugin
Estratégica Afeta direção de longo prazo Adoção de backend institucional
Pedagógico-arquitetural Afeta o modelo educacional da plataforma Alteração da relação entre módulo e experiência

Essa classificação deverá orientar o processo de análise e registro.

19.5 Decisões que Exigem ADR

Deverão ser registradas por meio de Architecture Decision Record — ADR as decisões que:

alterem princípios arquiteturais;
modifiquem fronteiras entre componentes;
introduzam nova categoria de plugin;
alterem contratos públicos;
modifiquem o ciclo de vida dos plugins;
introduzam nova tecnologia estrutural;
alterem o modelo de persistência;
modifiquem a estratégia de estado;
alterem o modelo de comunicação;
introduzam backend ou serviço remoto;
alterem autenticação ou autorização;
modifiquem a política de distribuição;
introduzam incompatibilidade;
alterem a estratégia Offline First;
estabeleçam exceção permanente;
substituam decisão arquitetural anterior.
19.6 Decisões que Normalmente Não Exigem ADR

Em geral, não exigirão ADR:

correções locais;
refatorações internas sem impacto de contrato;
ajustes visuais;
inclusão de testes;
melhoria de documentação;
renomeação interna;
otimização sem alteração de comportamento;
criação de componente que respeite padrão já estabelecido;
implementação de plugin conforme contratos existentes.

Entretanto, uma sequência de pequenas mudanças que produza impacto estrutural deverá ser tratada como decisão arquitetural.

19.7 Architecture Decision Records

Os ADRs constituem o mecanismo oficial para registrar decisões arquiteturais.

Eles deverão permanecer armazenados em:

docs/
└── architecture/
└── adr/

A numeração deverá ser sequencial e estável.

Exemplo:

ADR-004-plugin-lifecycle.md
ADR-005-state-management.md
ADR-006-persistence-strategy.md

Um ADR não deverá ser renumerado após publicação.

19.8 Estrutura de um ADR

Cada ADR deverá conter, no mínimo:

# ADR-XXX — Título da Decisão

## Status

Proposto | Aceito | Rejeitado | Substituído | Obsoleto

## Contexto

Descrição do problema e das condições que motivaram a decisão.

## Decisão

Descrição objetiva da solução adotada.

## Alternativas Consideradas

Alternativas avaliadas e motivos para não adoção.

## Consequências

Benefícios, custos, riscos e limitações.

## Impactos

Componentes, contratos, dados, documentação e testes afetados.

## Data

AAAA-MM-DD

Se necessário, poderão ser incluídos:

responsáveis;
referências;
plano de migração;
critérios de revisão;
ADR substituído;
exemplos de implementação.
19.9 Estados de um ADR

Um ADR poderá assumir os seguintes estados:

Estado Significado
Proposto Em análise
Aceito Decisão vigente
Rejeitado Avaliado e não adotado
Substituído Trocado por decisão posterior
Obsoleto Não aplicável à arquitetura atual

ADRs aceitos não deverão ser apagados quando deixarem de vigorar.

Eles deverão permanecer como registro histórico.

19.10 Substituição de ADR

Quando uma decisão anterior for modificada, um novo ADR deverá ser criado.

O novo documento deverá indicar:

qual ADR está sendo substituído;
por que a decisão anterior deixou de ser adequada;
quais impactos decorrem da mudança;
como ocorrerá a transição.

O ADR anterior deverá ser marcado como Substituído.

19.11 Fluxo de Decisão Arquitetural

O fluxo recomendado será:

Identificação do problema
↓
Análise do impacto
↓
Levantamento de alternativas
↓
Proposta de decisão
↓
Discussão e revisão
↓
Registro em ADR
↓
Implementação
↓
Verificação de conformidade
↓
Revisão posterior

A implementação não deverá preceder a decisão quando houver impacto estrutural significativo, salvo em protótipos explicitamente identificados.

19.12 Propostas Arquiteturais

Uma proposta deverá apresentar:

problema;
contexto;
motivação;
restrições;
alternativas;
solução recomendada;
impactos;
riscos;
estratégia de implementação;
estratégia de testes;
impacto pedagógico, quando aplicável.

Propostas sem problema claramente definido não deverão produzir alterações estruturais.

19.13 Critérios de Avaliação

Uma decisão arquitetural deverá ser analisada quanto a:

aderência aos objetivos da plataforma;
compatibilidade com os princípios;
impacto no Core;
acoplamento introduzido;
complexidade;
testabilidade;
segurança;
desempenho;
manutenção;
operação offline;
compatibilidade de dados;
acessibilidade;
impacto pedagógico;
custo de reversão;
sustentabilidade no longo prazo.
19.14 Papéis na Governança

A governança poderá envolver os seguintes papéis:

Papel Responsabilidade
Responsável pela arquitetura Coordenar decisões estruturais
Mantenedor do Core Proteger contratos e serviços centrais
Desenvolvedor Propor e implementar mudanças
Autor de plugin Garantir conformidade do plugin
Especialista pedagógico Validar impactos educacionais
Revisor Avaliar riscos, coerência e qualidade
Responsável por segurança Avaliar ameaças e permissões
Responsável pelo release Garantir prontidão para distribuição

Uma mesma pessoa poderá assumir mais de um papel em equipes pequenas.

19.15 Autoridade de Decisão

A autoridade deverá ser proporcional ao impacto da decisão.

Exemplo:

decisão local: responsável pelo componente;
decisão técnica: equipe de desenvolvimento;
decisão arquitetural: responsável pela arquitetura e revisores;
decisão pedagógico-arquitetural: equipe técnica e pedagógica;
decisão estratégica: responsáveis institucionais do projeto.

Decisões de alto impacto não deverão depender exclusivamente de conveniência momentânea de implementação.

19.16 Revisão Arquitetural

A revisão arquitetural deverá verificar se uma proposta ou implementação:

respeita as fronteiras definidas;
mantém a direção das dependências;
utiliza contratos adequados;
evita duplicação estrutural;
preserva isolamento;
mantém compatibilidade;
possui testes;
possui documentação;
trata falhas;
considera segurança;
mantém coerência pedagógica.
19.17 Momentos de Revisão

Revisões deverão ocorrer:

antes de alterações no Core;
antes de mudanças em contratos;
na criação de nova categoria de plugin;
durante pull requests de alto impacto;
antes de releases relevantes;
após incidentes;
ao identificar dívida arquitetural;
em revisões periódicas da plataforma.
19.18 Revisão em Pull Requests

Pull requests com impacto arquitetural deverão identificar explicitamente:

componentes afetados;
contratos alterados;
ADR relacionado;
estratégia de migração;
testes adicionados;
riscos;
impacto em plugins;
impacto em dados;
impacto pedagógico.

A ausência dessas informações deverá ser tratada como pendência de revisão.

19.19 Checklist de Revisão Arquitetural
[ ] A responsabilidade do componente está clara
[ ] A direção das dependências foi preservada
[ ] Não há comunicação direta entre plugins
[ ] O Core não depende de implementação concreta de plugin
[ ] O acesso ao estado ocorre pelos serviços definidos
[ ] O acesso à persistência ocorre por repositórios ou serviços
[ ] Integrações externas estão isoladas
[ ] O ciclo de vida foi respeitado
[ ] Os contratos permanecem compatíveis
[ ] Os erros são tratados
[ ] A operação offline foi considerada
[ ] A segurança foi avaliada
[ ] Os testes necessários foram incluídos
[ ] A documentação foi atualizada
[ ] O impacto pedagógico foi verificado
[ ] A necessidade de ADR foi avaliada
19.20 Governança do Core

O Core deverá possuir o nível mais rigoroso de governança.

Alterações no Core deverão:

possuir motivação explícita;
evitar necessidades específicas de um único plugin;
preservar generalidade;
ser acompanhadas por testes;
considerar compatibilidade;
possuir revisão arquitetural;
atualizar contratos e documentação;
gerar ADR quando alterarem comportamento estrutural.

O Core não deverá crescer apenas para acomodar conveniências locais.

19.21 Critérios para Inclusão de Serviço no Core

Um serviço poderá ser incluído no Core quando:

for necessário a múltiplos componentes;
representar responsabilidade transversal;
exigir controle central;
precisar de política uniforme;
não pertencer a um domínio específico;
possuir contrato estável;
contribuir para isolamento ou segurança.

Exemplos adequados:

gerenciamento de estado compartilhado;
persistência;
eventos;
ciclo de vida;
autorização;
logging;
configuração.
19.22 Critérios para Não Inclusão no Core

Uma funcionalidade não deverá ser incluída no Core quando:

atender apenas um módulo;
possuir significado pedagógico específico;
puder ser implementada como plugin;
depender de uma tecnologia externa específica;
representar integração isolada;
possuir ciclo de evolução independente;
aumentar excessivamente a responsabilidade central.
19.23 Governança dos Contratos

Contratos públicos deverão ser tratados como ativos arquiteturais.

Qualquer mudança deverá considerar:

compatibilidade retroativa;
impacto nos consumidores;
versão;
migração;
documentação;
testes de conformidade;
período de transição.

Contratos não deverão ser alterados silenciosamente.

19.24 Estabilidade dos Contratos

Um contrato deverá ser publicado apenas quando possuir:

responsabilidade definida;
nomenclatura consistente;
comportamento compreensível;
tratamento de erros;
limites conhecidos;
testes;
documentação;
estratégia de versionamento.

Contratos experimentais deverão ser identificados como instáveis.

19.25 Depreciação de Contratos

Quando um contrato precisar ser substituído, deverá existir processo de depreciação.

O processo deverá incluir:

Contrato vigente
↓
Contrato marcado como obsoleto
↓
Novo contrato disponibilizado
↓
Período de migração
↓
Remoção em versão compatível

A remoção imediata deverá ser reservada a falhas críticas de segurança ou integridade.

19.26 Governança de Plugins

Todo plugin deverá possuir:

identificador único;
categoria;
versão;
contrato requerido;
metadados;
permissões;
responsável;
documentação;
testes;
status de maturidade.

Plugins não deverão ser incorporados sem validação mínima.

19.27 Critérios para Criação de Tool Plugin

Uma funcionalidade deverá ser criada como Tool Plugin quando:

for tecnicamente reutilizável;
não contiver conhecimento pedagógico específico;
puder ser utilizada por diferentes experiências;
possuir interface clara;
possuir ciclo de vida independente;
não exigir acesso direto a outro plugin.

Exemplos:

gráfico;
quiz;
simulador genérico;
leitor de documentos;
editor;
calculadora.
19.28 Critérios para Criação de Experience Plugin

Uma funcionalidade deverá ser criada como Experience Plugin quando:

representar uma experiência de aprendizagem completa;
coordenar etapas pedagógicas;
compor Tool Plugins;
produzir evidências;
possuir estado de experiência;
possuir início, desenvolvimento e conclusão;
estiver associada a atividade ou módulo.
19.29 Critérios para Criação de Integration Plugin

Uma funcionalidade deverá ser criada como Integration Plugin quando:

acessar sistema externo;
encapsular protocolo ou API;
exigir transformação entre modelos;
tratar autenticação ou comunicação;
possuir falhas independentes;
puder ser substituída sem alterar o domínio interno.

Exemplos:

LMS;
Google Sheets;
API institucional;
serviço de IA;
sistema de analytics.
19.30 Aprovação de Plugins

A aprovação poderá considerar os seguintes estados:

Estado Significado
Experimental Em desenvolvimento
Alfa Estrutura inicial funcional
Beta Funcional, em validação
Homologado Aprovado para uso definido
Obsoleto Não recomendado para novos usos
Descontinuado Sem suporte ou removido

O status deverá ser visível nos metadados e na documentação.

19.31 Homologação Técnica de Plugins

A homologação técnica deverá verificar:

conformidade com contrato;
ciclo de vida;
permissões;
isolamento;
descarte de recursos;
tratamento de erros;
desempenho;
acessibilidade;
segurança;
compatibilidade;
testes;
documentação.
19.32 Homologação Pedagógica de Experience Plugins

Experience Plugins deverão passar também por avaliação pedagógica.

A homologação deverá verificar:

alinhamento com competências;
objetivos de aprendizagem;
adequação da experiência;
clareza das orientações;
qualidade do feedback;
produção de evidências;
coerência da avaliação;
acessibilidade didática;
adequação ao público.
19.33 Governança dos Módulos Pedagógicos

Cada módulo deverá possuir:

identificador;
versão;
título;
descrição;
competências;
objetivos;
conteúdos;
atividades;
avaliações;
evidências;
dependências de plugins;
responsável pedagógico;
status de homologação.

Módulos não deverão incorporar detalhes técnicos desnecessários.

19.34 Critérios para Aprovação de Módulo

Um módulo poderá ser aprovado quando:

possuir estrutura válida;
apresentar coerência pedagógica;
utilizar plugins homologados ou justificados;
possuir rastreabilidade;
possuir critérios de avaliação;
considerar acessibilidade;
possuir conteúdos revisados;
possuir versão;
possuir responsável;
ter sido testado em fluxo completo.
19.35 Governança da Documentação

A documentação deverá ser tratada como parte do produto.

Ela deverá permanecer:

versionada;
organizada;
revisada;
vinculada à implementação;
atualizada junto com as mudanças;
escrita para públicos definidos.

A estrutura principal será:

docs/
├── architecture/
│ ├── adr/
│ └── diagrams/
├── development/
├── pedagogy/
├── project/
└── user/
19.36 Tipos de Documentação
Diretório Finalidade
architecture Estrutura, princípios, ADRs e diagramas
development Instalação, padrões e implementação
pedagogy Modelo educacional, módulos e experiências
project Escopo, roadmap, decisões e gestão
user Orientações para usuários finais

Cada documento deverá ser armazenado na categoria correspondente à sua finalidade principal.

19.37 Sincronização entre Código e Documentação

Uma mudança deverá atualizar a documentação quando alterar:

comportamento público;
arquitetura;
contrato;
configuração;
procedimento;
experiência de usuário;
módulo pedagógico;
fluxo de implantação;
modelo de dados.

A documentação desatualizada deverá ser tratada como defeito do produto.

19.38 Diagramas Arquiteturais

Diagramas deverão:

possuir finalidade definida;
refletir a arquitetura vigente;
utilizar nomenclatura consistente;
indicar nível de abstração;
evitar detalhes desnecessários;
possuir fonte editável quando possível;
ser atualizados junto com mudanças estruturais.

Diagramas não deverão contradizer o texto normativo.

19.39 Fonte de Verdade

Quando houver divergência, deverá ser definida uma fonte de verdade.

Em geral:

ADR define a decisão;
SAD define a estrutura arquitetural vigente;
contrato define a interface pública;
código define o comportamento executável;
testes verificam o comportamento esperado;
documentação pedagógica define a intenção educacional.

A divergência entre esses elementos deverá ser corrigida.

19.40 Governança das Dependências

A introdução de uma dependência externa deverá considerar:

necessidade;
alternativas;
manutenção;
comunidade;
licença;
tamanho;
segurança;
compatibilidade;
impacto no build;
possibilidade de substituição.

Dependências não deverão ser adicionadas apenas para resolver problemas triviais.

19.41 Registro de Dependências Estruturais

Dependências com impacto arquitetural deverão ser registradas.

Exemplos:

framework principal;
biblioteca de persistência;
mecanismo de estado;
solução de PWA;
biblioteca de roteamento;
ferramenta de testes;
mecanismo de validação de esquemas.

A substituição dessas dependências poderá exigir ADR.

19.42 Atualização de Dependências

Atualizações deverão ser realizadas de forma controlada.

O processo deverá incluir:

leitura das mudanças;
análise de incompatibilidades;
testes;
build;
verificação de segurança;
avaliação do impacto;
plano de reversão.

Atualizações automáticas não deverão ser incorporadas sem validação.

19.43 Dívida Técnica

A dívida técnica deverá ser registrada em mecanismo rastreável.

Cada item deverá conter:

descrição;
origem;
impacto;
risco;
prioridade;
componente;
responsável;
plano de correção;
prazo ou condição de revisão.
19.44 Classificação da Dívida

A dívida poderá ser classificada como:

Categoria Exemplo
Código Duplicação ou complexidade
Testes Fluxo sem cobertura
Documentação Contrato não documentado
Dependência Biblioteca obsoleta
Dados Migração provisória
Segurança Permissão excessiva
Arquitetura Acoplamento indevido
Pedagogia Evidência sem rastreabilidade
19.45 Priorização da Dívida

A priorização deverá considerar:

risco;
impacto;
frequência de ocorrência;
custo crescente;
bloqueio de evolução;
segurança;
integridade dos dados;
impacto pedagógico.

Dívidas que afetem Core, contratos, segurança ou persistência deverão receber prioridade elevada.

19.46 Dívida Arquitetural

A dívida arquitetural deverá ser registrada separadamente quando comprometer:

modularidade;
fronteiras;
contratos;
escalabilidade;
testabilidade;
segurança;
persistência;
evolução do ecossistema.

Exemplos:

plugin acessando armazenamento diretamente;
Core contendo lógica pedagógica;
dependência circular;
interface manipulando estado interno;
integração externa espalhada pela aplicação.
19.47 Exceções Arquiteturais

Uma exceção arquitetural representa uma violação conhecida e temporariamente aceita.

Toda exceção deverá possuir:

justificativa;
escopo;
risco;
responsável;
prazo;
estratégia de correção;
critérios de encerramento.

Exceções não deverão se tornar permanentes por ausência de acompanhamento.

19.48 Registro de Exceções

O registro poderá conter:

## Exceção Arquitetural

- Regra afetada:
- Componente:
- Justificativa:
- Risco:
- Responsável:
- Data de criação:
- Data de revisão:
- Plano de correção:
- Status:

Exceções de alto impacto deverão ser associadas a issue ou ADR.

19.49 Revisão Periódica

A arquitetura deverá ser revisada periodicamente para verificar:

aderência da implementação;
validade dos princípios;
contratos obsoletos;
dívida acumulada;
dependências;
riscos;
evolução pedagógica;
adequação da documentação;
necessidade de novos ADRs.

A periodicidade poderá ser definida por ciclo de release ou marco do projeto.

19.50 Auditoria de Conformidade

A auditoria poderá combinar:

análise automatizada de dependências;
revisão de código;
validação de contratos;
verificação de documentação;
análise de plugins;
inspeção de persistência;
revisão de segurança;
avaliação pedagógica.

Os resultados deverão gerar ações concretas.

19.51 Indicadores de Governança

Poderão ser acompanhados indicadores como:

quantidade de ADRs pendentes;
tempo médio de decisão;
violações arquiteturais;
exceções abertas;
dívida crítica;
contratos obsoletos;
plugins não homologados;
documentação desatualizada;
dependências vulneráveis;
falhas de conformidade por release.

Esses indicadores deverão apoiar decisões, e não estimular formalização sem valor.

19.52 Gestão de Mudanças

Mudanças relevantes deverão possuir plano de transição.

O plano poderá incluir:

componentes afetados;
etapas;
migração;
compatibilidade;
testes;
comunicação;
atualização de documentação;
desativação de recursos antigos;
rollback.
19.53 Mudanças Incompatíveis

Mudanças incompatíveis deverão ser excepcionais e justificadas.

Elas deverão considerar:

aumento de versão principal;
período de transição;
suporte temporário;
migração;
atualização de plugins;
atualização de dados;
comunicação aos responsáveis;
plano de reversão.
19.54 Governança da Segurança

Decisões de segurança deverão ser revistas quando envolverem:

novos tipos de dados;
novas permissões;
integração externa;
autenticação;
autorização;
execução dinâmica;
distribuição de plugins;
armazenamento de credenciais;
telemetria.

A ausência de incidente não deverá ser interpretada como prova de segurança.

19.55 Governança Pedagógica

A governança pedagógica deverá assegurar que a evolução técnica não comprometa a finalidade educacional da plataforma.

Deverão ser preservados:

alinhamento curricular;
rastreabilidade;
adequação das atividades;
qualidade das evidências;
acessibilidade didática;
papel do docente;
clareza para o estudante;
possibilidade de revisão pedagógica.
19.56 Decisões Técnico-Pedagógicas

Decisões que afetem simultaneamente tecnologia e pedagogia deverão ser analisadas em conjunto.

Exemplos:

estrutura de uma atividade;
regras de progressão;
geração de feedback;
registro de evidências;
retomada de experiências;
uso de inteligência artificial;
critérios automatizados de avaliação.

Nenhuma dessas decisões deverá ser definida exclusivamente por conveniência técnica.

19.57 Uso de Inteligência Artificial

A eventual inclusão de recursos de inteligência artificial deverá exigir análise específica.

Deverão ser considerados:

finalidade pedagógica;
transparência;
privacidade;
segurança;
confiabilidade;
possibilidade de erro;
supervisão humana;
rastreabilidade;
custo;
dependência externa;
operação offline.

Integrações com IA deverão ocorrer por Integration Plugins.

19.58 Onboarding de Colaboradores

Novos colaboradores deverão receber orientação sobre:

arquitetura geral;
princípios;
estrutura do projeto;
taxonomia de plugins;
contratos;
fluxo de contribuição;
testes;
documentação;
ADRs;
critérios de revisão.

O onboarding deverá reduzir a dependência de conhecimento informal.

19.59 Processo de Contribuição

O fluxo recomendado será:

Issue ou necessidade
↓
Análise
↓
Branch de trabalho
↓
Implementação
↓
Testes
↓
Documentação
↓
Pull Request
↓
Revisão
↓
Integração

Mudanças estruturais deverão incluir ADR antes ou durante o pull request.

19.60 Definition of Done

Uma alteração poderá ser considerada concluída quando:

[ ] O comportamento foi implementado
[ ] Os critérios de aceitação foram atendidos
[ ] Os testes foram incluídos e aprovados
[ ] A arquitetura foi respeitada
[ ] A segurança foi avaliada
[ ] A acessibilidade foi considerada
[ ] A documentação foi atualizada
[ ] O ADR foi criado ou atualizado, quando necessário
[ ] A dívida residual foi registrada
[ ] O build foi validado
[ ] O impacto pedagógico foi analisado
19.61 Resolução de Divergências

Quando houver divergência sobre uma decisão, deverão ser utilizados:

objetivos da plataforma;
princípios arquiteturais;
evidências técnicas;
protótipos;
testes;
riscos;
impacto pedagógico;
custo de reversão.

A preferência pessoal por uma tecnologia não deverá constituir critério suficiente.

19.62 Provas de Conceito

Provas de conceito poderão ser utilizadas para reduzir incerteza.

Elas deverão:

possuir objetivo definido;
ter escopo limitado;
ser identificadas como experimentais;
não ser incorporadas automaticamente à produção;
produzir evidências para a decisão;
ser descartadas ou formalizadas após avaliação.

Código de prova de conceito não deverá se tornar parte permanente da plataforma sem revisão.

19.63 Registro Histórico

A governança deverá preservar o histórico de:

ADRs;
releases;
contratos;
migrações;
exceções;
decisões pedagógicas;
mudanças de arquitetura;
incidentes relevantes.

Esse histórico permite compreender por que a plataforma assumiu sua forma atual.

19.64 Modelo Conceitual de Governança
Princípios Arquiteturais
│
▼
Propostas de Mudança
│
▼
Análise e Decisão
│
▼
ADR ou Registro
│
▼
Implementação
│
▼
Testes e Revisão
│
▼
Conformidade
│
▼
Evolução Controlada
19.65 Estratégia Inicial Recomendada

Para a fase atual do LabInspeção_UniSENAI, recomenda-se:

manutenção do SAD como referência arquitetural;
uso obrigatório de ADRs para mudanças estruturais;
revisão de alterações no Core;
contratos versionados;
plugins inicialmente mantidos no mesmo repositório;
homologação técnica mínima para cada plugin;
validação pedagógica de Experience Plugins;
pull requests para integração;
checklist arquitetural;
registro explícito de dívida;
documentação atualizada no mesmo commit da mudança;
revisão arquitetural ao final de cada marco relevante.
19.66 Evolução

A governança poderá evoluir conforme o crescimento do projeto.

Poderão ser incorporados:

comitê arquitetural;
catálogo formal de plugins;
processo institucional de homologação;
portal de documentação;
automação de conformidade;
matriz de compatibilidade;
política de suporte;
programa de certificação de plugins;
registro formal de riscos;
governança de dados;
governança de inteligência artificial.

O processo deverá crescer apenas quando a complexidade real justificar maior formalização.

Quadro-resumo
Dimensão Diretriz
Decisões Explícitas e rastreáveis
ADRs Obrigatórios para mudanças estruturais
Core Governança reforçada
Contratos Estáveis, versionados e testados
Plugins Classificados, validados e homologados
Módulos Revisados técnica e pedagogicamente
Documentação Parte integrante da entrega
Dependências Avaliadas e controladas
Dívida Registrada e priorizada
Exceções Temporárias e acompanhadas
Pull requests Principal ponto de revisão
Segurança Avaliação transversal
Pedagogia Participação nas decisões relevantes
Evolução Controlada, mas não imobilizada

20. Roadmap Arquitetural

O roadmap arquitetural do LabInspeção_UniSENAI define a sequência planejada de evolução técnica e pedagógica da plataforma.

Seu objetivo é transformar a visão arquitetural descrita neste documento em uma trajetória executável, organizada por níveis de maturidade, capacidades, dependências, riscos e critérios de transição.

O roadmap não deverá ser interpretado como cronograma rígido. Ele representa uma orientação evolutiva baseada em dependências arquiteturais. Prazos, prioridades e escopo poderão ser ajustados conforme recursos disponíveis, resultados de validação e necessidades pedagógicas.

A evolução deverá ocorrer de forma incremental, evitando antecipar infraestruturas complexas antes que os contratos, componentes fundamentais e casos de uso estejam suficientemente estabilizados.

20.1 Objetivos

O roadmap arquitetural possui os seguintes objetivos:

orientar a evolução progressiva da plataforma;
estabelecer prioridades arquiteturais;
identificar dependências entre capacidades;
reduzir o risco de crescimento desordenado;
evitar implementação prematura de funcionalidades avançadas;
alinhar evolução técnica e pedagógica;
definir critérios objetivos de maturidade;
apoiar planejamento de releases;
orientar a criação de ADRs;
facilitar comunicação entre participantes do projeto;
preservar a coerência arquitetural ao longo do tempo.
20.2 Princípios do Roadmap

A evolução da plataforma deverá observar os princípios apresentados a seguir.

Arquitetura antes de Escala

A plataforma deverá estabilizar seus fundamentos antes de ampliar quantidade de módulos, plugins, usuários ou integrações.

Incrementos Utilizáveis

Cada fase deverá produzir uma versão funcional e verificável da plataforma.

Não deverão ser acumuladas grandes quantidades de infraestrutura sem aplicação concreta.

Complexidade Justificada

Novos mecanismos deverão ser incorporados apenas quando houver problema real que os justifique.

Exemplos:

backend não deverá ser criado apenas por possibilidade futura;
marketplace não deverá preceder um catálogo confiável;
carregamento remoto de plugins não deverá preceder segurança e homologação;
sincronização complexa não deverá preceder persistência local estável.
Contratos antes de Implementações Múltiplas

Antes da criação de várias implementações, os contratos correspondentes deverão estar suficientemente definidos e testados.

Validação Progressiva

Cada etapa deverá ser validada por:

testes técnicos;
revisão arquitetural;
uso real;
avaliação pedagógica;
análise dos riscos observados.
Compatibilidade Evolutiva

A evolução deverá preservar dados, módulos e plugins existentes sempre que tecnicamente viável.

Mudanças incompatíveis deverão ser planejadas e explicitamente versionadas.

20.3 Dimensões de Evolução

O roadmap considera a evolução simultânea de diferentes dimensões.

Evolução da Plataforma
│
├── Arquitetura do Core
├── Ecossistema de Plugins
├── Arquitetura Pedagógica
├── Persistência e Sincronização
├── Interface e Experiência
├── Segurança
├── Qualidade e Testes
├── Implantação
├── Integrações
└── Governança

O avanço em uma dimensão poderá depender da maturidade alcançada em outras.

20.4 Modelo de Maturidade

A evolução será organizada em seis estágios principais:

Estágio Denominação Resultado central
0 Fundação Arquitetural Estrutura, princípios e contratos iniciais
1 Núcleo Funcional Core mínimo e primeira experiência executável
2 Plataforma Modular Plugins e módulos operando por contratos estáveis
3 Plataforma Offline Confiável Persistência, PWA e recuperação consolidadas
4 Plataforma Integrada Integrações externas e sincronização controlada
5 Ecossistema Governado Distribuição independente, catálogo e governança ampliada

Os estágios não representam produtos inteiramente separados. Cada um amplia e estabiliza o anterior.

20.5 Visão Geral das Fases
Estágio 0
Fundação Arquitetural
↓
Estágio 1
Núcleo Funcional
↓
Estágio 2
Plataforma Modular
↓
Estágio 3
Offline Confiável
↓
Estágio 4
Plataforma Integrada
↓
Estágio 5
Ecossistema Governado

A transição deverá ocorrer apenas quando os critérios mínimos do estágio anterior estiverem atendidos.

20.6 Estágio 0 — Fundação Arquitetural

O Estágio 0 estabelece a base conceitual, documental e estrutural da plataforma.

Seu objetivo é reduzir ambiguidades antes da implementação extensiva.

Capacidades prioritárias
definição da visão da plataforma;
definição dos princípios arquiteturais;
distinção entre módulos e plugins;
taxonomia de plugins;
definição inicial do Core;
definição do ciclo de vida;
definição do modelo de comunicação;
definição da estratégia de estado;
definição da persistência;
definição da estratégia Offline First;
organização documental;
criação dos ADRs iniciais;
organização do repositório.
Entregas esperadas
Software Architecture Document;
estrutura inicial de diretórios;
convenções de documentação;
ADRs fundamentais;
contratos conceituais;
diagramas;
roadmap;
critérios de revisão;
backlog arquitetural inicial.
ADRs associados

Os seguintes ADRs já constituem parte dessa fundação:

ADR-000 — Convenções de Documentação;
ADR-001 — Adoção do Vite;
ADR-002 — Arquitetura Modular;
ADR-003 — Estratégia Offline First.

Outros ADRs deverão ser criados conforme as decisões passem do nível conceitual para contratos executáveis.

Riscos principais
excesso de documentação sem validação prática;
contratos definidos cedo demais;
abstrações sem caso de uso real;
divergência entre terminologia e implementação;
ampliação prematura do escopo.
Critérios de conclusão

O Estágio 0 poderá ser considerado concluído quando:

[ ] A arquitetura geral estiver documentada
[ ] A taxonomia de plugins estiver definida
[ ] O ciclo de vida estiver especificado
[ ] As fronteiras do Core estiverem descritas
[ ] O modelo de comunicação estiver definido
[ ] O modelo de estado estiver definido
[ ] A estratégia de persistência estiver definida
[ ] Os ADRs iniciais estiverem aceitos
[ ] A estrutura do repositório refletir a arquitetura
[ ] Existir um backlog técnico priorizado
20.7 Estágio 1 — Núcleo Funcional

O Estágio 1 deverá transformar os conceitos fundamentais em uma plataforma mínima executável.

Seu objetivo é validar a arquitetura por meio de um fluxo pedagógico completo, ainda que pequeno.

Capacidades prioritárias
inicialização do Core;
registro de serviços;
ciclo de vida básico da aplicação;
Plugin Manager inicial;
descoberta estática de plugins;
carregamento de um Experience Plugin;
uso de pelo menos um Tool Plugin;
estado em memória;
comunicação por eventos;
roteamento básico;
tratamento padronizado de erros;
primeira atividade pedagógica funcional.
Fluxo mínimo esperado
Inicialização da aplicação
↓
Carregamento do Core
↓
Registro do Plugin Manager
↓
Descoberta estática
↓
Seleção de módulo
↓
Carregamento da experiência
↓
Execução da atividade
↓
Geração de resultado
Escopo recomendado

A primeira versão funcional deverá conter apenas:

um módulo pedagógico;
uma atividade;
um Experience Plugin;
um ou dois Tool Plugins;
persistência limitada ou simulada;
interface mínima;
ausência de integração externa obrigatória.

Essa limitação permitirá testar os fundamentos sem dispersão.

Componentes prioritários
src/
├── core/
│ ├── bootstrap/
│ ├── lifecycle/
│ ├── events/
│ ├── state/
│ ├── errors/
│ └── plugins/
├── contracts/
├── plugins/
├── modules/
├── ui/
└── tests/

A estrutura definitiva poderá ser ajustada por ADR e pela implementação real.

Testes prioritários
inicialização do Core;
registro de serviços;
descoberta de plugins;
ciclo de vida;
montagem e desmontagem;
descarte;
emissão de eventos;
tratamento de falha de plugin;
fluxo principal da experiência.
Riscos principais
Core excessivamente abrangente;
contratos acoplados ao primeiro caso de uso;
Tool Plugin com conhecimento pedagógico;
Experience Plugin acessando infraestrutura diretamente;
interface assumindo responsabilidades do Core.
Critérios de conclusão
[ ] A aplicação inicializa de forma previsível
[ ] O Core possui responsabilidades delimitadas
[ ] O Plugin Manager executa o ciclo de vida básico
[ ] Um Experience Plugin é carregado por contrato
[ ] Um Tool Plugin é reutilizado pela experiência
[ ] Plugins não se comunicam diretamente
[ ] O fluxo principal possui testes
[ ] Erros de plugin são isolados
[ ] A estrutura real corresponde ao SAD
[ ] A primeira experiência foi validada pedagogicamente
20.8 Estágio 2 — Plataforma Modular

O Estágio 2 consolida a plataforma como ambiente extensível por módulos e plugins.

Seu objetivo é demonstrar que a arquitetura suporta múltiplas experiências sem crescimento descontrolado do Core.

Capacidades prioritárias
contratos formais de plugins;
manifesto de plugin;
validação de compatibilidade;
permissões iniciais;
gerenciamento completo do ciclo de vida;
múltiplos Tool Plugins;
múltiplos Experience Plugins;
composição de ferramentas;
modelo declarativo inicial de módulos;
registro de evidências;
persistência por contratos;
Design System básico;
suítes de conformidade.
Contratos a estabilizar

Deverão possuir implementação e testes, conforme aplicável:

Plugin;
ToolPlugin;
ExperiencePlugin;
IntegrationPlugin;
PluginManifest;
PluginContext;
EventBus;
StateService;
PersistenceService;
ModuleDefinition;
LearningEvidence.

Os nomes definitivos deverão ser definidos pela implementação e documentados.

Manifesto inicial de plugin

Exemplo conceitual:

interface PluginManifest {
id: string;
name: string;
version: string;
type: "tool" | "experience" | "integration";
requiredCoreVersion: string;
permissions: PluginPermissions;
entryPoint: string;
}
Capacidades pedagógicas
definição estruturada de competências;
objetivos de aprendizagem;
atividades;
associação entre atividade e Experience Plugin;
critérios de conclusão;
registro de evidências;
avaliação básica;
retomada de experiência.
Ecossistema mínimo recomendado

O estágio deverá demonstrar, pelo menos:

dois módulos pedagógicos;
dois Experience Plugins;
três ou mais Tool Plugins;
reutilização real de um Tool Plugin;
persistência de progresso;
geração de evidências;
teste de compatibilidade.
Qualidade esperada
ausência de importação direta entre plugins;
contratos centralizados;
testes de conformidade;
checagem de tipos;
lint;
build de produção;
revisão arquitetural em pull requests;
documentação mínima por plugin.
Riscos principais
proliferação de contratos instáveis;
duplicação de Tool Plugins;
inclusão de lógica específica no Core;
módulos excessivamente acoplados às implementações;
crescimento inconsistente da interface.
Critérios de conclusão
[ ] Existem múltiplos Experience Plugins
[ ] Tool Plugins são efetivamente reutilizados
[ ] Os contratos possuem testes de conformidade
[ ] O manifesto de plugins está validado
[ ] A compatibilidade de versões é verificada
[ ] Módulos são definidos de forma estruturada
[ ] Evidências são registradas por contrato
[ ] O Design System básico é aplicado
[ ] O Core não contém lógica pedagógica específica
[ ] A inclusão de novo plugin não exige alteração estrutural do Core
20.9 Estágio 3 — Plataforma Offline Confiável

O Estágio 3 consolida a plataforma como PWA capaz de operar com continuidade em condições de conectividade limitada.

Seu objetivo é transformar a estratégia Offline First em capacidade operacional confiável.

Capacidades prioritárias
IndexedDB estruturada;
repositórios;
adaptadores;
versionamento de esquemas;
migrações;
recuperação de sessão;
persistência de progresso;
persistência de evidências;
Service Worker;
manifesto PWA;
precache;
cache sob demanda;
controle de atualizações;
retomada após interrupção;
testes offline automatizados;
mecanismos de exportação local.
Modelo operacional
Usuário
↓
Aplicação PWA
↓
Core
↓
Serviço de Persistência
↓
IndexedDB
↓
Fila local de operações futuras

A rede não deverá ser necessária para as funções pedagógicas locais essenciais.

Classificação dos recursos offline
Recurso Tratamento
Shell da aplicação Precache
Tool Plugin essencial Cache versionado
Experience Plugin acessado Cache sob demanda
Conteúdo pedagógico Cache ou IndexedDB
Progresso IndexedDB
Evidências IndexedDB
Configurações simples Local Storage
Estado transitório Session Storage ou memória
Capacidades de recuperação

A plataforma deverá recuperar-se de:

fechamento inesperado;
atualização da página;
perda de rede;
falha de integração;
atualização da aplicação;
migração de esquema;
cache desatualizado;
plugin indisponível.
Política de atualização

A ativação de nova versão não deverá interromper uma atividade em execução.

O fluxo preferencial será:

Atualização detectada
↓
Nova versão preparada
↓
Usuário informado
↓
Atividade atual preservada
↓
Atualização em momento seguro
↓
Migração validada
Testes prioritários
instalação da PWA;
carregamento sem rede;
navegação offline;
persistência de atividade;
fechamento e retomada;
migração;
atualização do Service Worker;
remoção de cache antigo;
falha de armazenamento;
limite de armazenamento;
preservação de evidências.
Riscos principais
cache inconsistente;
coexistência de versões;
perda de dados em migração;
armazenamento excessivo;
falsa percepção de sincronização;
dependência oculta de recursos externos.
Critérios de conclusão
[ ] A aplicação executa os fluxos essenciais sem rede
[ ] O progresso persiste entre sessões
[ ] Evidências não são perdidas após interrupção
[ ] Migrações de dados possuem testes
[ ] Atualizações não interrompem atividades
[ ] Caches antigos são removidos de forma segura
[ ] O estado de conectividade é comunicado ao usuário
[ ] Há mecanismos de recuperação
[ ] A PWA é instalável
[ ] Os fluxos offline foram testados em dispositivos reais
20.10 Estágio 4 — Plataforma Integrada

O Estágio 4 incorpora comunicação controlada com sistemas externos.

Seu objetivo é ampliar as capacidades institucionais sem comprometer a autonomia local da plataforma.

Capacidades prioritárias
Integration Plugins;
fila de sincronização;
autenticação institucional, quando necessária;
autorização;
tratamento de tokens;
resolução de conflitos;
integração com LMS;
exportação e importação;
APIs institucionais;
logs de integração;
observabilidade;
políticas de privacidade;
mecanismos de idempotência.
Integrações possíveis

A ordem deverá ser definida por valor pedagógico e viabilidade.

Exemplos:

Moodle ou outro LMS;
Google Sheets;
APIs institucionais;
serviço de armazenamento;
analytics educacional;
serviço de geração de relatórios;
serviços de inteligência artificial;
repositórios de conteúdos.
Arquitetura esperada
Experience Plugin
↓
Serviço do Core
↓
Fila de Sincronização
↓
Integration Plugin
↓
Sistema Externo

Nenhuma experiência deverá depender diretamente da API externa.

Sincronização

A sincronização deverá suportar:

registros pendentes;
repetição segura;
identificação de falha;
reprocessamento;
confirmação;
resolução de conflito;
observabilidade;
operação local durante indisponibilidade.
Estados recomendados
local
pending
syncing
synced
conflict
error

Esses estados deverão ser visíveis para o sistema e, quando relevante, para o usuário.

Segurança esperada
comunicação por HTTPS;
ausência de segredos no cliente;
permissões mínimas;
autenticação com protocolo consolidado;
tokens limitados;
validação de respostas;
sanitização de dados;
auditoria;
políticas de retenção.
Inteligência Artificial

Integrações com IA somente deverão ser incorporadas quando houver:

finalidade pedagógica explícita;
supervisão humana;
transparência;
tratamento de erros;
política de dados;
limitação de escopo;
avaliação de custo;
estratégia de fallback.

O uso de IA não deverá constituir dependência estrutural para o funcionamento básico da plataforma.

Riscos principais
dependência excessiva de APIs;
complexidade de autenticação;
perda de autonomia offline;
conflito de dados;
exposição de informações;
indisponibilidade de terceiros;
custos operacionais;
integração sem valor pedagógico claro.
Critérios de conclusão
[ ] Integrações ocorrem exclusivamente por Integration Plugins
[ ] A plataforma continua funcional sem serviços externos
[ ] A fila de sincronização é persistente
[ ] Operações repetidas não geram duplicidade indevida
[ ] Conflitos possuem tratamento definido
[ ] Autenticação e autorização são testadas
[ ] Dados enviados são minimizados
[ ] Falhas externas não interrompem experiências locais
[ ] Logs permitem diagnóstico
[ ] A política de privacidade está documentada
20.11 Estágio 5 — Ecossistema Governado

O Estágio 5 transforma a plataforma em um ecossistema capaz de receber módulos e plugins desenvolvidos por diferentes equipes.

Seu objetivo é permitir expansão controlada sem comprometer segurança, compatibilidade ou qualidade pedagógica.

Capacidades prioritárias
catálogo de plugins;
catálogo de módulos;
distribuição independente;
validação automática;
assinatura ou verificação de integridade;
homologação técnica;
homologação pedagógica;
matriz de compatibilidade;
política de suporte;
canais de release;
sandbox reforçado;
governança institucional;
portal de documentação;
métricas de uso e qualidade.
Catálogo de plugins

Cada item deverá registrar:

identificador;
categoria;
versão;
autor;
responsável;
contrato requerido;
permissões;
dependências;
status de homologação;
compatibilidade;
origem;
integridade;
documentação;
data de atualização.
Catálogo de módulos

Cada módulo deverá possuir:

identificador;
versão;
competências;
objetivos;
atividades;
experiências requeridas;
evidências;
avaliação;
público;
responsável pedagógico;
status;
compatibilidade.
Fluxo de publicação de plugin
Desenvolvimento
↓
Testes de contrato
↓
Análise de segurança
↓
Homologação técnica
↓
Homologação pedagógica, se aplicável
↓
Assinatura ou validação de integridade
↓
Publicação no catálogo
Distribuição dinâmica

O carregamento remoto de plugins somente deverá ser considerado quando existirem:

assinatura ou verificação confiável;
controle de origem;
permissões;
isolamento;
compatibilidade;
rollback;
catálogo;
auditoria;
política de atualização.

Até esse ponto, a descoberta estática permanece a alternativa preferencial.

Maturidade institucional

Esse estágio poderá exigir:

responsáveis formais;
processo de homologação;
política de publicação;
suporte;
acordos de versão;
gestão de incidentes;
governança de dados;
política de descontinuação;
controle de fornecedores.
Riscos principais
crescimento descontrolado do catálogo;
plugins abandonados;
vulnerabilidades de terceiros;
incompatibilidade;
baixa qualidade pedagógica;
fragmentação;
custos de suporte;
burocratização excessiva.
Critérios de conclusão
[ ] Existe catálogo versionado de plugins
[ ] Existe processo de homologação
[ ] A origem dos artefatos pode ser verificada
[ ] A matriz de compatibilidade é mantida
[ ] Plugins podem ser desativados ou revertidos
[ ] Há política de descontinuação
[ ] Módulos possuem validação pedagógica
[ ] A documentação é suficiente para terceiros
[ ] A governança possui papéis definidos
[ ] Indicadores de qualidade são acompanhados
20.12 Roadmap do Core

A evolução do Core deverá ocorrer de forma restritiva.

Fase Capacidades do Core
Fundação Bootstrap, contratos conceituais
Núcleo Funcional Lifecycle, eventos, erros, registro de serviços
Plataforma Modular Plugin Manager completo, permissões e estado
Offline Confiável Persistência, migração e recuperação
Plataforma Integrada Sincronização, autenticação e autorização
Ecossistema Políticas, validação e governança distribuída

O Core não deverá incorporar funcionalidades específicas de módulos ou integrações.

20.13 Roadmap do Plugin Manager

A evolução do Plugin Manager deverá seguir a seguinte trajetória:

Registro manual
↓
Descoberta estática
↓
Validação de manifesto
↓
Compatibilidade de versões
↓
Permissões
↓
Homologação
↓
Catálogo
↓
Distribuição dinâmica controlada

Cada etapa depende da estabilidade da anterior.

20.14 Roadmap dos Tool Plugins

A evolução recomendada para Tool Plugins será:

implementação de ferramentas básicas;
estabilização dos contratos;
reutilização entre experiências;
padronização visual;
acessibilidade;
configuração declarativa;
documentação para autores;
distribuição independente;
homologação;
catálogo.

Exemplos iniciais possíveis:

quiz;
painel de indicadores;
gráfico;
checklist;
leitor de documentos;
simulador genérico;
gerador de relatório;
comparação de resultados.
20.15 Roadmap dos Experience Plugins

A evolução recomendada será:

primeira experiência monofluxo;
experiência com múltiplas etapas;
composição de Tool Plugins;
persistência e retomada;
geração de evidências;
avaliação e feedback;
operação offline;
sincronização;
configuração parcial;
homologação pedagógica.

O aumento da quantidade de experiências não deverá preceder a estabilização dos padrões de composição.

20.16 Roadmap dos Integration Plugins

A evolução deverá ocorrer somente após consolidação da operação local.

Sequência recomendada:

Exportação local
↓
Integração simples sem autenticação
↓
Integração autenticada
↓
Sincronização unidirecional
↓
Sincronização bidirecional
↓
Resolução de conflitos
↓
Múltiplas integrações

A primeira integração deverá ser escolhida por valor prático e capacidade de testar o contrato, não por amplitude.

20.17 Roadmap Pedagógico

A evolução pedagógica deverá acompanhar a arquitetura técnica.

Fase inicial
um módulo;
uma competência;
uma atividade;
uma evidência;
uma experiência completa.
Fase modular
múltiplos módulos;
reutilização de ferramentas;
progressão;
diferentes tipos de evidência;
critérios de conclusão.
Fase offline
retomada;
uso em laboratório;
exportação local;
continuidade de atividades.
Fase integrada
acompanhamento docente;
sincronização com LMS;
relatórios;
feedback institucional.
Fase de ecossistema
autoria distribuída;
modelos de módulos;
validação pedagógica;
catálogo;
compartilhamento entre instituições.
20.18 Roadmap da Persistência
Estado em memória
↓
Persistência simples
↓
Repositórios
↓
IndexedDB versionada
↓
Migrações
↓
Recuperação
↓
Fila de sincronização
↓
Sincronização remota
↓
Governança de dados

A sincronização não deverá ser implementada antes que a persistência local seja confiável.

20.19 Roadmap da Segurança
Fase Capacidades
Fundação Fronteiras de confiança e regras
Núcleo Validação de entradas e isolamento básico
Modular Manifesto e permissões
Offline Proteção de dados locais e sessões
Integrada Autenticação, autorização e segurança de APIs
Ecossistema Assinatura, homologação e auditoria

A segurança deverá evoluir antes ou no mesmo ritmo da ampliação da superfície de ataque.

20.20 Roadmap da Qualidade

A evolução das verificações deverá seguir uma progressão semelhante:

Lint e type checking
↓
Testes unitários
↓
Testes de contrato
↓
Testes de integração
↓
Testes E2E
↓
Testes offline
↓
Testes de segurança
↓
Auditoria de conformidade

O pipeline deverá crescer de forma incremental, sem abandonar verificações já consolidadas.

20.21 Roadmap de Implantação
Fase inicial
execução local;
build manual;
publicação experimental.
Fase de núcleo funcional
CI básica;
GitHub Pages;
build automático.
Fase modular
preview de pull request;
tags;
releases;
changelog.
Fase offline
PWA;
atualização controlada;
validação de Service Worker.
Fase integrada
homologação separada;
configurações por ambiente;
observabilidade.
Fase de ecossistema
múltiplos canais;
assinatura;
distribuição separada;
servidores institucionais.
20.22 Marcos Arquiteturais

Os principais marcos recomendados são:

Marco Resultado
M0 SAD e ADRs fundamentais concluídos
M1 Core inicial executável
M2 Primeiro plugin carregado pelo lifecycle
M3 Primeira experiência pedagógica completa
M4 Reutilização de Tool Plugin comprovada
M5 Persistência estruturada operacional
M6 PWA funcionando offline
M7 Primeira integração externa
M8 Sincronização confiável
M9 Catálogo de plugins
M10 Ecossistema institucional governado

Os marcos deverão representar capacidades demonstráveis, e não apenas conclusão de tarefas.

20.23 Dependências Críticas

Algumas capacidades possuem dependências obrigatórias.

Capacidade Dependência
Experience Plugin Lifecycle e Plugin Manager
Reutilização de Tool Plugin Contratos estáveis
Persistência de plugins Serviço de persistência
Operação offline Cache e persistência local
Sincronização Identificação estável e fila local
Autenticação Serviço externo ou provedor de identidade
Catálogo Metadados, versões e homologação
Distribuição dinâmica Segurança, integridade e isolamento
Marketplace Catálogo, governança e suporte
Analytics pedagógico Evidências estruturadas e privacidade

Capacidades dependentes não deverão ser antecipadas por soluções provisórias que violem a arquitetura.

20.24 Priorização

A priorização deverá considerar:

valor pedagógico;
risco técnico;
dependências;
esforço;
capacidade de validação;
impacto arquitetural;
possibilidade de reutilização;
criticidade;
custo de reversão.

Uma matriz simples poderá ser utilizada:

Prioridade Característica
P0 Bloqueia a arquitetura ou o fluxo principal
P1 Necessária para o próximo marco
P2 Amplia capacidade existente
P3 Otimização ou evolução futura
20.25 Itens Prioritários para a Fase Atual

Considerando a arquitetura já definida, a fase atual deverá priorizar:

consolidar o SAD;
revisar a coerência entre seções;
criar ADRs adicionais necessários;
formalizar o lifecycle;
definir contratos mínimos;
implementar bootstrap do Core;
implementar Event Bus inicial;
implementar Plugin Manager básico;
criar um Tool Plugin simples;
criar um Experience Plugin piloto;
criar um módulo pedagógico piloto;
testar o fluxo completo;
documentar o resultado;
revisar a arquitetura com base na implementação.
20.26 Sequência Técnica Inicial Recomendada

1. Contratos mínimos
   ↓
2. Bootstrap
   ↓
3. Lifecycle
   ↓
4. Event Bus
   ↓
5. Plugin Manager
   ↓
6. Tool Plugin piloto
   ↓
7. Experience Plugin piloto
   ↓
8. Módulo piloto
   ↓
9. Estado
   ↓
10. Persistência
    ↓
11. PWA

A persistência completa não deverá preceder a validação do fluxo básico de execução.

20.27 ADRs Recomendados para as Próximas Etapas

Conforme a implementação avance, deverão ser avaliados ADRs para:

contrato do ciclo de vida dos plugins;
formato do manifesto;
estratégia inicial de estado;
implementação do Event Bus;
mecanismo de persistência;
estrutura da IndexedDB;
biblioteca ou abordagem de validação de esquemas;
estratégia de roteamento;
configuração de PWA;
framework de testes;
política de compatibilidade;
formato declarativo dos módulos;
estrutura das evidências pedagógicas.

Nem todos deverão ser criados antecipadamente. O ADR deverá responder a uma decisão concreta.

20.28 Gestão de Riscos do Roadmap

Os riscos deverão ser acompanhados ao longo das fases.

Risco Tratamento
Core monolítico Revisão rigorosa de responsabilidades
Contratos instáveis Poucas implementações e testes iniciais
Excesso de plugins Catálogo controlado e critérios claros
Complexidade prematura Adiar recursos sem demanda real
Perda de dados Persistência versionada e testes
Falhas offline Testes de conectividade e recuperação
Integrações frágeis Integration Plugins e fallback
Divergência pedagógica Homologação e rastreabilidade
Documentação obsoleta Atualização no mesmo pull request
Dependência de uma pessoa Documentação e onboarding
Escopo excessivo Marcos pequenos e verificáveis
Baixa adesão Validação contínua com usuários
20.29 Critérios de Transição entre Estágios

A mudança de estágio deverá considerar quatro dimensões.

Conformidade técnica
componentes implementados;
contratos respeitados;
testes aprovados;
ausência de falhas críticas.
Conformidade arquitetural
fronteiras preservadas;
ADRs atualizados;
dívida crítica controlada;
documentação coerente.
Conformidade pedagógica
experiência validada;
evidências adequadas;
objetivos atendidos;
usuários representativos envolvidos.
Prontidão operacional
build reproduzível;
implantação validada;
recuperação disponível;
suporte mínimo definido.
20.30 Revisão do Roadmap

O roadmap deverá ser revisado:

ao final de cada marco;
antes de uma mudança de estágio;
após alteração estratégica;
após incidente relevante;
quando novas restrições forem identificadas;
quando o uso real contradisser premissas iniciais.

A revisão deverá avaliar:

entregas concluídas;
desvios;
riscos;
dívida;
dependências;
novos aprendizados;
prioridades;
necessidade de ADR.
20.31 Roadmap e Releases

Os releases deverão estar associados a capacidades, não apenas a datas.

Exemplo conceitual:

Release Capacidade principal
0.1.0-alpha Bootstrap e interface inicial
0.2.0-alpha Lifecycle e Plugin Manager
0.3.0-alpha Primeira experiência
0.4.0-alpha Persistência inicial
0.5.0-beta Operação offline
0.6.0-beta Múltiplos módulos
0.7.0-beta Primeira integração
1.0.0 Plataforma mínima estável

Essa numeração é ilustrativa e deverá ser ajustada ao estado real do projeto.

20.32 Critérios para a Versão 1.0

A versão 1.0.0 deverá representar um contrato de estabilidade, e não apenas uma entrega maior.

Recomenda-se exigir:

[ ] Core com responsabilidades estabilizadas
[ ] Contratos públicos documentados
[ ] Lifecycle estável
[ ] Plugin Manager confiável
[ ] Pelo menos dois módulos funcionais
[ ] Reutilização de Tool Plugins demonstrada
[ ] Persistência estruturada
[ ] Operação offline validada
[ ] Migrações testadas
[ ] Segurança mínima implementada
[ ] Testes automatizados dos fluxos críticos
[ ] Documentação técnica e de usuário
[ ] Processo de release estabelecido
[ ] Homologação pedagógica
[ ] Ausência de dívida arquitetural crítica conhecida

A publicação prematura de uma versão 1.0 poderá gerar expectativas de compatibilidade que a arquitetura ainda não é capaz de sustentar.

20.33 Itens Fora do Escopo Inicial

Para proteger a fase de fundação, os seguintes itens deverão permanecer fora do escopo imediato, salvo necessidade comprovada:

marketplace público;
carregamento arbitrário de plugins remotos;
microserviços;
arquitetura multi-tenant;
sincronização bidirecional complexa;
colaboração em tempo real;
edição colaborativa;
analytics avançado;
recomendação adaptativa;
inteligência artificial generativa no Core;
blockchain;
aplicação nativa;
infraestrutura de containers em escala;
orquestração distribuída.

Esses recursos poderão ser reavaliados quando a maturidade da plataforma justificar.

20.34 Estratégia de Prototipagem

Protótipos poderão ser utilizados para explorar capacidades futuras.

Entretanto, deverão permanecer separados da implementação principal quando:

utilizarem contratos instáveis;
violarem princípios;
dependerem de serviços experimentais;
não possuírem testes;
não atenderem requisitos de segurança;
não estiverem pedagogicamente validados.

Todo protótipo deverá resultar em uma das seguintes decisões:

incorporar;
revisar;
adiar;
rejeitar;
descartar.
20.35 Métricas de Progresso

O avanço do roadmap poderá ser acompanhado por indicadores como:

marcos concluídos;
contratos estabilizados;
plugins homologados;
módulos funcionais;
testes aprovados;
cobertura dos fluxos críticos;
violações arquiteturais;
dívida crítica;
falhas offline;
tempo de recuperação;
taxa de sucesso de sincronização;
avaliação de usuários;
problemas pedagógicos identificados.

Essas métricas deverão avaliar capacidade e qualidade, não apenas volume de código.

20.36 Governança do Roadmap

A atualização do roadmap deverá ocorrer por meio de processo controlado.

Mudanças significativas deverão informar:

motivação;
impacto;
prioridade;
dependências;
riscos;
estágio afetado;
entregas adiadas;
critérios alterados;
necessidade de ADR.

O roadmap deverá permanecer alinhado ao backlog e às releases.

20.37 Responsabilidades
Papel Responsabilidade
Responsável pela arquitetura Manter coerência das fases
Mantenedor do Core Implementar capacidades estruturais
Desenvolvedores Executar incrementos técnicos
Autores de plugins Evoluir o ecossistema
Equipe pedagógica Validar módulos e experiências
Responsável por segurança Avaliar expansão da superfície de risco
Responsável pelo release Relacionar marcos e versões
Governança do projeto Priorizar recursos e etapas
20.38 Roadmap Resumido
Estágio Prioridade Resultado
0 — Fundação SAD, ADRs, contratos conceituais Arquitetura compreensível
1 — Núcleo Core, lifecycle e primeira experiência Plataforma mínima executável
2 — Modular Plugins, módulos e evidências Extensibilidade validada
3 — Offline Persistência, PWA e recuperação Operação local confiável
4 — Integrada APIs, sincronização e identidade Integração institucional
5 — Ecossistema Catálogo, homologação e distribuição Expansão governada
20.39 Modelo Conceitual do Roadmap
Visão Arquitetural
│
▼
Fundação
│
▼
Core Funcional
│
▼
Plataforma Modular
│
▼
Operação Offline
│
▼
Integrações
│
▼
Ecossistema Governado
│
▼
Evolução Contínua
20.40 Diretriz Final

A evolução do LabInspeção_UniSENAI deverá priorizar a criação de uma plataforma pequena, coerente e verificável antes de buscar amplitude funcional.

O sucesso arquitetural não será medido pela quantidade de tecnologias, plugins ou integrações incorporadas, mas pela capacidade de:

adicionar novas experiências sem comprometer o Core;
reutilizar ferramentas técnicas;
preservar dados;
operar offline;
evoluir contratos de forma controlada;
manter alinhamento pedagógico;
permitir manutenção por diferentes colaboradores;
sustentar crescimento sem perda de coerência.

O roadmap deverá permanecer sujeito a revisão contínua, orientada por evidências produzidas pela implementação, pelos testes e pelo uso real da plataforma.

Quadro-resumo
Dimensão Diretriz
Evolução Incremental e baseada em capacidades
Prioridade inicial Core, lifecycle e contratos
Validação Técnica, arquitetural e pedagógica
Offline Consolidado antes da sincronização
Integrações Isoladas e não bloqueantes
Plugins Estáticos antes de distribuição dinâmica
Segurança Evolui antes da superfície de ataque
Governança Cresce conforme a complexidade real
Releases Associadas a marcos verificáveis
Versão 1.0 Estabilidade, não apenas volume
Complexidade Incorporada somente quando justificada
Roadmap Revisado a cada marco relevante
