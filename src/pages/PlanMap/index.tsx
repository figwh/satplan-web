import { Button, Select } from 'antd';
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
import Draw, {
  createBox,
  createRegularPolygon,
} from 'ol/interaction/Draw';
import Proj from 'ol/proj';
import Source from 'ol/source';
import XYZ from 'ol/source/XYZ';
import * as olExtent from 'ol/extent';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
const { Option } = Select;

//TODO
/*
1. add pan control
2. add path layer, area layer
3. add switch control function
4. add path drawing
5. add calling api to get path 
6. add custom control to display path details
*/
const PlanMap: React.FC<{}> = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [checkedSenIds, setCheckedSenIds] = useState<number[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [planningDays, setPlanningDays] = useState<number>(3);
  const refPlanningDays = useRef<number>(planningDays)
  const [satTree, setSatTree] = useState<DataNode[]>()
  const refGraph = useRef<HTMLDivElement>(null)
  const refSenIds = useRef<number[]>(checkedSenIds)
  const [draw, setDraw] = useState<Draw>();
  const [map, setMap] = useState<Map>();
  const [area, setArea] = useState<Geometry>();
  const [pathUnits, setPathUnits] = useState<PathUnit[]>();
  const { formatMessage } = useIntl();

  refSenIds.current = checkedSenIds
  refPlanningDays.current = planningDays

  const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    //target: document.getElementById('mouse-position'),
  });

  const areaSource = new VectorSource({ wrapX: false });
  const areaLayer = new VectorLayer({
    source: areaSource,
  });

  const pathSource = new VectorSource({ wrapX: false });
  const pathLayer = new VectorLayer({
    source: pathSource,
  });

  const addInteraction = () => {
    if (map === undefined) { return }
    setDraw(new Draw({
      source: areaSource,
      type: "Circle",
      geometryFunction: createBox()
    }));
    if (draw === undefined) { return }
    map.addInteraction(draw);
  }

  const switchToPan = () => {
    if (map === undefined || draw === undefined) { return }
    map.removeInteraction(draw)
  }

  const afterDrawed = (g: Geometry, senIds: number[], planningDays: number) => {
    let clonedGeo = g.clone()
    clonedGeo.transform("EPSG:900913", "EPSG:4326")
    let ext = clonedGeo.getExtent()
    //query paths
    querySensorPaths({
      checkedSenIds: senIds,
      start: 1517512450,
      stop: 1517512450 + 86400 * planningDays,
      xmin: ext[0],
      xmax: ext[2],
      ymin: ext[1],
      ymax: ext[3],
    } as PlanPara).then(e => {
      setPathUnits(e.dataList as PathUnit[])
      //draw area
      pathSource.clear()
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
      pathSource.addFeatures(features)
    })
  }
  
  useEffect(() => {
    if (refGraph.current == null) {
      return
    }
    let draw = new Draw({
      source: areaSource,
      type: "Circle",
      geometryFunction: createBox()
    })
    draw.on('drawstart', (evt) => {
      areaSource.clear()
      setArea(undefined)
      pathSource.clear()
      setPathUnits(undefined)
    })
    draw.on('drawend', (evt) => {
      let bounds = evt.feature.getGeometry().clone()
      setArea(bounds)
      afterDrawed(bounds, refSenIds.current, refPlanningDays.current)
    })

    setMap(new Map({
      target: refGraph.current,
      interactions: [draw],
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
      if (res.length != 0) {
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

    if (area != undefined && senIds.length != 0) {
      afterDrawed(area, senIds, refPlanningDays.current)
    }
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    //console.log('onSelect', info);
    //setSelectedKeys(selectedKeysValue);
  };

  /**
   * 国际化配置
   */
  const intl = useIntl();

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
          //onSelect={onSelect}
          selectedKeys={selectedKeys}
          treeData={satTree}
          style={{ color: "#fff", background: "rgb(0,16,32)" }}
        />

      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <span style={{ color: "white" }}>Planning in next : </span>
          <Select defaultValue="3" style={{ width: 120 }} onChange={e => {
            setPlanningDays(Number(e))
          }}>
            <Option value="1">1</Option>
            <Option value="2">2</Option>
            <Option value="3">3</Option>
            <Option value="4">4</Option>
            <Option value="5">5</Option>
            <Option value="6">6</Option>
            <Option value="7">7</Option>
          </Select>
          <span style={{ color: "white" }}>days</span>
          <Button type="primary">Draw Area</Button>
        </Header>
        <Content style={{ margin: '0 0px' }}>
          <div ref={refGraph} className="map" id="map" style={{ width: '100%', height: '100vh' }}></div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PlanMap;
