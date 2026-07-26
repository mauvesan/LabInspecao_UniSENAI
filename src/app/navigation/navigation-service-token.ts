import { createServiceToken } from '../../core/contracts';

import type { NavigationService } from './contracts';

export const NavigationServiceToken =
  createServiceToken<NavigationService>('app.navigation.service');
