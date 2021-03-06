import { useContext, useEffect } from "react";
import { MapCtx } from "./components/Map";
import { NonNullMapboxUICtx } from "./types";

/**
 * useMapboxUI is a simple wrapper around `useContext(MapCtx)`
 * it provides the Map instance and mapbox module
 * this hook does not ensure the context proivde was mounted
 * @example
 * ```
 * const { map,mapbox } = useMapboxUI()
 * ```
 */
export const useMapboxUI = () => useContext(MapCtx);

type MapboxUIEffectCallback = (
  mapCtx: NonNullMapboxUICtx
) => void | (() => void);

/**
 * useMapboxUIEffect wraps useMapboxUI in a useEffect
 * this hook ensures the map instance is created
 * and the context provider was mounted
 * @example
 * ```
 * useMapboxUIEffect(
 *  ({ map, mapbox }) => {
 *     const marker = new mapbox.Marker().setLngLat(coordinates).addTo(map);
 *
 *     return () => {
 *       marker.remove();
 *     };
 *   },
 *   [coordinates]
 * );
 * ```
 */
export const useMapboxUIEffect = (
  effect: MapboxUIEffectCallback,
  deps: any[]
) => {
  const { map, mapbox } = useMapboxUI();
  useEffect(() => {
    if (!map || !mapbox) return;
    const rt = effect({ map: map, mapbox: mapbox });
    return rt;
  }, [map, mapbox, ...deps]);
};
