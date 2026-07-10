/** Re-export soccer BFF handler from shared implementation. */
export {
  bffGetRoute,
  bffOptionsRoute,
  soccerBffDeleteRoute,
  soccerBffPatchRoute,
  soccerBffPostRoute,
  soccerBffPutRoute,
  type BffRouteContext,
  type BffRouteHandler,
  type BffRouteOutput,
  type BffWriteContext,
  type BffWriteHandler,
  type BffWriteOutput,
} from '../shared/handler';
