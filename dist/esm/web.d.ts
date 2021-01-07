/// <reference types="web-bluetooth" />
import { WebPlugin } from '@capacitor/core';
import { BleDevice, BluetoothLePlugin, ConnectOptions, ReadOptions, ReadResult, RequestBleDeviceOptions, WriteOptions } from './definitions';
export declare class BluetoothLeWeb extends WebPlugin implements BluetoothLePlugin {
    private deviceMap;
    private scan;
    constructor();
    initialize(): Promise<void>;
    requestDevice(options?: RequestBleDeviceOptions): Promise<BleDevice>;
    requestLEScan(options?: RequestBleDeviceOptions): Promise<void>;
    stopLEScan(): Promise<void>;
    connect(options: ConnectOptions): Promise<void>;
    disconnect(options: ConnectOptions): Promise<void>;
    getCharacteristic(options: ReadOptions | WriteOptions): Promise<BluetoothRemoteGATTCharacteristic | undefined>;
    read(options: ReadOptions): Promise<ReadResult>;
    write(options: WriteOptions): Promise<void>;
    startNotifications(options: ReadOptions): Promise<void>;
    stopNotifications(options: ReadOptions): Promise<void>;
    private getFilters;
    private getDevice;
}
declare const BluetoothLe: BluetoothLeWeb;
export { BluetoothLe };
