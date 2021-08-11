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
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();

  return (
    <ModalForm
      form={form}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      title={formatMessage({ id: 'pages.satTable.satItem.addSen' })}
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
      <ProFormText
        width="md"
        name="satName"
        label={formatMessage({ id: 'pages.satTable.satName' })}
        initialValue={satName}
        disabled={true}
        placeholder={formatMessage({ id: 'pages.satTable.satName' })}
      />
      <ProFormText
        width="md"
        name="name"
        label={formatMessage({ id: 'pages.satTable.senName' })}
        placeholder={formatMessage({ id: 'pages.satTable.senName' })}
        initialValue={editingRecord === undefined ? "" : editingRecord.name}
        required={true}
      />
      <ProFormDigit
        width="md"
        name="resolution"
        label={formatMessage({ id: 'pages.satTable.satItem.resolutionLabel' })}
        placeholder={formatMessage({ id: 'pages.satTable.satItem.resolutionLabel' })}
        initialValue={editingRecord === undefined ? 0 : editingRecord.resolution}
        required={true}
      />
      <ProFormDigit
        width="md"
        name="width"
        label={formatMessage({ id: 'pages.satTable.satItem.widthLabel' })}
        placeholder={formatMessage({ id: 'pages.satTable.satItem.widthLabel' })}
        initialValue={editingRecord === undefined ? 0 : editingRecord.width}
        required={true}
      />
      <ProFormDigit
        width="md"
        name="leftSideAngle"
        label={formatMessage({ id: 'pages.satTable.satItem.leftSideAngleLabel' })}
        placeholder={formatMessage({ id: 'pages.satTable.satItem.leftSideAngleLabel' })}
        initialValue={editingRecord === undefined ? 0 : editingRecord.leftSideAngle}
      />
      <ProFormDigit
        width="md"
        name="rightSideAngle"
        label={formatMessage({ id: 'pages.satTable.satItem.rightSideAngleLabel' })}
        placeholder={formatMessage({ id: 'pages.satTable.satItem.rightSideAngleLabel' })}
        initialValue={editingRecord === undefined ? 0 : editingRecord.rightSideAngle}
      />
      <ProFormDigit
        width="md"
        name="initAngle"
        label={formatMessage({ id: 'pages.satTable.satItem.initAngleLabel' })}
        placeholder={formatMessage({ id: 'pages.satTable.satItem.initAngleLabel' })}
        initialValue={editingRecord === undefined ? 0 : editingRecord.initAngle}
      />
      <Form.Item name="satColor" label={formatMessage({ id: 'pages.satTable.satItem.color' })}>
        <ColorButton initColor={editingRecord === undefined ? "#FFFFFF" : editingRecord.hexColor}
          onValueChanged={(c) => {
            setSenColor(c)
          }} />
      </Form.Item>
    </ModalForm>
  );
};

export default CreateSensorForm;
