declare module 'react-native-config' {
    export interface NativeConfig {
      REACT_APP_URL?: 'https://api.jeevaamirdham.in';
      REACT_API_URL?: 'http://localhost:3001'
    }
  
    export const Config: NativeConfig;
    export default Config;
  }
  