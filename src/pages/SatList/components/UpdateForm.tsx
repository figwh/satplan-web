import React from 'react';
import { ModalForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { UpdateSatParam, SatListItem } from '../data';
import { Form } from 'antd'
import ColorButton from './colorButton'

interface UpdateFormProps {
  modalVisible: boolean;
  onCancel: () => void;
  editingRecord: SatListItem,
  onOk: (record: SatListItem, value: UpdateSatParam) => void;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { modalVisible, onCancel, editingRecord, onOk } = props;
  const { formatMessage } = useIntl();

  return (
    <ModalForm
      layout="horizontal"
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 16 }}
      title={formatMessage({ id: 'pages.satTable.editSat' })}
      width="500px"
      visible={modalVisible}
      modalProps={{
        onCancel: onCancel
      }}
      onFinish={(value) => {
        return new Promise((resolve) => {
          onOk(editingRecord, {
            satName: value.satName,
            hexColor: editingRecord.hexColor,
          } as UpdateSatParam)
          resolve()
        })
      }}
    >
      <ProFormText
        rules={[
          {
            required: true,
          },
        ]}
        width="md"
        name="satNoardId"
        label="NoardID"
        placeholder="NoardID"
        disabled={true}
        initialValue={editingRecord.noardId}
      />
      <ProFormText
        rules={[
          {
            required: true,
          },
        ]}
        width="md"
        name="satName"
        label={formatMessage({ id: 'pages.satTable.satName' })}
        placeholder={formatMessage({ id: 'pages.satTable.satName' })}
        initialValue={editingRecord.name}
      />
      <Form.Item name="satColor" label={formatMessage({ id: 'pages.satTable.satItem.color' })}>
        <ColorButton initColor={editingRecord.hexColor} onValueChanged={(c) => {
          editingRecord.hexColor = c
        }} />
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;
