/**
 * Gera um controle deslizante reutilizável.
 *
 * Convenções:
 * - o input recebe exatamente o id informado;
 * - o output recebe o id `${id}-value`;
 * - o valor numérico recebe o atributo data-range-value;
 * - a unidade recebe o atributo data-range-unit.
 *
 * @param {object} options
 * @param {string} options.id
 * @param {string} options.label
 * @param {number} options.min
 * @param {number} options.max
 * @param {number} [options.step=1]
 * @param {number} options.value
 * @param {string} [options.unit='']
 * @param {string} [options.description='']
 * @returns {string}
 */
export function rangeControl({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  unit = '',
  description = '',
}) {
  if (!id || !label) {
    throw new TypeError('rangeControl exige as propriedades "id" e "label".');
  }

  const numericValues = [min, max, step, value];

  if (numericValues.some((item) => !Number.isFinite(Number(item)))) {
    throw new TypeError(`rangeControl("${id}") recebeu um parâmetro numérico inválido.`);
  }

  const outputId = `${id}-value`;
  const descriptionId = description ? `${id}-description` : '';

  return `
    <div
      class="range-control"
      data-range-control="${id}"
    >
      <div class="range-control__header">
        <label
          class="range-control__label"
          for="${id}"
        >
          ${label}
        </label>

        <output
          id="${outputId}"
          class="range-control__output"
          for="${id}"
          aria-live="polite"
        >
          <span data-range-value>
            ${value}
          </span>

          ${
            unit
              ? `
                <span
                  class="range-control__unit"
                  data-range-unit
                >
                  ${unit}
                </span>
              `
              : ''
          }
        </output>
      </div>

      ${
        description
          ? `
            <p
              id="${descriptionId}"
              class="range-control__description"
            >
              ${description}
            </p>
          `
          : ''
      }

      <input
        id="${id}"
        class="range-control__input"
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
        ${descriptionId ? `aria-describedby="${descriptionId}"` : ''}
      />

      <div
        class="range-control__limits"
        aria-hidden="true"
      >
        <span>
          ${min}${unit ? ` ${unit}` : ''}
        </span>

        <span>
          ${max}${unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  `;
}
