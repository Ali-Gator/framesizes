import { writeNumber } from "@/components/frames-on-wall/display";
import { U } from "@/components/ui/u";

/** "46 × 27 in" / "117 × 69 cm", each side rounded as a distance. Not client: G1's page renders it too. */
export const Dims = ({ w, h }: { w: number; h: number }) => (
  <U
    in={`${writeNumber(w, "in")} × ${writeNumber(h, "in")} in`}
    cm={`${writeNumber(w, "cm")} × ${writeNumber(h, "cm")} cm`}
  />
);
