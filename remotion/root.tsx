import { Composition } from "remotion";
import { CatalogoPublicoPromo } from "./video";

export function RemotionRoot() {
  return (
    <Composition
      id="CatalogoPublicoPromo"
      component={CatalogoPublicoPromo}
      durationInFrames={3660}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
}
