import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1B3A5C',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1B3A5C',
    borderRadius: 6,
    fontFamily: "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    colorBgLayout: '#f0f2f5',
    colorLink: '#1B3A5C',
  },
  components: {
    Layout: {
      siderBg: '#0a1628',
      headerBg: '#ffffff',
      headerHeight: 56,
    },
    Menu: {
      darkItemBg: '#0a1628',
      darkItemSelectedBg: '#1B3A5C',
      darkSubMenuItemBg: '#060f1d',
      darkItemHoverBg: '#142d4a',
      itemHeight: 44,
      iconSize: 16,
    },
    Table: {
      headerBg: '#f5f7fa',
      headerColor: '#1B3A5C',
      rowHoverBg: '#e8f0fe',
    },
    Card: {
      paddingLG: 20,
    },
    Statistic: {
      titleFontSize: 13,
    },
  },
};

export default theme;

export const colors = {
  navy: '#1B3A5C',
  navyDark: '#0a1628',
  navyLight: '#2d5a8e',
  gold: '#D4A843',
  goldLight: '#f0d890',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  info: '#1890ff',
  textPrimary: '#1a1a2e',
  textSecondary: '#666',
  bgLight: '#f5f7fa',
  bgCard: '#ffffff',
  border: '#e8e8e8',
};
