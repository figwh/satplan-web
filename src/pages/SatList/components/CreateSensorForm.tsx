import { ModalForm, ProFormTextArea, ProFormDigit, ProFormText } from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { NewSenParam, SenItemInfo, UpdateSenParam } from '../data';
import { Modal, Form, Input, Checkbox, Select } from 'antd'
import ProForm from '@ant-design/pro-form';
import ColorButton from './colorButton'
import React, { useEffect, useState, useMemo, useRef } from 'react';

interface CreateSensorFormProps {
  editingRecord: SenItemInfo | undefined;
  satName: string;
  modalVisible: boolean;
  onCancel: () => void;
  onOk: (value: NewSenParam | UpdateSenParam) => Promise<boolean>;
}

const CreateSensorForm: React.FC<CreateSensorFormProps> = (props) => {
  const { editingRecord, satName, modalVisible, onCancel, onOk } = props;
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
        if (editingRecord === undefined) {
          onOk({
            hexColor: senColor,
            ...value
          } as NewSenParam).then(() => { form.resetFields() })
        } else {
          onOk({
            hexColor: senColor,
            ...value
          } as UpdateSenParam).then(() => { form.resetFields() })
        }
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
          initialValue={editingRecord === undefined ? "" : editingRecord.name}
          required={true}
        />
        <ProFormDigit
          width="sm"
          name="resolution"
          label="分辨率"
          placeholder="分辨率"
          initialValue={editingRecord === undefined ? 0 : editingRecord.resolution}
          required={true}
        />
        <ProFormDigit
          width="sm"
          name="width"
          label="幅宽"
          placeholder="幅宽"
          initialValue={editingRecord === undefined ? 0 : editingRecord.width}
          required={true}
        />
        <ProFormDigit
          width="sm"
          name="leftSideAngle"
          label="左侧摆角"
          placeholder="左侧摆角"
          initialValue={editingRecord === undefined ? 0 : editingRecord.leftSideAngle}
        />
        <ProFormDigit
          width="sm"
          name="rightSideAngle"
          label="右侧摆角"
          placeholder="右侧摆角"
          initialValue={editingRecord === undefined ? 0 : editingRecord.rightSideAngle}
        />
        <ProFormDigit
          width="sm"
          name="initAngle"
          label="安装角"
          placeholder="安装角"
          initialValue={editingRecord === undefined ? 0 : editingRecord.initAngle}
        />
        <Form.Item name="satColor" label="颜色">
          <ColorButton initColor={editingRecord === undefined ? "#FFFFFF" : editingRecord.hexColor}
            onValueChanged={(c) => {
              setSenColor(c)
            }} />
        </Form.Item>
      </ProForm.Group>
    </ModalForm>
  );
};

export default CreateSensorForm;
