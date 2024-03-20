
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import pinImage from '../components/pin.png';


export const createMarkerFeature = (coordinate: number[]) => {
  // Create a marker at the specified coordinate
  const marker = new Feature({
    geometry: new Point(coordinate),
  });

  // Define marker style
  const markerStyle = new Style({
    image: new Icon({
      crossOrigin: 'anonymous',
      // src: 'https://openlayers.org/en/latest/examples/data/icon.png',
      src: pinImage.src, // Make sure pinImage is imported
      scale: 0.05,
    }),
  });

  marker.setStyle(markerStyle);

  return marker;
};
