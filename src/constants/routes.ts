import { HomePage } from '@pages/home';
import { ImageManagementPage } from '@pages/image-management';
import { CaptionManagementPage } from '@pages/cation-management';

import { IoHomeOutline } from 'react-icons/io5';
import { CiImageOn } from 'react-icons/ci';
import { FiMessageSquare } from 'react-icons/fi';
import { HiMiniPaintBrush } from 'react-icons/hi2';
import { IoShieldOutline } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';

export const ROUTES = [
  {
    path: '/',
    title: 'Home',
    Icon: IoHomeOutline,
    Component: HomePage,
  },
  {
    path: '/images',
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
    Component: CaptionManagementPage,
  },
  {
    path: '/quality',
    title: 'Quality Management',
    Icon: IoShieldOutline,
    Component: CaptionManagementPage,
  },
  {
    path: '/settings',
    title: 'Settings',
    Icon: IoMdSettings,
    Component: CaptionManagementPage,
  },
];
