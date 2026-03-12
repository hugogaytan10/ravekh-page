import { BLOG_ROUTES } from "../model/blogRoutes";

export const getBlogRoute = (routeKey) => BLOG_ROUTES[routeKey] ?? BLOG_ROUTES.home;
