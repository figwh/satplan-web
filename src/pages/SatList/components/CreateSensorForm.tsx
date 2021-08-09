import { ModalForm, ProFormTextArea,ProFormDigit, ProFormText } from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { NewSenParam } from '../data';
import { Modal, Form, Input, Checkbox, Select } from 'antd'
import ProForm from '@ant-design/pro-form';
import ColorButton from './colorButton'
import React, { useEffect, useState, useMemo, useRef } from 'react';

interface CreateSensorFormProps {
  satName: string;
  modalVisible: boolean;
  onCancel: () => void;
  onOk: (value: NewSenParam) => Promise<boolean>;
}

const CreateSensorForm: React.FC<CreateSensorFormProps> = (props) => {
  const { satName, modalVisible, onCancel, onOk } = props;
  const [senColor, setSenColor] = useState<string>("#000000")
  const intl = useIntl();
  const [form] = Form.useForm();

  return (
    <ModalForm
      form={form}
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      title={intl.formatMessage({
        id: 'pages.satTable.newSen',
        defaultMessage: '新建载荷',
      })}
      width="700px"
      labelAlign='right'
      visible={modalVisible}
      modalProps={{
        onCancel: onCancel
      }}
      onFinish={async (value) => {
        console.log(value)
        onOk({
          hexColor: senColor,
          ...value
        } as NewSenParam).then(() => { form.resetFields() })
      }}
    >
      <ProForm.Group>
        <ProFormText
          width="sm"
          name="satName"
          label="卫星名"
          initialValue={satName}
          disabled={true}
          placeholder="卫星名"
        />
        <ProFormText
          width="sm"
          name="name"
          label="载荷名"
          placeholder="载荷名"
          required={true}
        />
        <ProFormDigit
          width="sm"
          name="resolution"
          label="分辨率"
          initialValue={0}
          placeholder="分辨率"
          required={true}
        />
        <ProFormDigit
          width="sm"
          name="width"
          label="幅宽"
          initialValue={0}
          placeholder="幅宽"
          required={true}
        />
        <ProFormDigit
          width="sm"
          name="leftSideAngle"
          label="左侧摆角"
          initialValue={0}
          placeholder="左侧摆角"
        />
        <ProFormDigit
          width="sm"
          name="rightSideAngle"
          label="右侧摆角"
          initialValue={0}
          placeholder="右侧摆角"
        />
        <ProFormDigit
          width="sm"
          name="initAngle"
          label="安装角"
          initialValue={0}
          placeholder="安装角"
        />
        <Form.Item name="satColor" label="颜色">
          <ColorButton initColor={"#FFFFFF"} onValueChanged={(c) => {
            setSenColor(c)
          }} />
        </Form.Item>
      </ProForm.Group>
    </ModalForm>
  );
};

export default CreateSensorForm;
