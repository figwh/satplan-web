import React from 'react';
import { ModalForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { UpdateUserParam, UserListItem } from '../data';

interface UpdateFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  editingRecord: UserListItem,
  onOk: (record: UserListItem, value: UpdateUserParam) => void;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { modalVisible, onCancel, editingRecord, onOk } = props;
  const intl = useIntl();

  return (
    <ModalForm
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      title={intl.formatMessage({
        id: 'pages.userTable.editUser',
        defaultMessage: '编辑用户',
      })}
      width="500px"
      visible={modalVisible}
      modalProps={{
        onCancel: onCancel
      }}
      onFinish={(value) => {
        return new Promise((resolve) => {
          onOk(editingRecord, value as UpdateUserParam)
          resolve()
        })
      }}
    >
      <ProFormText
        rules={[
          {
            required: true,
            type: 'email',
            message: (
              <FormattedMessage
                id="pages.userTable.emailRule"
                defaultMessage="请输入正确的邮箱格式"
              />
            ),
          },
        ]}
        width="md"
        name="email"
        label="邮箱"
        placeholder="邮箱"
        disabled={true}
        initialValue={editingRecord.email}
      />
      <ProFormText
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage
                id="pages.userTable.userNameRule"
                defaultMessage="请输入姓名"
              />
            ),
          },
        ]}
        width="md"
        name="userName"
        initialValue={editingRecord.name}
        label="姓名"
        placeholder="姓名"
      />
      <ProFormCheckbox
        colon={false}
        name="isAdmin"
        label="         "
        initialValue={editingRecord.isAdmin}
      >设为管理员</ProFormCheckbox>
    </ModalForm>
  );
};

export default UpdateForm;
