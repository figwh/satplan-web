import { Button, Space, message, Input, Row, Col, Modal, Drawer } from 'antd';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { ModalForm, ProFormCheckbox, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import ProDescriptions, { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import UpdateForm from './components/UpdateForm';
import CreateForm from './components/CreateForm';
import ResetPasswdModal from './components/ResetPasswdModal';
import { NewUserParam, UserListItem, UpdateUserParam, ResetPasswordParam } from './data';
import { ReloadOutlined, PlusOutlined, WarningOutlined } from '@ant-design/icons';
import { queryUser, updateUser, addUser, batRemoveUser, removeUser, resetPassword } from './service';
import { getUserData } from '../../utils/authority'
import { CurrentUser } from '../../models/user'
import Password from 'antd/lib/input/Password';

const { confirm } = Modal;
const { Search } = Input

const handleAdd = async (fields: NewUserParam) => {
  const hide = message.loading('正在添加');
  try {
    await addUser(fields);
    hide;
    message.success('添加成功');
    return true;
  } catch (error) {
    hide;
    message.error('添加失败，请重试！');
    return false;
  }
};

/**
* 更新用户
* @param fields
*/
const handleUpdate = async (record: UserListItem, fields: UpdateUserParam) => {
  const hide = message.loading('正在更新');
  try {
    await updateUser(record.id, fields);
    hide;

    message.success('配置成功');
    return true;
  } catch (error) {
    hide;
    message.error('配置失败请重试！');
    return false;
  }
};

/**
* 重置用户密码
* @param fields
*/
const handleResetPasswd = async (param: ResetPasswordParam) => {
  const hide = message.loading('正在更新');
  try {
    await resetPassword(param.id, param.newPassword);
    hide;

    message.success('配置成功');
    return true;
  } catch (error) {
    hide;
    message.error('配置失败请重试！');
    return false;
  }
};

const deletable = (record: UserListItem, currentUser: CurrentUser | undefined) => {
  if (currentUser === undefined) {
    return false
  } else {
    //return record.adminId !== 0 && record.id !== currentUser.id
    return record.id !== currentUser.id
  }
}


const TableList: React.FC<{}> = () => {
  /**
   * 新建窗口的弹窗
   */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [resetPasswdModalVisible, handleResetPasswdModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<UserListItem | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>('');

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<UserListItem>();
  const [selectedRowsState, setSelectedRows] = useState<UserListItem[]>([]);

  /**
   * 国际化配置
   */
  const intl = useIntl();
  const currentUserData = getUserData();

  const columns: ProColumns<UserListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.userTable.userItem.nameLabel"
          defaultMessage="姓名"
        />
      ),
      dataIndex: 'name',
    },
    {
      title: <FormattedMessage id="pages.userTable.userItem.emailLabel"
        defaultMessage="邮箱" />,
      dataIndex: 'email',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            handleUpdateModalVisible(true);
            setEditingRecord(record)
          }}
        >
          编辑
        </a>,
        <a key="delete"
          style={deletable(record, currentUserData) ? {} : { display: 'none' }}
          onClick={async () => {
            confirm({
              title: '删除',
              icon: <WarningOutlined />,
              content: (<span>
                确定要删除用户{' '}
                <i>
                  <b>{record.name}</b>
                </i>{' '}
                吗？
              </span>),
              onOk: async () => {
                const hide = message.loading('正在删除');
                if (!record.id) return true;
                try {
                  await removeUser(record.id);
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
        <a key="resetPassword"
          style={deletable(record, currentUserData) ? {} : { display: 'none' }}
          onClick={() => {
            handleResetPasswdModalVisible(true);
            setEditingRecord(record)
          }}>
          重置密码
        </a >,
      ],
    },
  ];

  return (
    <PageContainer>
      <div className="userListHeader">
        <Row style={{ marginBottom: 8 }}>
          <Col flex="100px" className="addUser">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ marginRight: 8 }}
              onClick={() => handleModalVisible(true)}
            >
              新建
          </Button>
          </Col>
          <Col flex="100px" className="addUser">
            <Button
              icon={<ReloadOutlined />}
              style={{ marginRight: 8 }}
              onClick={() => actionRef.current?.reload()}
            >
              刷新
          </Button>
          </Col>
          <Col flex="auto" className="queryUser">
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
      <ProTable<UserListItem>
        actionRef={actionRef}
        rowKey="email"
        search={false}
        toolBarRender={false}
        request={() => queryUser()}
        postData={(data) => {
          return data.filter(
            a => a.email.toUpperCase().indexOf(keyword.toUpperCase()) !== -1 ||
              a.name.toUpperCase().indexOf(keyword.toUpperCase()) !== -1)
        }}
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
                      确定要删除用户{' '}
                      <i>
                        <b>{selectedRowsState.map(row => row.name).join(',')}</b>
                      </i>{' '}
                    吗？
                    </span>),
                    onOk: async () => {
                      const hide = message.loading('正在删除');
                      if (!selectedRowsState) return true;
                      try {
                        await batRemoveUser(selectedRowsState.map(row => row.id));
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
          const success = await handleAdd(value as NewUserParam);
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
      {editingRecord !== undefined ? (
        <UpdateForm
          modalVisible={updateModalVisible}
          onCancel={() => {
            handleModalVisible(false)
            setEditingRecord(undefined)
          }}
          editingRecord={editingRecord}
          onOk={async (editingRecord, value) => {
            const success = await handleUpdate(editingRecord, value as UpdateUserParam);
            if (success) {
              handleResetPasswdModalVisible(false);
              setEditingRecord(undefined);
            }
          }}
        >
        </UpdateForm>
      ) : null}
      {editingRecord !== undefined ? (
        <ResetPasswdModal
          modalVisible={resetPasswdModalVisible}
          onCancel={() => {
            handleModalVisible(false)
            setEditingRecord(undefined)
          }}
          editingRecord={editingRecord}
          onOk={async (value) => {
            const success = await handleResetPasswd(value as ResetPasswordParam);
            if (success) {
              handleUpdateModalVisible(false);
              setEditingRecord(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        >
        </ResetPasswdModal>
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
          <ProDescriptions<UserListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<UserListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
