import { Button, Space, message, Input, Row, Col, Modal, Drawer } from 'antd';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import UpdateForm from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import CreateSensorForm from './components/CreateSensorForm';
import {
  NewSatParam, SatListItem, UpdateSatParam,
  NewSenParam, SenItemInfo, UpdateSenParam
} from './data';
import { ReloadOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import {
  querySat, updateSat, updateTles, addSat, addSen, updateSen,
  batRemoveSat, removeSat, removeSen
} from './service';
import { getUserData } from '../../utils/authority'
import { CurrentUser } from '../../models/user'

const { confirm } = Modal;
const { Search } = Input

const handleAdd = async (fields: NewSatParam) => {
  const hide = message.loading('正在添加');
  try {
    await addSat(fields);
    hide;
    message.success('添加成功');
    return true;
  } catch (error) {
    hide;
    message.error('添加失败，请重试！');
    return false;
  }
};

const handleEditSen = async (senId: number, fields: UpdateSenParam) => {
  const hide = message.loading('正在更新');
  try {
    await updateSen(senId, fields);
    hide;
    message.success('添加成功');
    return true;
  } catch (error) {
    hide;
    message.error('添加失败，请重试！');
    return false;
  }
}

const handleAddSen = async (fields: NewSenParam) => {
  const hide = message.loading('正在添加');
  try {
    await addSen(fields);
    hide;
    message.success('添加成功');
    return true;
  } catch (error) {
    hide;
    message.error('添加失败，请重试！');
    return false;
  }
}
/**
* 更新卫星
* @param fields
*/
const handleUpdate = async (record: SatListItem, fields: UpdateSatParam) => {
  const hide = message.loading('正在更新');
  try {
    await updateSat(record.id, fields);
    hide;

    message.success('配置成功');
    return true;
  } catch (error) {
    hide;
    message.error('配置失败请重试！');
    return false;
  }
};

const deletable = (record: SatListItem, currentUser: CurrentUser | undefined) => {
  if (currentUser === undefined) {
    return false
  } else {
    //return record.adminId !== 0 && record.id !== currentSat.id
    return record.id !== currentUser.id
  }
}


const TableList: React.FC<{}> = () => {
  /**
   * 新建窗口的弹窗
   */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [createSenModalVisible, handleSenModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [editingSat, setEditingSat] = useState<SatListItem | undefined>(undefined);
  const [editingSen, setEditingSen] = useState<SenItemInfo | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>('');

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<SatListItem>();
  const [selectedRowsState, setSelectedRows] = useState<SatListItem[]>([]);

  /**
   * 国际化配置
   */
  const intl = useIntl();
  const currentUserData = getUserData();

  const columns: ProColumns<SatListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.satTable.satItem.nameLabel"
          defaultMessage="名称"
        />
      ),
      dataIndex: 'name',
    },
    {
      title: <FormattedMessage id="pages.satTable.satItem.noardIdLabel"
        defaultMessage="NoardID" />,
      dataIndex: 'noardId',
    },
    {
      title: <FormattedMessage id="pages.satTable.satItem.hexColorLabel"
        defaultMessage="HexColor" />,
      dataIndex: 'hexColor',
      render: (text, record, _, action) => [
        <span key="color" style={{ backgroundColor: record.hexColor }}>{record.hexColor.toUpperCase()}</span>
      ]
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            handleUpdateModalVisible(true);
            setEditingSat(record)
          }}
        >
          编辑
        </a>,
        <a
          key="addsen"
          onClick={() => {
            handleSenModalVisible(true)
            setEditingSat(record)
          }}
        >
          添加载荷
         </a>,
        <a key="delete"
          onClick={async () => {
            confirm({
              title: '删除',
              icon: <WarningOutlined />,
              content: (<span>
                确定要删除卫星{' '}
                <i>
                  <b>{record.name}</b>
                </i>{' '}
                吗？
              </span>),
              onOk: async () => {
                const hide = message.loading('正在删除');
                if (!record.id) return true;
                try {
                  await removeSat(record.id);
                  hide;
                  message.success('删除成功，即将刷新');
                  actionRef.current?.reload();
                  return true;
                } catch (error) {
                  hide;
                  message.error('删除失败，请重试');
                  return false;
                }
              },
            });
          }}>
          删除
        </a>,
      ],
    },
  ];

  const expandedRowRender = (row: SatListItem) => {
    return (
      <ProTable
        columns={[
          { title: '名称', dataIndex: 'name', key: 'name' },
          {
            title: '分辨率', dataIndex: 'resolution', key: 'resolution',
          },
          { title: '幅宽', dataIndex: 'width', key: 'width' },
          { title: '左侧摆角', dataIndex: 'leftSideAngle', key: 'leftSideAngle' },
          { title: '右侧摆角', dataIndex: 'rightSideAngle', key: 'rightSideAngle' },
          { title: '安装角', dataIndex: 'initAngle', key: 'initAngle' },
          {
            title: 'HexColor', dataIndex: 'hexColor',
            key: 'hexColor',
            render: (text, record, _, action) => [
              <span key="color" style={{ backgroundColor: record.hexColor }}>{record.hexColor.toUpperCase()}</span>
            ]
          },
          {
            title: '操作',
            valueType: 'option',
            render: (text, record, _, action) => [
              <a
                key="editable"
                onClick={() => {
                  setEditingSen(record)
                  setEditingSat(row)
                  handleSenModalVisible(true);
                }}
              >
                编辑
              </a>,
              <a key="delete"
                onClick={async () => {
                  confirm({
                    title: '删除',
                    icon: <WarningOutlined />,
                    content: (<span>
                      确定要删除载荷{' '}
                      <i>
                        <b>{record.name}</b>
                      </i>{' '}
                     吗？
                    </span>),
                    onOk: async () => {
                      const hide = message.loading('正在删除');
                      if (!record.id) return true;
                      try {
                        await removeSen(record.id);
                        hide;
                        message.success('删除成功，即将刷新');
                        actionRef.current?.reload();
                        return true;
                      } catch (error) {
                        hide;
                        message.error('删除失败，请重试');
                        return false;
                      }
                    },
                  });
                }}>
                删除
             </a>,
            ]
          },
        ]}
        rowKey="name"
        headerTitle={false}
        search={false}
        options={false}
        dataSource={row.senItems}
        pagination={false}
      />
    );
  };

  return (
    <PageContainer>
      <div className="satListHeader">
        <Row style={{ marginBottom: 8 }}>
          <Col flex="100px" className="addSat">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginRight: 8 }}
              onClick={() => handleModalVisible(true)}
            >
              新建
          </Button>
          </Col>
          <Col flex="100px" className="addSat">
            <Button
              icon={<ReloadOutlined />}
              style={{ marginRight: 8 }}
              onClick={async () => {
                const hide = message.loading('正在更新');
                try {
                  await updateTles();
                  hide;
                  message.success('更新成功');
                  return true;
                } catch (error) {
                  hide;
                  message.error('更新失败，请重试');
                  return false;
                }
              }}
            >
              更新 TLE
          </Button>
          </Col>
          <Col flex="100px" className="addSat">
            <Button
              icon={<ReloadOutlined />}
              style={{ marginRight: 8 }}
              onClick={() => actionRef.current?.reload()}
            >
              刷新
          </Button>
          </Col>
          <Col flex="auto" className="querySat">
            <Search placeholder="输入关键字查询"
              onChange={e => {
                if (e.target.value === undefined || e.target.value === '') {
                  setKeyword('')
                  actionRef.current?.reload()
                }
              }}
              onSearch={e => {
                setKeyword(e)
                actionRef.current?.reload()
              }}
              enterButton />
          </Col>
        </Row>
      </div>
      <ProTable<SatListItem>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={false}
        request={() => querySat()}
        postData={(data) => {
          return data.filter(
            a => a.name.toUpperCase().indexOf(keyword.toUpperCase()) !== -1)
        }}
        expandedRowRender={(record) => expandedRowRender(record)}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
        tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选 {selectedRowKeys.length} 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <a
                onClick={async () => {
                  confirm({
                    title: '删除',
                    icon: <WarningOutlined />,
                    content: (<span>
                      确定要删除卫星{' '}
                      <i>
                        <b>{selectedRowsState.map(row => row.name).join(',')}</b>
                      </i>{' '}
                    吗？
                    </span>),
                    onOk: async () => {
                      const hide = message.loading('正在删除');
                      if (!selectedRowsState) return true;
                      try {
                        await batRemoveSat(selectedRowsState.map(row => row.id));
                        hide;
                        message.success('删除成功，即将刷新');
                        setSelectedRows([]);
                        actionRef.current?.reloadAndRest?.();
                        return true;
                      } catch (error) {
                        hide;
                        message.error('删除失败，请重试');
                        return false;
                      }
                    },
                  })
                }}>
                批量删除
          </a>
            </Space>
          );
        }}
      />
      <CreateForm
        modalVisible={createModalVisible}
        onCancel={() => handleModalVisible(false)}
        onOk={async (value) => {
          const success = await handleAdd(value as NewSatParam);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
          return success
        }}
      >
      </CreateForm>
      {editingSat !== undefined ? (
        <UpdateForm
          modalVisible={updateModalVisible}
          onCancel={() => {
            handleModalVisible(false)
            setEditingSat(undefined)
          }}
          editingRecord={editingSat}
          onOk={async (editingSat, value) => {
            const success = await handleUpdate(editingSat, value as UpdateSatParam);
            if (success) {
              setEditingSat(undefined);
            }
          }}
        >
        </UpdateForm>
      ) : null}
      {editingSen !== undefined || editingSat !== undefined ? (
        <CreateSensorForm
          satName={editingSat === undefined ? "" : editingSat.name}
          editingRecord={editingSen}
          modalVisible={createSenModalVisible}
          onCancel={() => {
            handleSenModalVisible(false)
            setEditingSat(undefined)
          }}
          onOk={async (value) => {
            let success = false
            if (editingSen === undefined) {
              //add sen
              success = await handleAddSen({
                ...value,
                satId: editingSat === undefined ? "" : editingSat.noardId
              } as NewSenParam);
            } else {
              //update sen
              success = await handleEditSen(
                editingSen.id,
                {
                  ...value
                } as UpdateSenParam);
            }
            if (success) {
              handleSenModalVisible(false);
              setEditingSat(undefined)
              setEditingSen(undefined)
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
            return success
          }}
        >
        </CreateSensorForm>
      ) : null}

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<SatListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<SatListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
