import { Button, Select as AntSelect } from 'antd';
import Icon from '@ant-design/icons';
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useIntl, Link, FormattedMessage } from 'umi';
import { SatItem, SenItem, DataNode, PlanPara, SatSen, PathUnit, SenPath } from './data';
import { querySatTree, querySensorPaths } from './service';
import { Layout, Menu, Breadcrumb, Tree } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
import styles from './index.css';
import logo from '@/assets/logo.png';
import Map from 'ol/Map';
import View from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { getCenter } from 'ol/extent';
import Draw, {
  createBox,
} from 'ol/interaction/Draw';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import Geometry from 'ol/geom/Geometry';
import { Fill, Stroke, Style } from 'ol/style';
import { defaults } from 'ol/interaction';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import Overlay from 'ol/Overlay';
import * as dayjs from 'dayjs'

const { Option } = AntSelect;

const PlanMap: React.FC<{}> = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [checkedSenIds, setCheckedSenIds] = useState<number[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [planningDays, setPlanningDays] = useState<number>(3);
  const refPlanningDays = useRef<number>(planningDays)
  const [satTree, setSatTree] = useState<DataNode[]>()
  const refGraph = useRef<HTMLDivElement>(null)
  const refCloser = useRef<HTMLAnchorElement>(null)
  const refContainer = useRef<HTMLDivElement>(null)
  const refContent = useRef<HTMLDivElement>(null)
  const refSenIds = useRef<number[]>(checkedSenIds)
  const [map, setMap] = useState<Map>();
  const refMap = useRef<Map>()
  const [area, setArea] = useState<Geometry>();
  const refArea = useRef<Geometry>()

  refSenIds.current = checkedSenIds
  refPlanningDays.current = planningDays
  refMap.current = map
  refArea.current = area

  const areaSource = new VectorSource({ wrapX: false });
  const areaLayer = new VectorLayer({
    source: areaSource,
    className: "area",
  });

  const pathSource = new VectorSource({ wrapX: false });
  const pathLayer = new VectorLayer({
    source: pathSource,
    className: "path",
  });

  const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    //target: document.getElementById('mouse-position'),
  });

  useEffect(() => {
    if (refContainer.current == null || refMap.current == undefined) { return }
    const overlay = new Overlay({
      id: "popup",
      element: refContainer.current,
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
      },
    })
    refMap.current.addOverlay(overlay)
  }, [refContainer.current])

  const onPopupCloserClick = function () {
    if (refCloser.current == null || refMap.current === undefined) {
      return
    }
    refMap.current.getOverlayById("popup").setPosition(undefined);
    refCloser.current.blur();
    return false;
  };

  const selectFeature = new Select({
    condition: click,
  });

  const switchToSelect = () => {
    if (refMap.current === undefined) {
      return
    }
    refMap.current.removeInteraction(drawTool)
    selectFeature.on('select', function (e) {
      if (refContent.current == null || refMap.current == null ||
        e.selected.length == 0) {
        onPopupCloserClick()
        return
      }
      const coordinate = getCenter(e.selected[0].getGeometry().getExtent())
      const attr = e.selected[0].get("attributes")
      if (attr === undefined) {
        return
      }
      refContent.current.innerHTML = "<div style='font-size:.8em'>Satellite: " +
        attr["satellite"] + "<br>Sensor: " + attr["sensor"] + "<br>StartTime: " +
        dayjs.unix(attr["starttime"]).format("YYYY-MM-DD HH:mm:ss UTC")
        + "<br>StopTime: " + dayjs.unix(attr["stoptime"]).format("YYYY-MM-DD HH:mm:ss UTC") + "</div>";

      refMap.current.getOverlayById("popup").setPosition(coordinate);
    })
    refMap.current.addInteraction(selectFeature)
  }

  const setAsDrawTool = () => {
    if (refMap.current === undefined) { return }
    refMap.current.removeInteraction(selectFeature)
    refMap.current.addInteraction(drawTool)
  }

  const afterDrawed = (g: Geometry | undefined, senIds: number[], planningDays: number) => {
    let pathLayerSource: VectorSource | undefined = undefined
    if (refMap.current === undefined) { return }
    refMap.current.getLayers().forEach(function (el) {
      if (el.getClassName() === "path") {
        if (el instanceof VectorLayer) {
          pathLayerSource = el.getSource()
          return
        }
      }
    })
    if (refMap.current === undefined || senIds.length == 0 || g === undefined) {
      pathLayerSource.clear()
      return
    }
    let clonedGeo = g.clone()
    clonedGeo.transform("EPSG:900913", "EPSG:4326")
    let ext = clonedGeo.getExtent()
    //query paths
    let startTime = Math.floor(Date.now() / 1000)
    querySensorPaths({
      checkedSenIds: senIds,
      start: startTime,
      stop: startTime + 86400 * planningDays,
      xmin: ext[0],
      xmax: ext[2],
      ymin: ext[1],
      ymax: ext[3],
    } as PlanPara).then(e => {
      if (pathLayerSource === undefined) { return }
      //draw area
      pathLayerSource.clear()
      let leftPoints: number[][] = [], rightPoints: number[][] = []
      let features: Feature<Geometry>[] = []
      e.dataList.forEach((u: PathUnit) => {
        leftPoints = []
        rightPoints = []
        if (u.pathGeo != null && u.pathGeo.length != 0) {
          u.pathGeo.forEach((p: SenPath) => {
            leftPoints.push([p.lon1, p.lat1])
            rightPoints.push([p.lon2, p.lat2])
          })

          let pathPoints = leftPoints.concat(rightPoints.reverse())
          pathPoints.push(leftPoints[0])
          let polygon = new Polygon([pathPoints])
          polygon.transform("EPSG:4326", "EPSG:900913")
          let polygon_style = new Style({
            stroke: new Stroke({
              color: u.hexColor,
              width: 1.5,
            }),
            fill: new Fill({
              color: 'rgba(0, 0, 255, 0.1)',
            }),
          })

          let fea = new Feature({
            geometry: polygon,
            attributes: { "satellite": u.satName, "sensor": u.senName, "starttime": u.start, "stoptime": u.stop }
          })
          fea.setStyle(polygon_style)
          features.push(fea)
        }
      });
      pathLayerSource.addFeatures(features)

      switchToSelect()
    })
  }

  const drawTool = useMemo(() => {
    let draw = new Draw({
      source: areaSource,
      type: "Circle",
      geometryFunction: createBox()
    })
    draw.on('drawstart', (evt) => {
      areaSource.clear()
      pathSource.clear()
      setArea(undefined)
    })
    draw.on('drawend', (evt) => {
      let bounds = evt.feature.getGeometry().clone()
      setArea(bounds)
      afterDrawed(bounds, refSenIds.current, refPlanningDays.current)
    })
    return draw
  }, [])

  useEffect(() => {
    if (refGraph.current == null) {
      return
    }

    setMap(new Map({
      target: refGraph.current,
      interactions: defaults({ dragPan: true, mouseWheelZoom: true }),
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        }),
        areaLayer,
        pathLayer,
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      }),
      controls: defaultControls().extend([mousePositionControl])
    }));
  }, []);

  const rectSvg = () => (
    <svg width="100" height="100" fill="currentColor" strokeWidth="1" stroke="rgb(0,0,0)" viewBox="0 0 1024 1024">
      <rect x="50" y="80" width="100" height="100" />
    </svg>
  );

  const RectIcon = props => <Icon component={rectSvg} {...props} />;

  const getSatTree = async () => {
    querySatTree().then(e => {
      let res = e.dataList?.map((a: SatItem) => {
        let sensors = a.senItems.map((s: SenItem) => {
          return {
            title: s.name,
            key: s.id.toString(),
            icon: <RectIcon style={{ color: s.hexColor }} />,
            isLeaf: true,
          }
        })
        return {
          title: a.name,
          key: a.noardId,
          isLeaf: false,
          children: sensors,
        }
      }) as DataNode[]
      setSatTree(res)
      if (res != undefined && res.length != 0) {
        setExpandedKeys([res[0].key])
      }
    })
  }

  useEffect(() => {
    getSatTree();
  }, [])

  const onExpand = (expandedKeysValue: React.Key[]) => {
    //console.log('onExpand', expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const onCheck = (checkedKeysValue: React.Key[]) => {
    let senIds: number[] = []
    checkedKeysValue.forEach(e => {
      if (!isNaN(Number(e.toString()))) {
        senIds = [...senIds, Number(e)]
      }
    })
    setCheckedKeys(checkedKeysValue);
    setCheckedSenIds(senIds)

    afterDrawed(refArea.current, senIds, refPlanningDays.current)
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider >
        <div className={styles.header}>
          <Link to="/">
            <img alt="logo" className={styles.logo} src={logo} />
            <span className={styles.title}>SatPlan</span>
          </Link>
        </div>
        <Tree className="sat-tree"
          checkable
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          showIcon={true}
          treeData={satTree}
          style={{ color: "#fff", background: "rgb(0,16,32)" }}
        />

      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <span style={{ color: "white" }}>Planning in next : </span>
          <AntSelect defaultValue="3" style={{ width: 120 }} onChange={e => {
            setPlanningDays(Number(e))
            afterDrawed(refArea.current, refSenIds.current, Number(e))
          }}>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
            <Option value="3">3</Option>
            <Option value="4">4</Option>
            <Option value="5">5</Option>
            <Option value="6">6</Option>
            <Option value="7">7</Option>
          </AntSelect>
          <span style={{ color: "white" }}>days    </span>
          <Button type="primary" onClick={setAsDrawTool}>Draw Area</Button>
        </Header>
        <Content style={{ margin: '0 0px' }}>
          <div ref={refGraph} className="map" id="map" style={{ width: '100%', height: '100vh' }}></div>
        </Content>
        <div ref={refContainer} id="popup" className={styles.olPopup}>
          <a href="#" ref={refCloser} onClick={onPopupCloserClick} id="popup-closer"
            className={styles.olPopupCloser}></a>
          <div ref={refContent} id="popup-content"></div>
        </div>
      </Layout>
    </Layout>
  );
};

export default PlanMap;
