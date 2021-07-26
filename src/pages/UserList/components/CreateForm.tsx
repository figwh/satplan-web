import React from 'react';
import { ModalForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { NewUserParam } from '../data';
import { Modal, Form, Input, Checkbox, Select } from 'antd'

interface CreateFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  onOk: (value: NewUserParam) => Promise<boolean>;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { modalVisible, onCancel,  onOk } = props;
  const intl = useIntl();
  const [form] = Form.useForm();

  return (
    <ModalForm
      form={form}
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      title={intl.formatMessage({
        id: 'pages.userTable.newUser',
        defaultMessage: '新建用户',
      })}
      width="500px"
      labelAlign='right'
      visible={modalVisible}
      modalProps={{
        onCancel: onCancel
      }}
      onFinish={async (value) => {
        onOk(value as NewUserParam).then(() => { form.resetFields() })
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
        label="姓名"
        placeholder="姓名"
      />
      <ProFormText
        width="md"
        name="password"
        label="密码"
        placeholder="选填，默认密码：12345678"
      />
      <ProFormCheckbox
        colon={false}
        name="isAdmin"
        label="  "
      >设为管理员</ProFormCheckbox>
    </ModalForm>
  );
};

export default CreateForm;
