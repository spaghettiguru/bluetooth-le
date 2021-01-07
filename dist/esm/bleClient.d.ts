import { PluginListenerHandle } from '@capacitor/core';
import { BleDevice, RequestBleDeviceOptions, ScanResult } from './definitions';
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
    requestLEScan(options: RequestBleDeviceOptions, callback: (result: ScanResult) => void): Promise<void>;
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
    read(deviceId: string, service: string, characteristic: string): Promise<DataView>;
    /**
     * Write a value to a characteristic. For an example, see [usage](#usage).
     * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
     * @param service UUID of the service (see [UUID format](#uuid-format))
     * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
     * @param value The value to write as a DataView. To create a DataView from an array of numbers, there is a helper function, e.g. numbersToDataView([1, 0])
     */
    write(deviceId: string, service: string, characteristic: string, value: DataView): Promise<void>;
    /**
     * Start listening to changes of the value of a characteristic. For an example, see [usage](#usage).
     * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
     * @param service UUID of the service (see [UUID format](#uuid-format))
     * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
     * @param callback Callback function to use when the value of the characteristic changes
     */
    startNotifications(deviceId: string, service: string, characteristic: string, callback: (value: DataView) => void): Promise<void>;
    /**
     * Stop listening to the changes of the value of a characteristic. For an example, see [usage](#usage).
     * @param deviceId The ID of the device to use (obtained from [requestDevice](#requestDevice) or [requestLEScan](#requestLEScan))
     * @param service UUID of the service (see [UUID format](#uuid-format))
     * @param characteristic UUID of the characteristic (see [UUID format](#uuid-format))
     */
    stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void>;
}
declare class BleClientClass implements BleClientInterface {
    scanListener: PluginListenerHandle | null;
    notifyListeners: Map<string, PluginListenerHandle>;
    initialize(): Promise<void>;
    requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;
    requestLEScan(options: RequestBleDeviceOptions, callback: (result: ScanResult) => void): Promise<void>;
    stopLEScan(): Promise<void>;
    connect(deviceId: string): Promise<void>;
    disconnect(deviceId: string): Promise<void>;
    read(deviceId: string, service: string, characteristic: string): Promise<DataView>;
    write(deviceId: string, service: string, characteristic: string, value: DataView): Promise<void>;
    startNotifications(deviceId: string, service: string, characteristic: string, callback: (value: DataView) => void): Promise<void>;
    stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void>;
    private convertValue;
    private convertObject;
}
export declare const BleClient: BleClientClass;
export {};
