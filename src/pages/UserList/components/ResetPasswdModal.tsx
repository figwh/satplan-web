import React from 'react';
import { ModalForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { ResetPasswordParam, UserListItem } from '../data';
import { Modal, Form, Input, Checkbox, Select } from 'antd'

interface ResetPasswdModalProps {
  modalVisible: boolean;
  onCancel: () => void;
  editingRecord: UserListItem,
  onOk: (param: ResetPasswordParam) => void;
}

const ResetPasswdModal: React.FC<ResetPasswdModalProps> = (props) => {
  const { modalVisible, editingRecord, onCancel, onOk } = props;
  const intl = useIntl();

  return (
    <ModalForm
      layout="vertical"
      title={intl.formatMessage({
        id: 'pages.userTable.userItem.resetPasswd',
        defaultMessage: '重置密码',
      })}
      width="400px"
      labelAlign='right'
      visible={modalVisible}
      modalProps={{
        onCancel: onCancel
      }}
      onFinish={(value) => {
        return new Promise((resolve) => {
          onOk(value as ResetPasswordParam)
          resolve()
        })
      }}
    >
      <ProFormText
        hidden={true}
        width="md"
        name="id"
        label="用户id"
        initialValue={editingRecord.id}
      />
      <ProFormText.Password
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id='pages.userTable.userItem.inputNewPasswd'
                defaultMessage="请输入新密码"
              />
            ),
          },
        ]}
        width="md"
        name="newPassword"
        label={<span>请输入用户{' '}
          <i>
            <b>{editingRecord.name}</b>
          </i>{' '}
  的新密码：
        </span>
        }
        placeholder="请输入新密码"
      />
    </ModalForm >
  );
};

export default ResetPasswdModal;
