import { Button, Space, message, Input, Row, Col, Modal, Drawer } from 'antd';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { SatItem,SenItem,DataNode } from './data';
import { querySatTree } from './service';
import { Layout, Menu, Breadcrumb, Tree } from 'antd';
const { Header, Content, Footer, Sider } = Layout;
import './index.css';
import Map from 'ol/Map';
import View from 'ol/View';
import Proj from 'ol/proj';
import Source from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

const PlanMap: React.FC<{}> = () => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['0-0-0', '0-0-1']);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(['0-0-0']);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [satTree, setSatTree] = useState<DataNode[]>()
  const refGraph = useRef<HTMLDivElement>(null)
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (refGraph.current == null) {
      return
    }
    new Map({
      target: refGraph.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });
  });

  const getSatTree = async () => {
    querySatTree().then(e => {
      let res = e.dataList?.map((a: SatItem) => {
        let sensors = a.senItems.map((s: SenItem) => {
          return {
            title: s.name,
            key: s.id,
            isLeaf: true,
          }
        })
        return {
          title: a.name,
          key: a.noardId,
          isLeaf: false,
          children: sensors,
        }
      })
      setSatTree(res)
    })
  }

  useEffect(() => {
    getSatTree();
  }, [])

  const onExpand = (expandedKeysValue: React.Key[]) => {
    console.log('onExpand', expandedKeysValue);
    // if not set autoExpandParent to false, if children expanded, parent can not collapse.
    // or, you can remove all expanded children keys.
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };


  const onCheck = (checkedKeysValue: React.Key[]) => {
    console.log('onCheck', checkedKeysValue);
    setCheckedKeys(checkedKeysValue);
  };

  const onSelect = (selectedKeysValue: React.Key[], info: any) => {
    console.log('onSelect', info);
    setSelectedKeys(selectedKeysValue);
  };


  /**
   * 国际化配置
   */
  const intl = useIntl();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider >
        <div className="logo" />
        <Tree className="sat-tree"
          checkable
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          onSelect={onSelect}
          selectedKeys={selectedKeys}
          treeData={satTree}
          style={{ color: "#fff", background: "rgb(0,16,32)" }}
        />

      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }} />
        <Content style={{ margin: '0 0px' }}>
          <div ref={refGraph} className="map" id="map" ></div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PlanMap;
