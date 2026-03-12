import { systemsRegistry } from "../model/systemsRegistry";

export const systemRoutes = systemsRegistry.flatMap((system) => system.routes);
