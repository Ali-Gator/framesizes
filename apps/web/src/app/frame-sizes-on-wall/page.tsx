import { pageMetadata } from "@/lib/seo";
import { livePage } from "@/lib/site-map";

const F2 = livePage("F2");

export const metadata = pageMetadata(F2);

export default function FramesOnWall() {
  return <h1>{F2.seo.h1}</h1>;
}
