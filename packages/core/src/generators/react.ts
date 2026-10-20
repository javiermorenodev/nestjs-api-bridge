import type { ControllerSpec, EndpointSpec } from '../models/index.js';
import { toKebabCase } from '../utils/case.js';
import { getTemplate } from './template.js';
import { buildParamList, capitalize, controllerBaseName } from './ts-utils.js';

function toServiceFile(controller: ControllerSpec): string {
  return `${toKebabCase(controllerBaseName(controller.name))}.service`;
}

function toHookName(controller: ControllerSpec, endpoint: EndpointSpec): string {
  return `use${controllerBaseName(controller.name)}${capitalize(endpoint.name)}`;
}

function buildQueryHook(controller: ControllerSpec, endpoint: EndpointSpec): string {
  const hookName = toHookName(controller, endpoint);
  const signature = buildParamList(endpoint.params);
  const args = endpoint.params.map((param) => param.name).join(', ');
  const deps = endpoint.params.length > 0 ? `[${args}]` : '[]';

  return `export function ${hookName}(${signature}) {
  type Result = Awaited<ReturnType<typeof service.${endpoint.name}>>;
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.${endpoint.name}(${args});
      setData(result);
      return result;
    } catch (cause) {
      const failure = cause instanceof Error ? cause : new Error(String(cause));
      setError(failure);
      throw failure;
    } finally {
      setLoading(false);
    }
  }, ${deps});

  useEffect(() => {
    void refetch().catch(() => undefined);
  }, [refetch]);

  return { data, loading, error, refetch };
}`;
}

function buildMutationHook(controller: ControllerSpec, endpoint: EndpointSpec): string {
  const hookName = toHookName(controller, endpoint);

  return `export function ${hookName}() {
  type Result = Awaited<ReturnType<typeof service.${endpoint.name}>>;
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (...args: Parameters<typeof service.${endpoint.name}>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.${endpoint.name}(...args);
      setData(result);
      return result;
    } catch (cause) {
      const failure = cause instanceof Error ? cause : new Error(String(cause));
      setError(failure);
      throw failure;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, data, loading, error };
}`;
}

/**
 * Genera hooks de React (`useState`/`useEffect`) sobre un servicio `fetch`.
 *
 * @param controller Controlador NestJS previamente parseado.
 * @returns El código fuente TypeScript con los hooks.
 */
export function generateReactHooks(controller: ControllerSpec): string {
  const hooks = controller.endpoints
    .map((endpoint) =>
      endpoint.httpMethod === 'GET'
        ? buildQueryHook(controller, endpoint)
        : buildMutationHook(controller, endpoint),
    )
    .join('\n\n');

  return `${getTemplate('react-hooks.hbs')({
    serviceFile: toServiceFile(controller),
    hooks,
  }).trimEnd()}\n`;
}
