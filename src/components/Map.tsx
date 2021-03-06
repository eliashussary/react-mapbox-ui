import React, { useEffect, useRef, useState, useMemo } from "react";
import MapboxGL, { LngLatLike } from "mapbox-gl";
import { MapboxUICtx, OnMapEventHandlers } from "../types";
import { pickHandlers } from "../util/pickHandlers";
import { createListeners } from "../util/createListeners";

export const MapCtx = React.createContext<MapboxUICtx>({
  map: null,
  mapbox: MapboxGL,
});

type BaseMapboxUIProps = {
  /**
   * accessToken from mapbox, see https://docs.mapbox.com/help/how-mapbox-works/access-tokens/
   */
  accessToken: string;
  /**
   * defaultCenter as [longitude, latitude]
   */
  defaultCenter: LngLatLike;
  /**
   * mapbox styleUrl, see https://docs.mapbox.com/help/glossary/style-url/
   */
  mapStyle?: string;
  defaultZoom?: number;
  /**
   * container style css properties
   */
  style?: React.CSSProperties;
  /**
   * container css className
   */
  className?: string;
  /**
   * container div#id tag
   */
  id?: string;
};

export type MapboxUIProps = Partial<OnMapEventHandlers<BaseMapboxUIProps>> &
  BaseMapboxUIProps;

export const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/light-v10";
export const DEFAULT_MAP_ZOOM = 10;

export const Map: React.FC<MapboxUIProps> = props => {
  const {
    accessToken,
    mapStyle = DEFAULT_MAP_STYLE,
    children,
    defaultCenter,
    defaultZoom = DEFAULT_MAP_ZOOM,
    style,
    className,
    id,
    ...rest
  } = props;
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<MapboxGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [onHandlers, onceHandlers] = useMemo(() => pickHandlers(rest), [rest]);

  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new MapboxGL.Map({
      accessToken,
      container: mapContainer.current,
      style: mapStyle,
      center: defaultCenter,
      zoom: defaultZoom,
    });

    const listenerCtx = {
      props,
      map,
      mapbox: MapboxGL,
    };

    const onListeners = createListeners(onHandlers, map, listenerCtx, {
      listenType: "on",
    });

    const onceListeners = createListeners(onceHandlers, map, listenerCtx, {
      listenType: "once",
    });

    onListeners.addListeners();
    onceListeners.addListeners();
    const onLoad = () => setIsLoaded(true);
    map.on("load", onLoad);
    setMapInstance(map);
    return () => {
      onListeners.removeListeners();
      onceListeners.removeListeners();
      map.on("load", onLoad);
    };
  }, [mapContainer.current]);

  return (
    <React.Fragment>
      <MapCtx.Provider value={{ map: mapInstance, mapbox: MapboxGL }}>
        <div
          id={id}
          className={className}
          style={style}
          ref={ref => (mapContainer.current = ref)}
        />
        {isLoaded && children}
      </MapCtx.Provider>
    </React.Fragment>
  );
};
