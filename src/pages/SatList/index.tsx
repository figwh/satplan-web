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

const { confirm } = Modal;
const { Search } = Input

const handleAdd = async (fields: NewSatParam) => {
  const { formatMessage } = useIntl();
  const hide = message.loading(formatMessage({id:"pages.satTable.satItem.adding"}))
  try {
    await addSat(fields);
    hide;
    message.success(formatMessage({id:"pages.satTable.satItem.addSuccess"}));
    return true;
  } catch (error) {
    hide;
    message.error(formatMessage({id:"pages.satTable.satItem.addFailed"}));
    return false;
  }
};

const handleEditSen = async (senId: number, fields: UpdateSenParam) => {
  const { formatMessage } = useIntl();
  const hide = message.loading(formatMessage({id:"pages.satTable.satItem.updating"}));
  try {
    await updateSen(senId, fields);
    hide;
    message.success(formatMessage({id:"pages.satTable.satItem.updateSuccess"}));
    return true;
  } catch (error) {
    hide;
    message.error(formatMessage({id:"pages.satTable.satItem.updateFailed"}));
    return false;
  }
}

const handleAddSen = async (fields: NewSenParam) => {
  const { formatMessage } = useIntl();
  const hide = message.loading(formatMessage({id:"pages.satTable.satItem.adding"}));
  try {
    await addSen(fields);
    hide;
    message.success(formatMessage({id:"pages.satTable.satItem.addSuccess"}));
    return true;
  } catch (error) {
    hide;
    message.error(formatMessage({id:"pages.satTable.satItem.addFailed"}));
    return false;
  }
}
/**
* updating success
* @param fields
*/
const handleUpdate = async (record: SatListItem, fields: UpdateSatParam) => {
  const { formatMessage } = useIntl();
  const hide = message.loading(formatMessage({id:"pages.satTable.satItem.updating"}));
  try {
    await updateSat(record.id, fields);
    hide;

    message.success(formatMessage({id:"pages.satTable.satItem.updateSuccess"}));
    return true;
  } catch (error) {
    hide;
    message.error(formatMessage({id:"pages.satTable.satItem.updateFailed"}));
    return false;
  }
};

