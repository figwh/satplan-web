import React from 'react';
import { ModalForm, ProFormTextArea, ProFormText } from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { NewSatParam } from '../data';
import { Modal, Form,  Input, Checkbox, Select } from 'antd'

interface CreateFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  onOk: (value: NewSatParam) => Promise<boolean>;
}

const CreateForm: React.FC<CreateFormProps> = (props) => {
  const { modalVisible, onCancel, onOk } = props;
  const intl = useIntl();
  const [form] = Form.useForm();

  return (
    <ModalForm
      form={form}
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      title={intl.formatMessage({
        id: 'pages.satTable.newSat',
        defaultMessage: '新建卫星',
      })}
      width="700px"
      labelAlign='right'
      visible={modalVisible}
      modalProps={{
        onCancel: onCancel
      }}
      onFinish={async (value) => {
        onOk(value as NewSatParam).then(() => { form.resetFields() })
      }}
    >
      <ProFormTextArea
        rules={[
          {
            required: true,
          },
        ]}
        width="lg"
        name="tle"
        label="TLE"
        placeholder="TLE"
      />
      <ProFormText
        width="md"
        name="satName"
        label="卫星名"
        placeholder="卫星名"
      />
    </ModalForm>
  );
};

export default CreateForm;
