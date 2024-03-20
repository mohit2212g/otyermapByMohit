import Head from "next/head";

import MapComponent from '../components/Map';


export default function Home() {
  return (
    <>
        <h1>Render Map using OpenLayers</h1>
        <MapComponent />
    </>
  );
}
