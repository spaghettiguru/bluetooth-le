import { numberToUUID } from '@capacitor-community/bluetooth-le';

export const DEVICE_ID = 'E5:A3:06:72:5B:E9';
export const HEART_RATE_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
export const HEART_RATE_MEASUREMENT_CHARACTERISTIC =
  '00002a37-0000-1000-8000-00805f9b34fb';
export const BODY_SENSOR_LOCATION_CHARACTERISTIC =
  '00002a38-0000-1000-8000-00805f9b34fb';
export const POLAR_PMD_SERVICE = 'fb005c80-02e7-f387-1cad-8acd2d8df0c8';
export const POLAR_PMD_CONTROL_POINT = 'fb005c81-02e7-f387-1cad-8acd2d8df0c8';
export const POLAR_PMD_DATA = 'fb005c82-02e7-f387-1cad-8acd2d8df0c8';

export const GENERIC_SERVICE = numberToUUID(0x1800);
export const DEVICE_NAME_CHARACTERISTIC = numberToUUID(0x2a00);
export const DEVICE_INFORMATION_SERVICE = numberToUUID(0x180a);
export const MANUFACTURER_NAME_CHARACTERISTIC = numberToUUID(0x2a29);
export const BATTERY_SERVICE = numberToUUID(0x180f);
export const BATTERY_CHARACTERISTIC = numberToUUID(0x2a19);
export const TEMPERATURE_SERVICE = '00002234-b38d-4985-720e-0f993a68ee41';
export const TEMPERATURE_CHARACTERISTIC =
  '00002235-b38d-4985-720e-0f993a68ee41';
export const HUMIDITY_SERVICE = '00001234-b38d-4985-720e-0f993a68ee41';
export const HUMIDITY_CHARACTERISTIC = '00001235-b38d-4985-720e-0f993a68ee41';
