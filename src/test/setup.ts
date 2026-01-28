import { expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { OBR_MOCK, setWindowOBRReady } from './mocks/obr';

expect.extend(matchers);

// Module-level mock for all imports of `@owlbear-rodeo/sdk`.
// Individual tests can mutate `OBR_MOCK.isAvailable` to simulate embedded mode.
// Note: This must run before most app modules import the SDK.
vi.mock('@owlbear-rodeo/sdk', () => ({ default: OBR_MOCK }));

// Default SDK state for tests: non-embedded (dev mode), but with a window.OBR shim
// for code paths that check `window.OBR`.
setWindowOBRReady(true);