const TableList: React.FC<{}> = () => {
  const { formatMessage } = useIntl();
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

  const columns: ProColumns<SatListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.satTable.satItem.nameLabel"
          defaultMessage="name"
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
      title: 'operation',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            handleUpdateModalVisible(true);
            setEditingSat(record)
          }}
        >
          {formatMessage({
            id: 'pages.satTable.satItem.edit',
            defaultMessage: 'edit',
          })}
        </a>,
        <a
          key="addsen"
          onClick={() => {
            handleSenModalVisible(true)
            setEditingSat(record)
          }}
        >
          {formatMessage({
            id: 'pages.satTable.satItem.addSen',
            defaultMessage: 'add sensor',
          })}
        </a>,
        <a key="delete"
          onClick={async () => {
            confirm({
              title: formatMessage({ id: 'pages.satTable.satItem.delete' }),
              icon: <WarningOutlined />,
              content: (<span>
                {formatMessage({ id: 'pages.satTable.satItem.deleteSatConfirm1' })}
                <i>
                  <b>{record.name}</b>
                </i>
                {formatMessage({ id: 'pages.satTable.satItem.deleteSatConfirm2' })}
              </span>),
              onOk: async () => {
                const hide = message.loading(formatMessage({ id: 'pages.satTable.satItem.deleting' }));
                if (!record.id) return true;
                try {
                  await removeSat(record.id);
                  hide;
                  message.success(formatMessage({ id: 'pages.satTable.satItem.deletend' }));
                  actionRef.current?.reload();
                  return true;
                } catch (error) {
                  hide;
                  message.error(formatMessage({ id: 'pages.satTable.satItem.deletefailed' }));
                  return false;
                }
              },
            });
          }}>
          {formatMessage({ id: 'pages.satTable.satItem.delete' })}
        </a>,
      ],
    },
  ];

  const expandedRowRender = (row: SatListItem) => {
    return (
      <ProTable
        columns={[
          { title: formatMessage({ id: 'pages.satTable.satItem.nameLabel' }), dataIndex: 'name', key: 'name' },
          {
            title: formatMessage({ id: 'pages.satTable.satItem.resolutionLabel' }), dataIndex: 'resolution', key: 'resolution',
          },
          { title: formatMessage({ id: 'pages.satTable.satItem.widthLabel' }), dataIndex: 'width', key: 'width' },
          { title: formatMessage({ id: 'pages.satTable.satItem.leftSideAngleLabel' }), dataIndex: 'leftSideAngle', key: 'leftSideAngle' },
          { title: formatMessage({ id: 'pages.satTable.satItem.rightSideAngleLabel' }), dataIndex: 'rightSideAngle', key: 'rightSideAngle' },
          { title: formatMessage({ id: 'pages.satTable.satItem.initLabel' }), dataIndex: 'initAngle', key: 'initAngle' },
          {
            title: formatMessage({ id: 'pages.satTable.satItem.hexColorLabel' }), dataIndex: 'hexColor',
            key: 'hexColor',
            render: (text, record, _, action) => [
              <span key="color" style={{ backgroundColor: record.hexColor }}>{record.hexColor.toUpperCase()}</span>
            ]
          },
          {
            title: formatMessage({ id: 'pages.satTable.satItem.operation' }),
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
                {formatMessage({ id: 'pages.satTable.satItem.editSat' })}
              </a>,
              <a key="delete"
                onClick={async () => {
                  confirm({
                    title: formatMessage({ id: 'pages.satTable.satItem.delete' }),
                    icon: <WarningOutlined />,
                    content: (<span>
                      {formatMessage({ id: 'pages.satTable.satItem.deleteSenConfirm1' })}
                      <i>
                        <b>{record.name}</b>
                      </i>{' '}
                      {formatMessage({ id: 'pages.satTable.satItem.deleteSenConfirm2' })}
                    </span>),
                    onOk: async () => {
                      const hide = message.loading(formatMessage({ id: 'pages.satTable.satItem.deleting' }));
                      if (!record.id) return true;
                      try {
                        await removeSen(record.id);
                        hide;
                        message.success(formatMessage({ id: 'pages.satTable.satItem.deletend' }));
                        actionRef.current?.reload();
                        return true;
                      } catch (error) {
                        hide;
                        message.error(formatMessage({ id: 'pages.satTable.satItem.deletefailed' }));
                        return false;
                      }
                    },
                  });
                }}>
                {formatMessage({ id: 'pages.satTable.satItem.delete' })}
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
              {formatMessage({ id: 'pages.satTable.newSat' })}
            </Button>
          </Col>
          <Col flex="100px" className="addSat">
            <Button
              icon={<ReloadOutlined />}
              style={{ marginRight: 8 }}
              onClick={async () => {
                const hide = message.loading(formatMessage({ id: 'pages.satTable.updatingTLE' }));
                try {
                  await updateTles();
                  hide;
                  message.success(formatMessage({ id: 'pages.satTable.updatingSuccess' }));
                  return true;
                } catch (error) {
                  hide;
                  message.error(formatMessage({ id: 'pages.satTable.updatingFailed' }));
                  return false;
                }
              }}
            >
              {formatMessage({ id: 'pages.satTable.updateTLE' })}
            </Button>
          </Col>
          <Col flex="100px" className="addSat">
            <Button
              icon={<ReloadOutlined />}
              style={{ marginRight: 8 }}
              onClick={() => actionRef.current?.reload()}
            >
              {formatMessage({ id: 'pages.satTable.refresh' })}
            </Button>
          </Col>
          <Col flex="auto" className="querySat">
            <Search placeholder={formatMessage({ id: 'pages.satTable.satItem.querykeyword' })}
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
              {formatMessage({ id: 'pages.satTable.satItem.selected1' })}   {selectedRowKeys.length} {formatMessage({ id: 'pages.satTable.satItem.selected2' })}
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                {formatMessage({ id: 'pages.satTable.satItem.cancelSelection' })}
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
                    title: formatMessage({ id: 'pages.satTable.satItem.delete' }),
                    icon: <WarningOutlined />,
                    content: (<span>
                      {formatMessage({ id: 'pages.satTable.satItem.deleteconfirm1' })} {' '}
                      <i>
                        <b>{selectedRowsState.map(row => row.name).join(',')}</b>
                      </i>{' '}
                      {formatMessage({ id: 'pages.satTable.satItem.deleteconfirm2' })}
                    </span>),
                    onOk: async () => {
                      const hide = message.loading(formatMessage({ id: 'pages.satTable.satItem.deleting' }));
                      if (!selectedRowsState) return true;
                      try {
                        await batRemoveSat(selectedRowsState.map(row => row.id));
                        hide;
                        message.success(formatMessage({ id: 'pages.satTable.satItem.deletend' }));
                        setSelectedRows([]);
                        actionRef.current?.reloadAndRest?.();
                        return true;
                      } catch (error) {
                        hide;
                        message.error(formatMessage({ id: 'pages.satTable.satItem.deletefailed' }));
                        return false;
                      }
                    },
                  })
                }}>
                {formatMessage({ id: 'pages.satTable.satItem.batDelete' })}
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
