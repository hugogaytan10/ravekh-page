import { useMemo } from "react";
import { getBlogPageCopy } from "../service/getBlogPageCopy";

export const useBlogPageCopy = () => {
  return useMemo(() => getBlogPageCopy(), []);
};
