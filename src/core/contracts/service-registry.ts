/**
 * Símbolo utilizado exclusivamente pelo sistema de tipos para associar
 * cada ServiceToken ao tipo de serviço correspondente.
 *
 * A propriedade que utiliza este símbolo é opcional e não é criada nos
 * objetos produzidos em tempo de execução.
 */
declare const serviceTokenType: unique symbol;

/**
 * Token utilizado para identificar um serviço no registro.
 *
 * O parâmetro genérico vincula o token ao tipo do serviço correspondente,
 * permitindo que o TypeScript infira corretamente os tipos de retorno de
 * get() e tryGet(), bem como o tipo aceito por register().
 *
 * Os tokens possuem igualdade por identidade, e não por descrição.
 */
export interface ServiceToken<TService> {
  /**
   * Identidade única utilizada internamente pelo registro.
   *
   * A comparação entre tokens é feita exclusivamente por este símbolo.
   * Dois tokens com a mesma descrição continuam sendo diferentes porque
   * cada chamada a Symbol() produz uma identidade distinta.
   */
  readonly key: symbol;

  /**
   * Descrição legível utilizada em mensagens de diagnóstico e erros.
   *
   * A descrição não participa da identidade do token.
   */
  readonly description: string;

  /**
   * Marcador de tipagem utilizado exclusivamente em tempo de compilação.
   *
   * Essa propriedade preserva a associação estática entre o token e o
   * serviço, sem acrescentar dados aos objetos criados em tempo de execução.
   */
  readonly [serviceTokenType]?: TService;
}

/**
 * Cria um token tipado para identificar um serviço.
 *
 * Cada chamada gera um novo Symbol. Portanto, dois tokens criados com a
 * mesma descrição continuam sendo identidades distintas.
 *
 * A descrição é normalizada com trim() antes da criação do token.
 *
 * @throws {TypeError}
 * Quando a descrição não for uma string.
 *
 * @throws {Error}
 * Quando a descrição estiver vazia ou contiver apenas espaços.
 */
export function createServiceToken<TService>(description: string): ServiceToken<TService> {
  if (typeof description !== 'string') {
    throw new TypeError('Service token description must be a string.');
  }

  const normalizedDescription = description.trim();

  if (normalizedDescription.length === 0) {
    throw new Error('Service token description cannot be empty.');
  }

  return Object.freeze({
    key: Symbol(normalizedDescription),
    description: normalizedDescription,
  });
}

/**
 * Interface somente de leitura utilizada pelos consumidores de serviços.
 *
 * Componentes que apenas dependem de serviços compartilhados devem receber
 * normalmente uma referência do tipo ServiceResolver. Isso permite consultar
 * o registro sem conceder capacidade para adicionar ou remover serviços.
 */
export interface ServiceResolver {
  /**
   * Recupera um serviço previamente registrado.
   *
   * O tipo retornado é inferido a partir do ServiceToken informado.
   *
   * @throws {ServiceNotFoundError}
   * Quando o token não estiver registrado.
   */
  get<TService>(token: ServiceToken<TService>): TService;

  /**
   * Recupera um serviço quando ele estiver registrado.
   *
   * O tipo retornado é inferido a partir do ServiceToken informado.
   *
   * @returns
   * O serviço associado ao token ou undefined quando o token não estiver
   * registrado.
   */
  tryGet<TService>(token: ServiceToken<TService>): TService | undefined;

  /**
   * Informa se existe um serviço associado ao token.
   *
   * @returns
   * true quando o token estiver registrado; caso contrário, false.
   */
  has<TService>(token: ServiceToken<TService>): boolean;
}

/**
 * Registro administrativo de serviços.
 *
 * Esta interface amplia ServiceResolver com operações de registro e remoção.
 * Ela é utilizada pelo Core durante o bootstrap e disponibilizada aos plugins
 * por meio de PluginContext para que cada plugin possa administrar os serviços
 * sob sua própria responsabilidade.
 *
 * Consumidores que apenas consultam serviços devem receber ServiceResolver,
 * preservando o encapsulamento das operações administrativas.
 */
export interface ServiceRegistry extends ServiceResolver {
  /**
   * Registra um serviço associado a um token.
   *
   * A implementação não deve substituir silenciosamente um serviço já
   * registrado. Uma tentativa de registrar novamente o mesmo token deve
   * ser rejeitada.
   *
   * A implementação também deve rejeitar serviços null ou undefined.
   *
   * @throws {ServiceAlreadyRegisteredError}
   * Quando o token já estiver registrado.
   *
   * @throws {InvalidServiceError}
   * Quando o serviço for null ou undefined.
   */
  register<TService>(token: ServiceToken<TService>, service: TService): void;

  /**
   * Remove o serviço associado ao token.
   *
   * A operação é idempotente do ponto de vista do estado do registro:
   * solicitar a remoção de um token inexistente não produz alteração.
   *
   * @returns
   * true quando um serviço foi removido ou false quando o token não estava
   * registrado.
   */
  unregister<TService>(token: ServiceToken<TService>): boolean;
}
