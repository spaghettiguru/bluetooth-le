import { Capacitor, PluginListenerHandle, Plugins } from '@capacitor/core';
import { dataViewToHexString, hexStringToDataView } from './conversion';
import {
  BleDevice,
  Data,
  ReadResult,
  RequestBleDeviceOptions,
  ScanResult,
  ScanResultInternal,
} from './definitions';

const { BluetoothLe } = Plugins;

export interface BleClientInterface {
  /**
   * Initialize Bluetooth Low Energy (BLE). If it fails, BLE might be unavailable or disabled on this device.
   * On Android it will ask for the location permission. On iOS it will ask for the Bluetooth permission.
   * For an example, see [usage](#usage).
   */
  initialize(): Promise<void>;

  /**
   * Request a peripheral BLE device to interact with. This will scan for available devices according to the filters in the options and show a dialog to pick a device.
   * For an example, see [usage](#usage).
   * @param options Device filters, see [RequestBleDeviceOptions](#RequestBleDeviceOptions)
   */
  requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;

  /**
   * Start scanning for BLE devices to interact with according to the filters in the options. The callback will be invoked on each device that is found.
   * Scanning will continue until `stopLEScan` is called. For an example, see [usage](#usage).
   * **NOTE**: Use with care on web platform, the required API is still behind a flag in most browsers.
   * @param options
   * @param callback
   */
  requestLEScan(
    options: RequestBleDeviceOptions,
    callback: (result: ScanResult) => void,
  ): Promise<void>;

  /**
   * Stop scanning for BLE devices. For an example, see [usage](#usage).
   */
  stopLEScan(): Promise<void>;

  /**
   * Connect to a peripheral BLE device. For an example, see [usage](#usage).
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  connect(deviceId: string): Promise<void>;

  /**
   * Disconnect from a peripheral BLE device. For an example, see [usage](#usage).
   * @param deviceId  The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   */
  disconnect(deviceId: string): Promise<void>;

  /**
   * Read the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   */
  read(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<DataView>;

  /**
   * Write a value to a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param value The value to write as a DataView. To create a DataView from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0])
   */
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
  ): Promise<void>;

  /**
   * Start listening to changes of the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   * @param callback Callback function to use when the value of the characteristic changes
   */
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void,
  ): Promise<void>;

  /**
   * Stop listening to the changes of the value of a characteristic. For an example, see [usage](#usage).
   * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
   * @param service UUID of the service (see [UUID format](#uuid-format))
   * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
   */
  stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<void>;
}

class BleClientClass implements BleClientInterface {
  scanListener: PluginListenerHandle | null = null;
  notifyListeners = new Map<string, PluginListenerHandle>();

  async initialize(): Promise<void> {
    await BluetoothLe.initialize();
  }

  async requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice> {
    const device = await BluetoothLe.requestDevice(options);
    return device;
  }

  async requestLEScan(
    options: RequestBleDeviceOptions,
    callback: (result: ScanResult) => void,
  ): Promise<void> {
    this.scanListener?.remove();
    this.scanListener = BluetoothLe.addListener(
      'onScanResult',
      (result: ScanResultInternal) => {
        result.manufacturerData = this.convertObject(result.manufacturerData);
        result.serviceData = this.convertObject(result.serviceData);
        result.rawAdvertisement = result.rawAdvertisement
          ? this.convertValue(result.rawAdvertisement)
          : undefined;
        callback(result as ScanResult);
      },
    );
    await BluetoothLe.requestLEScan(options);
  }

  async stopLEScan(): Promise<void> {
    this.scanListener?.remove();
    this.scanListener = null;
    await BluetoothLe.stopLEScan();
  }

  async connect(deviceId: string): Promise<void> {
    await BluetoothLe.connect({ deviceId });
  }

  async disconnect(deviceId: string): Promise<void> {
    await BluetoothLe.disconnect({ deviceId });
  }

  async read(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<DataView> {
    const result = await BluetoothLe.read({
      deviceId,
      service,
      characteristic,
    });
    return this.convertValue(result.value);
  }

  async write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: DataView,
  ): Promise<void> {
    let writeValue: DataView | string = value;
    if (Capacitor.platform !== 'web') {
      // on native we can only write strings
      writeValue = dataViewToHexString(value);
    }
    await BluetoothLe.write({
      deviceId,
      service,
      characteristic,
      value: writeValue,
    });
  }

  async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (value: DataView) => void,
  ): Promise<void> {
    const key = `notification|${deviceId}|${service}|${characteristic}`;
    this.notifyListeners.get(key)?.remove();
    const listener = BluetoothLe.addListener(key, (event: ReadResult) => {
      callback(this.convertValue(event?.value));
    });
    this.notifyListeners.set(key, listener);
    await BluetoothLe.startNotifications({
      deviceId,
      service,
      characteristic,
    });
  }

  async stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<void> {
    const key = `notification|${service}|${characteristic}`;
    this.notifyListeners.get(key)?.remove();
    this.notifyListeners.delete(key);
    await BluetoothLe.stopNotifications({
      deviceId,
      service,
      characteristic,
    });
  }

  private convertValue(value?: Data): DataView {
    if (typeof value === 'string') {
      return hexStringToDataView(value);
    } else if (value === undefined) {
      return new DataView(new ArrayBuffer(0));
    }
    return value;
  }

  private convertObject(obj?: {
    [key: string]: Data;
  }): { [key: string]: DataView } | undefined {
    if (obj === undefined) {
      return undefined;
    }
    const result: { [key: string]: DataView } = {};
    for (const key of Object.keys(obj)) {
      result[key] = this.convertValue(obj[key]);
    }
    return result;
  }
}

export const BleClient = new BleClientClass();
