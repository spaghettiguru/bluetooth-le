var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Capacitor, Plugins } from '@capacitor/core';
import { dataViewToHexString, hexStringToDataView } from './conversion';
const { BluetoothLe } = Plugins;
class BleClientClass {
    constructor() {
        this.scanListener = null;
        this.notifyListeners = new Map();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield BluetoothLe.initialize();
        });
    }
    requestDevice(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const device = yield BluetoothLe.requestDevice(options);
            return device;
        });
    }
    requestLEScan(options, callback) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.scanListener) === null || _a === void 0 ? void 0 : _a.remove();
            this.scanListener = BluetoothLe.addListener('onScanResult', (result) => {
                result.manufacturerData = this.convertObject(result.manufacturerData);
                result.serviceData = this.convertObject(result.serviceData);
                result.rawAdvertisement = result.rawAdvertisement
                    ? this.convertValue(result.rawAdvertisement)
                    : undefined;
                callback(result);
            });
            yield BluetoothLe.requestLEScan(options);
        });
    }
    stopLEScan() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.scanListener) === null || _a === void 0 ? void 0 : _a.remove();
            this.scanListener = null;
            yield BluetoothLe.stopLEScan();
        });
    }
    connect(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield BluetoothLe.connect({ deviceId });
        });
    }
    disconnect(deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield BluetoothLe.disconnect({ deviceId });
        });
    }
    read(deviceId, service, characteristic) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield BluetoothLe.read({
                deviceId,
                service,
                characteristic,
            });
            return this.convertValue(result.value);
        });
    }
    write(deviceId, service, characteristic, value) {
        return __awaiter(this, void 0, void 0, function* () {
            let writeValue = value;
            if (Capacitor.platform !== 'web') {
                // on native we can only write strings
                writeValue = dataViewToHexString(value);
            }
            yield BluetoothLe.write({
                deviceId,
                service,
                characteristic,
                value: writeValue,
            });
        });
    }
    startNotifications(deviceId, service, characteristic, callback) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const key = `notification|${deviceId}|${service}|${characteristic}`;
            (_a = this.notifyListeners.get(key)) === null || _a === void 0 ? void 0 : _a.remove();
            const listener = BluetoothLe.addListener(key, (event) => {
                callback(this.convertValue(event === null || event === void 0 ? void 0 : event.value));
            });
            this.notifyListeners.set(key, listener);
            yield BluetoothLe.startNotifications({
                deviceId,
                service,
                characteristic,
            });
        });
    }
    stopNotifications(deviceId, service, characteristic) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const key = `notification|${service}|${characteristic}`;
            (_a = this.notifyListeners.get(key)) === null || _a === void 0 ? void 0 : _a.remove();
            this.notifyListeners.delete(key);
            yield BluetoothLe.stopNotifications({
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
export const BleClient = new BleClientClass();
//# sourceMappingURL=bleClient.js.map