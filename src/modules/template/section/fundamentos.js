function renderSectionHeader({ eyebrow, title, description }) {
  return `
<header class="module-section__header">

    <p class="module-section__eyebrow">
        ${eyebrow}
    </p>

    <h2 class="module-section__title">
        ${title}
    </h2>

    <p class="module-section__description">
        ${description}
    </p>

</header>
`;
}

export function renderFrenagemFundamentos() {
  return `

<section
    id="conceitos"
    class="module-section"
    data-section
    aria-labelledby="fundamentos-title">

${renderSectionHeader({
  eyebrow: 'Fundamentos',

  title: 'Princípios físicos da frenagem',

  description:
    'Antes de interpretar um frenômetro é necessário compreender como a força de frenagem é gerada, distribuída entre os eixos e convertida em desaceleração.',
})}

<div class="content-grid content-grid--2">

<article class="content-card">

<h3>Eficiência de frenagem</h3>

<p>

A eficiência representa a relação entre a força total de frenagem
desenvolvida pelas rodas e o peso do veículo.

</p>

<p class="formula">

η =
ΣF<sub>freio</sub>
/
(m·g)
×100

</p>

<p>

Quanto maior a eficiência, maior a capacidade do veículo reduzir sua velocidade.

</p>

</article>

<article class="content-card">

<h3>Forças atuantes</h3>

<ul>

<li>peso do veículo;</li>

<li>força normal em cada roda;</li>

<li>força tangencial de frenagem;</li>

<li>aderência pneu–pavimento;</li>

<li>transferência dinâmica de carga.</li>

</ul>

</article>

</div>

<div class="content-grid content-grid--3">

<article class="content-card">

<h3>Transferência de carga</h3>

<p>

Durante a frenagem ocorre aumento da carga no eixo dianteiro e redução
no eixo traseiro.

</p>

</article>

<article class="content-card">

<h3>Desequilíbrio lateral</h3>

<p>

Diferenças elevadas entre rodas do mesmo eixo podem provocar tendência
de desvio da trajetória.

</p>

</article>

<article class="content-card">

<h3>ABS</h3>

<p>

O sistema antibloqueio controla o escorregamento das rodas,
mantendo dirigibilidade e estabilidade durante frenagens intensas.

</p>

</article>

</div>

<div class="callout callout--info">

<h3>Conceito importante</h3>

<p>

O frenômetro mede a força desenvolvida por cada roda.
A eficiência global e o desequilíbrio são grandezas calculadas a partir
dessas medições.

</p>

</div>

<div class="content-grid content-grid--2">

<article class="content-card">

<h3>Grandezas avaliadas</h3>

<ul>

<li>força máxima por roda;</li>

<li>eficiência global;</li>

<li>desequilíbrio por eixo;</li>

<li>ovalização;</li>

<li>arraste residual.</li>

</ul>

</article>

<article class="content-card">

<h3>Competências desenvolvidas</h3>

<ul>

<li>interpretar resultados experimentais;</li>

<li>relacionar teoria e prática;</li>

<li>identificar anomalias;</li>

<li>emitir parecer técnico;</li>

<li>avaliar segurança veicular.</li>

</ul>

</article>

</div>

</section>

`;
}
