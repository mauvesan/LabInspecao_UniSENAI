import { createServiceToken } from '../../core/contracts';
import type { ApplicationShellService } from './application-shell-service';

/**
 * Token tipado utilizado para registrar e resolver o serviço responsável
 * pela estrutura visual principal da aplicação.
 */
export const APPLICATION_SHELL_SERVICE_TOKEN =
  createServiceToken<ApplicationShellService>('ApplicationShellService');
