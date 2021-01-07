var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebPlugin } from '@capacitor/core';
import { hexStringToDataView, mapToObject, webUUIDToString, } from './conversion';
export class BluetoothLeWeb extends WebPlugin {
    constructor() {
        super({
            name: 'BluetoothLe',
            platforms: ['web'],
        });
        this.deviceMap = new Map();
        this.scan = null;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof navigator === 'undefined' || !navigator.bluetooth) {
                throw new Error('Web Bluetooth API not available in this browser.');
            }
            if (!navigator.bluetooth.getAvailability()) {
                throw new Error('No Bluetooth radio available.');
            }
        });
    }
    requestDevice(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = this.getFilters(options);
            const device = yield navigator.bluetooth.requestDevice({
                filters: filters.length ? filters : undefined,
                optionalServices: options === null || options === void 0 ? void 0 : options.optionalServices,
                acceptAllDevices: filters.length === 0,
            });
            const { id, name, uuids } = device;
            this.deviceMap.set(id, device);
            return { deviceId: id, name, uuids };
        });
    }
    requestLEScan(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = this.getFilters(options);
            yield this.stopLEScan();
            navigator.bluetooth.addEventListener('advertisementreceived', (event) => {
                var _a;
                const isNew = !this.deviceMap.has(event.device.id);
                this.deviceMap.set(event.device.id, event.device);
                if (isNew || (options === null || options === void 0 ? void 0 : options.allowDuplicates)) {
                    const device = {
                        deviceId: event.device.id,
                        name: event.device.name,
                    };
                    const result = {
                        device,
                        rssi: event.rssi,
                        txPower: event.txPower,
                        manufacturerData: mapToObject(event.manufacturerData),
                        serviceData: mapToObject(event.serviceData),
                        uuids: (_a = event.uuids) === null || _a === void 0 ? void 0 : _a.map(webUUIDToString),
                    };
                    this.notifyListeners('onScanResult', result);
                }
            });
            this.scan = yield navigator.bluetooth.requestLEScan({
                filters: filters.length ? filters : undefined,
                acceptAllAdvertisements: filters.length === 0,
                keepRepeatedDevices: options === null || options === void 0 ? void 0 : options.allowDuplicates,
            });
        });
    }
    stopLEScan() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.scan && this.scan.active) {
                this.scan.stop();
            }
            this.scan = null;
        });
    }
    connect(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            yield ((_a = this.getDevice(options.deviceId).gatt) === null || _a === void 0 ? void 0 : _a.connect());
        });
    }
    disconnect(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.getDevice(options.deviceId).gatt) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
    }
    getCharacteristic(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const service = yield ((_a = this.getDevice(options.deviceId).gatt) === null || _a === void 0 ? void 0 : _a.getPrimaryService(options === null || options === void 0 ? void 0 : options.service));
            return service === null || service === void 0 ? void 0 : service.getCharacteristic(options === null || options === void 0 ? void 0 : options.characteristic);
        });
    }
    read(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const characteristic = yield this.getCharacteristic(options);
            const value = yield (characteristic === null || characteristic === void 0 ? void 0 : characteristic.readValue());
            return { value };
        });
    }
    write(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const characteristic = yield this.getCharacteristic(options);
            let dataView;
            if (typeof options.value === 'string') {
                dataView = hexStringToDataView(options.value);
            }
            else {
                dataView = options.value;
            }
            yield (characteristic === null || characteristic === void 0 ? void 0 : characteristic.writeValue(dataView));
        });
    }
    startNotifications(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const characteristic = yield this.getCharacteristic(options);
            characteristic === null || characteristic === void 0 ? void 0 : characteristic.addEventListener('characteristicvaluechanged', (event) => {
                const key = `notification|${options.deviceId}|${options.service}|${options.characteristic}`;
                this.notifyListeners(key, {
                    value: event.target.value,
                });
            });
            yield (characteristic === null || characteristic === void 0 ? void 0 : characteristic.startNotifications());
        });
    }
    stopNotifications(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const characteristic = yield this.getCharacteristic(options);
            yield (characteristic === null || characteristic === void 0 ? void 0 : characteristic.stopNotifications());
        });
    }
    getFilters(options) {
        var _a;
        let filters = [];
        for (let service of (_a = options === null || options === void 0 ? void 0 : options.services) !== null && _a !== void 0 ? _a : []) {
            filters.push({
                services: [service],
                name: options === null || options === void 0 ? void 0 : options.name,
                namePrefix: options === null || options === void 0 ? void 0 : options.namePrefix,
            });
        }
        if (((options === null || options === void 0 ? void 0 : options.name) || (options === null || options === void 0 ? void 0 : options.namePrefix)) && filters.length === 0) {
            filters.push({
                name: options.name,
                namePrefix: options.namePrefix,
            });
        }
        return filters;
    }
    getDevice(deviceId) {
        const device = this.deviceMap.get(deviceId);
        if (device === undefined) {
            throw new Error('Device not found. Call "requestDevice" or "requestLEScan" first.');
        }
        return device;
    }
}
const BluetoothLe = new BluetoothLeWeb();
export { BluetoothLe };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(BluetoothLe);
//# sourceMappingURL=web.js.map