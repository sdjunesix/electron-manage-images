import { FC, useState } from 'react';
import { ButtonPrimary, Input, Label, ProgressBar, Rating, SingleSelect, Table, Tabs, Tag, Textarea } from '@components';
import { optionsAPI, optionsVersion } from '@constants';
import { mockTableData } from '@pages/image-management';
import dayjs from 'dayjs';
import { FaPencil, FaPlus } from 'react-icons/fa6';
import { DropdownFolder } from './DropdownFolder';
import { ModalAddCaption } from './ModalAddCaption';

export const CaptionManagementPage: FC = () => {
  const [selectedTab, setSelectedTab] = useState('Images');
  const [selectedOptionVersion, setSelectedVersion] = useState(optionsVersion[0]);
  const [selectedOptionApi, setSelectedOptionApi] = useState(null);
  const [selectedTabVersion, setSelectedTabVersion] = useState('V1.0');
  const [openAddCaption, setOpenAddCaption] = useState(false);

  return (
    <div className="p-5 space-y-4">
      <Tabs tabs={['Images', 'Prompts', 'Process Captions']} currentTab={selectedTab} onSelect={setSelectedTab} />

      {selectedTab === 'Images' && (
        <>
          <div className="flex items-center justify-between">
            <DropdownFolder />
            <div className="flex items-center space-x-2">
              <SingleSelect options={optionsVersion} value={selectedOptionVersion} onChange={setSelectedVersion} className="w-32" />
              <ButtonPrimary onClick={() => setOpenAddCaption(!openAddCaption)}>Add Caption</ButtonPrimary>
            </div>
          </div>
          <div className="border border-line rounded-lg">
            <div className="text-muted_foreground flex justify-between bg-muted_50 p-3">
              <p className="">
                Showing <span className="text-black">7</span> images
              </p>
              <p className="">
                Selected <span className="text-black">7</span>
              </p>
            </div>
            <Table
              className="border-t border-line"
              rows={mockTableData}
              hiddenColumns={['id']}
              formatters={{
                'Date Added': (value: any) => dayjs(value).format('D/M/YYYY'),
                quality: (value: any) => <Rating value={value} notHover size={4} />,
                folders: (values: any) => {
                  if (!!values?.length) {
                    return values?.map((item: any, index: number) => (
                      <div className="flex space-x-1">
                        <Tag key={index} value={item} className="bg-muted border-none" />
                      </div>
                    ));
                  }
                  return null;
                },
                version: (value: any) => <Tag value={value} />,
              }}
              actions={[
                {
                  label: '',
                  icon: <FaPencil />,
                  onClick: (row) => {},
                },
              ]}
            />
          </div>
        </>
      )}

      {selectedTab === 'Prompts' && (
        <>
          <div className="border border-line rounded-lg p-4 space-y-4">
            <h1 className="text-lg font-medium">Add New Version</h1>
            <div>
              <Label children="Version Name / Number" />
              <Input placeholder="e.g., V1.0, V2.1" />
            </div>
            <div>
              <Label children="Select API" />
              <SingleSelect options={optionsAPI} value={selectedOptionApi} onChange={setSelectedOptionApi} className="w-full" />
            </div>
            <div>
              <Label children="Prompt" />
              <Textarea placeholder="Enter prompt text" rows={4} />
            </div>
            <ButtonPrimary onClick={() => {}} className="w-full">
              <FaPlus />
              <span>Add Prompt</span>
            </ButtonPrimary>
          </div>
          <h1 className="text-lg font-medium">Version History</h1>
          <div className="border border-line rounded-lg p-4">
            <Tabs tabs={['V1.0', 'V1.1', 'V2.0']} currentTab={selectedTabVersion} onSelect={setSelectedTabVersion} />
            <p className="mt-2">API: ChatGPT</p>
            <div className="mt-4">
              <Label children="Prompt" />
              <Textarea value="Initial basic description prompt" rows={4} placeholder="Enter prompt text" className="bg-muted" />
            </div>
            <div className="mt-4">
              <Label children="Sample Image Caption" />
              <Textarea
                value="A serene landscape photograph showing a misty mountain range at sunrise. The foreground features pine trees silhouetted against the warm orange glow of the rising sun. Layers of mountains fade into the distance, creating a sense of depth and scale."
                placeholder="Enter prompt text"
                className="bg-muted"
                rows={4}
              />
            </div>
          </div>
        </>
      )}

      {selectedTab === 'Process Captions' && (
        <div className="space-y-4">
          <h1 className="font-bold text-2xl">Process Image Captions</h1>
          <div className="space-y-2 border border-line rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p>Test process bar</p>
              <p className="text-muted_foreground flex space-x-4">
                <span>Model: Default Model</span>
                <span>Version: N/A</span>
                <span>100%</span>
              </p>
            </div>
            <ProgressBar value={0} />
          </div>
          <div className="space-y-2 border border-line rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p>Test process bar</p>
              <p className="text-muted_foreground flex space-x-4">
                <span>Model: Default Model</span>
                <span>Version: N/A</span>
                <span>100%</span>
              </p>
            </div>
            <ProgressBar value={50} />
          </div>
          <div className="space-y-2 border border-line rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p>Test process bar</p>
              <p className="text-muted_foreground flex space-x-4">
                <span>Model: Default Model</span>
                <span>Version: N/A</span>
                <span>100%</span>
              </p>
            </div>
            <ProgressBar value={100} />
          </div>
        </div>
      )}
      <ModalAddCaption isOpen={openAddCaption} onClose={setOpenAddCaption} />
    </div>
  );
};
