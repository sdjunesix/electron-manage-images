import { ImageManagementPage } from '@pages/image-management';
import { CaptionManagementPage } from '@pages/cation-management';
import { TrainingPage } from '@pages/training';
import { QualityManagementPage } from '@pages/quality-management';
import { SettingsPage } from '@pages/settings';

import { CiImageOn } from 'react-icons/ci';
import { FiMessageSquare } from 'react-icons/fi';
import { HiMiniPaintBrush } from 'react-icons/hi2';
import { IoShieldOutline } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';

export const ROUTES = [
  {
    path: '/',
    title: 'Image Management',
    Icon: CiImageOn,
    Component: ImageManagementPage,
  },
  {
    path: '/captions',
    title: 'Caption Management',
    Icon: FiMessageSquare,
    Component: CaptionManagementPage,
  },
  {
    path: '/training',
    title: 'Training',
    Icon: HiMiniPaintBrush,
    Component: TrainingPage,
  },
  {
    path: '/quality',
    title: 'Quality Management',
    Icon: IoShieldOutline,
    Component: QualityManagementPage,
  },
  {
    path: '/settings',
    title: 'Settings',
    Icon: IoMdSettings,
    Component: SettingsPage,
  },
];
