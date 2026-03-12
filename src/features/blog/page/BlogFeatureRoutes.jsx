import { getBlogRoute } from "../service/getBlogRoute";
import { BlogFeaturePage } from "./BlogFeaturePage";
import { BlogAiArticlesPage } from "./BlogAiArticlesPage";
import { BlogWhisperArticlePage } from "./BlogWhisperArticlePage";
import { BlogReactNativeArticlesPage } from "./BlogReactNativeArticlesPage";
import { BlogReactNativeWorthItPage } from "./BlogReactNativeWorthItPage";

export const blogFeatureRoutes = [
  {
    path: getBlogRoute("home"),
    element: <BlogFeaturePage />,
  },
  {
    path: getBlogRoute("aiArticles"),
    element: <BlogAiArticlesPage />,
  },
  {
    path: getBlogRoute("whisperArticle"),
    element: <BlogWhisperArticlePage />,
  },
  {
    path: getBlogRoute("reactNativeArticles"),
    element: <BlogReactNativeArticlesPage />,
  },
  {
    path: getBlogRoute("reactNativeWorthItArticle"),
    element: <BlogReactNativeWorthItPage />,
  },
];
