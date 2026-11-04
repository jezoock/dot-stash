import { beforeEach } from 'vitest';
import { resetPage } from '../helpers/page';

// Each test starts on a fresh page, as with a new browser page (the spies and the stubbed globals of a test are restored
// before the next one: `restoreMocks` and `unstubGlobals` in vitest.config.mts).
beforeEach(() => resetPage());
