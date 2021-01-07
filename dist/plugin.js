import { WebPlugin, registerWebPlugin, Capacitor, Plugins } from '@capacitor/core';

/**
 * Android scan mode
 */
var ScanMode;
(function (ScanMode) {
    /**
     * Perform Bluetooth LE scan in low power mode. This mode is enforced if the scanning application is not in foreground.
     * https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_LOW_POWER
     */
    ScanMode[ScanMode["SCAN_MODE_LOW_POWER"] = 0] = "SCAN_MODE_LOW_POWER";
    /**
     * Perform Bluetooth LE scan in balanced power mode. (default) Scan results are returned at a rate that provides a good trade-off between scan frequency and power consumption.
     * https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_BALANCED
     */
    ScanMode[ScanMode["SCAN_MODE_BALANCED"] = 1] = "SCAN_MODE_BALANCED";
    /**
     * Scan using highest duty cycle. It's recommended to only use this mode when the application is running in the foreground.
     * https://developer.android.com/reference/android/bluetooth/le/ScanSettings#SCAN_MODE_LOW_LATENCY
     */
    ScanMode[ScanMode["SCAN_MODE_LOW_LATENCY"] = 2] = "SCAN_MODE_LOW_LATENCY";
})(ScanMode || (ScanMode = {}));

function numbersToDataView(value) {
    return new DataView(Uint8Array.from(value).buffer);
}
function dataViewToNumbers(value) {
    return Array.from(new Uint8Array(value.buffer));
}
function hexStringToDataView(value) {
    const numbers = value
        .trim()
        .split(' ')
        .map(s => parseInt(s, 16));
    return numbersToDataView(numbers);
}
function dataViewToHexString(value) {
    return dataViewToNumbers(value)
        .map(n => {
        let s = n.toString(16);
        if (s.length == 1) {
            s = '0' + s;
        }
        return s;
    })
        .join(' ');
}
function textToDataView(value) {
    return numbersToDataView(value.split('').map(s => s.charCodeAt(0)));
}
function dataViewToText(value) {
    return String.fromCharCode(...dataViewToNumbers(value));
}
/**
 * Convert a 16 bit UUID to a 128 bit UUID string
 * @param value number, e.g. 0x180d
 * @return string, e.g. '0000180d-0000-1000-8000-00805f9b34fb'
 */
function numberToUUID(value) {
    return `0000${value.toString(16)}-0000-1000-8000-00805f9b34fb`;
}
function webUUIDToString(uuid) {
    if (typeof uuid === 'string') {
        return uuid;
    }
    else if (typeof uuid === 'number') {
        return numberToUUID(uuid);
    }
    else {
        throw new Error('Invalid UUID');
    }
}
function mapToObject(map) {
    const obj = {};
    if (!map) {
        return undefined;
    }
    map.forEach((value, key) => {
        obj[key.toString()] = value;
    });
    return obj;
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BluetoothLeWeb extends WebPlugin {
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
registerWebPlugin(BluetoothLe);

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { BluetoothLe: BluetoothLe$1 } = Plugins;
class BleClientClass {
    constructor() {
        this.scanListener = null;
        this.notifyListeners = new Map();
    }
    initialize() {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield BluetoothLe$1.initialize();
        });
    }
    requestDevice(options) {
        return __awaiter$1(this, void 0, void 0, function* () {
            const device = yield BluetoothLe$1.requestDevice(options);
            return device;
        });
    }
    requestLEScan(options, callback) {
        var _a;
        return __awaiter$1(this, void 0, void 0, function* () {
            (_a = this.scanListener) === null || _a === void 0 ? void 0 : _a.remove();
            this.scanListener = BluetoothLe$1.addListener('onScanResult', (result) => {
                result.manufacturerData = this.convertObject(result.manufacturerData);
                result.serviceData = this.convertObject(result.serviceData);
                result.rawAdvertisement = result.rawAdvertisement
                    ? this.convertValue(result.rawAdvertisement)
                    : undefined;
                callback(result);
            });
            yield BluetoothLe$1.requestLEScan(options);
        });
    }
    stopLEScan() {
        var _a;
        return __awaiter$1(this, void 0, void 0, function* () {
            (_a = this.scanListener) === null || _a === void 0 ? void 0 : _a.remove();
            this.scanListener = null;
            yield BluetoothLe$1.stopLEScan();
        });
    }
    connect(deviceId) {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield BluetoothLe$1.connect({ deviceId });
        });
    }
    disconnect(deviceId) {
        return __awaiter$1(this, void 0, void 0, function* () {
            yield BluetoothLe$1.disconnect({ deviceId });
        });
    }
    read(deviceId, service, characteristic) {
        return __awaiter$1(this, void 0, void 0, function* () {
            const result = yield BluetoothLe$1.read({
                deviceId,
                service,
                characteristic,
            });
            return this.convertValue(result.value);
        });
    }
    write(deviceId, service, characteristic, value) {
        return __awaiter$1(this, void 0, void 0, function* () {
            let writeValue = value;
            if (Capacitor.platform !== 'web') {
                // on native we can only write strings
                writeValue = dataViewToHexString(value);
            }
            yield BluetoothLe$1.write({
                deviceId,
                service,
                characteristic,
                value: writeValue,
            });
        });
    }
    startNotifications(deviceId, service, characteristic, callback) {
        var _a;
        return __awaiter$1(this, void 0, void 0, function* () {
            const key = `notification|${deviceId}|${service}|${characteristic}`;
            (_a = this.notifyListeners.get(key)) === null || _a === void 0 ? void 0 : _a.remove();
            const listener = BluetoothLe$1.addListener(key, (event) => {
                callback(this.convertValue(event === null || event === void 0 ? void 0 : event.value));
            });
            this.notifyListeners.set(key, listener);
            yield BluetoothLe$1.startNotifications({
                deviceId,
                service,
                characteristic,
            });
        });
    }
    stopNotifications(deviceId, service, characteristic) {
        var _a;
        return __awaiter$1(this, void 0, void 0, function* () {
            const key = `notification|${service}|${characteristic}`;
            (_a = this.notifyListeners.get(key)) === null || _a === void 0 ? void 0 : _a.remove();
            this.notifyListeners.delete(key);
            yield BluetoothLe$1.stopNotifications({
                deviceId,
                service,
                characteristic,
            });
        });
    }
    convertValue(value) {
        if (typeof value === 'string') {
            return hexStringToDataView(value);
        }
        else if (value === undefined) {
            return new DataView(new ArrayBuffer(0));
        }
        return value;
    }
    convertObject(obj) {
        if (obj === undefined) {
            return undefined;
        }
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = this.convertValue(obj[key]);
        }
        return result;
    }
}
const BleClient = new BleClientClass();

export { BleClient, BluetoothLe, BluetoothLeWeb, ScanMode, dataViewToHexString, dataViewToNumbers, dataViewToText, hexStringToDataView, mapToObject, numberToUUID, numbersToDataView, textToDataView, webUUIDToString };
//# sourceMappingURL=plugin.js.map
