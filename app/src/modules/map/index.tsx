import { MapContainer, useMapEvents, WMSTileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from "react"
import SearchBox from '../searchbox';
import InfoPanel from '../info-panel';
import { ButtonsContainer, Container, LeftSidePanel, LeftSidePanelSwitcher, MiddlePanel, Placeholder, RightSidePanel, RightSidePanelSwitcher, Version } from './styles';
import { api } from '../../services/api';
import { LeafletMouseEvent } from 'leaflet';
import { generateQueryParams } from '../../utils';
import { FaCaretLeft, FaCaretRight, FaGithub, FaRulerCombined, FaStreetView } from 'react-icons/fa';
import { GeoJsonObject } from 'geojson';
import MapButton from '../../components/mapButton';
import PanoramicViewer from '../../components/panoramic-viewer';
import { useLocation } from 'react-router-dom';
import pj from "./../../../package.json"

interface Layer {
  '@_queryable': string;
  Name: string,
}

function Map() {

  const location = useLocation()

  // Project states
  const[projectId,setProjectId] = useState(location.pathname.split('/map/')[1])
  const[projectSettings,setProjectSettings] = useState({})
  const[layerOrder,setLayerOrder] = useState<string>('')
  const[layers,setLayers] = useState<Array<Layer>>()

  // Info Panel states
  const[displayLeftSidePanel,setdisplayLeftSidePanel] = useState(false)
  const[displayRightSidePanel,setdisplayRightSidePanel] = useState(false)
  const[features,setFeatures] = useState()
  const[isLoadingInfoPanel,setIsLoadingInfoPanel] = useState(false)

  useEffect(() => {

    async function getProjectSettings() {
    
      const projectSettings = await api.get(
        `/settings/${projectId}` 
      )
  
      return projectSettings.data
    }
    
    getProjectSettings()
    .then(settings => {

      setLayerOrder(settings.layerDrawingOrder)
      setLayers(settings.layers.Layer)
      setProjectSettings(settings)
    })
  },[projectId])

  function makeLayers(layers: any, order: string) {

    const content = order.split(',').map(
      (e,i) => {
        
        var layer = createLayer(
          layers.filter((l:any) => (l.Name === e))[0],
          (i === 0)
        )
        return layer
      })

    return content
  }

  function createLayer(layer: any, baseLayer?: boolean) {

    if(!baseLayer) {
      baseLayer = false
    }

    return (
      <WMSTileLayer
        key={layer.Title}
        id={layer.Title}
        url={`/api/map/${projectId}`}
        layers={layer.Name}
        format={baseLayer ? 'image/jpeg' : 'image/png'}
        transparent={!baseLayer}
        maxZoom={30}
        maxNativeZoom={30}
      />
    )
  }

  async function getFeatureInfo(map: any, e: LeafletMouseEvent) {

      var point = map.latLngToContainerPoint(e.latlng)
      var size = map.getSize()
      var crs = map.options.crs
      var sw = crs?.project(map.getBounds().getSouthWest())
      var ne = crs?.project(map.getBounds().getNorthEast())
      var lyrs = layers?.filter(e => e['@_queryable'] === '1').map(e => e.Name)

      var params = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        version: '1.1.0',
        srs: 'EPSG:3857',
        x: JSON.stringify(point.x),
        y: JSON.stringify(point.y),
        bbox: JSON.stringify(sw?.x) + ',' + JSON.stringify(sw?.y) + ',' + JSON.stringify(ne?.x) + ',' + JSON.stringify(ne?.y),
        height: JSON.stringify(size.y),
        width: JSON.stringify(size.x),
        layers: lyrs?.join(','),
        query_layers: lyrs?.join(','),
        info_format: 'application/json',
        with_geometry: 'true',
        feature_count: '50000'
    };

    var queryParams = generateQueryParams(params)

    var response = await api.get(`/map/${projectId}?${queryParams}`)

    var featureInfo = response.data

    setIsLoadingInfoPanel(false)   
    setFeatures(featureInfo.features)
    return featureInfo
  }

  function switchLeftPanel() {

    setdisplayLeftSidePanel(!displayLeftSidePanel)
  }

  function switchRightPanel() {

    setdisplayRightSidePanel(!displayRightSidePanel)
  }

  function measureTool(e: any) {
    console.log('mediremos em breve')
  }

  function streetView(e: any) {
    console.log('veremos em breve')
  }

  const MapHandlers = () => {
    
    useMapEvents({
        click(e) {

          if(!displayLeftSidePanel) {
            setdisplayLeftSidePanel(true)
          }
          setIsLoadingInfoPanel(true) 
          getFeatureInfo(this,e)
        },
    });

    return null;
  };

  return ( 
    <Container>
      <LeftSidePanel display={displayLeftSidePanel}>
        <InfoPanel 
          features={features} 
          isLoading={isLoadingInfoPanel}
        />
      </LeftSidePanel>
      <MiddlePanel>
        <ButtonsContainer>
          <MapButton onClick={measureTool}><FaRulerCombined/></MapButton>
          <MapButton onClick={streetView}>
            <FaStreetView />
          </MapButton>
        </ButtonsContainer>
        <LeftSidePanelSwitcher onClick={switchLeftPanel}>
            {(displayLeftSidePanel)? (<FaCaretLeft/>) : (<FaCaretRight/> )}
        </LeftSidePanelSwitcher>
        <SearchBox features={features} setFeatures={setFeatures}/>
        <MapContainer 
          center={[-19.035721, -43.425698]} 
          zoom={17} 
          scrollWheelZoom={true}
          attributionControl={false}
          >  
          <GeoJSON 
            key={JSON.stringify(Date.now())} 
            data={features!} 
            style={{color: 'red'}}
          />    
          <MapHandlers/>
          {layers && <>
            {
              makeLayers(layers,layerOrder)
            }
          </>}
        </MapContainer>
        <Version>
          <div style={{padding: 4}}>
            webgis-cmd:v.{pj.version} <a href='https://github.com/genteufv/webgis-cmd' target={'_blank'} rel="noreferrer"><FaGithub/> </a>
          </div>
        </Version>
        <RightSidePanelSwitcher onClick={switchRightPanel}>
            {(displayRightSidePanel)? (<FaCaretRight/> ) : (<FaCaretLeft/>)}
        </RightSidePanelSwitcher>
      </MiddlePanel>
      <RightSidePanel display={displayRightSidePanel}>
          <PanoramicViewer></PanoramicViewer>
      </RightSidePanel>
    </Container>
  );
}

export default Map;
