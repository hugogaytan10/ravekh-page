import { useBlogPageCopy } from "../hooks/useBlogPageCopy";
import { BlogHeader } from "../interface/BlogHeader";
import { BlogCategoriesSection } from "../interface/BlogCategoriesSection";

export const BlogFeaturePage = () => {
  const copy = useBlogPageCopy();

  return (
    <div className="min-h-screen">
      <BlogHeader title={copy.title} />
      <BlogCategoriesSection />
    </div>
  );
};
