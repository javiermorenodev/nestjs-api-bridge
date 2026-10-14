import type { ControllerSpec, EndpointSpec } from '@nestjs-api-bridge/core';

/** Nodo raíz del árbol que representa un controlador NestJS. */
export interface ControllerNode {
  readonly kind: 'controller';
  readonly controller: ControllerSpec;
}

/** Nodo hoja del árbol que representa un endpoint de un controlador. */
export interface EndpointLeafNode {
  readonly kind: 'endpoint';
  readonly controllerName: string;
  readonly endpoint: EndpointSpec;
}

/** Cualquier nodo mostrado por el `EndpointTreeProvider`. */
export type EndpointNode = ControllerNode | EndpointLeafNode;
