"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const homie_device_1 = __importDefault(require("homie-device"));
const motionblinds_1 = require("motionblinds");
class Device {
    logger;
    motionGateway;
    mac;
    deviceType;
    status;
    homieDevice;
    constructor(logger, settings, motionGateway, mac, deviceType, status) {
        this.logger = logger;
        this.motionGateway = motionGateway;
        this.mac = mac;
        this.deviceType = deviceType;
        this.status = status;
        this.logger = logger;
        this.publishData = this.publishData.bind(this);
        this.homieDevice = new homie_device_1.default({
            device_id: mac,
            name: motionblinds_1.DEVICE_TYPES[deviceType],
            mqtt: settings.mqtt,
        });
        this.homieDevice.on('connect', () => {
            this.publishData();
        });
    }
    updateData(status) {
        this.status = status;
        if (!this.homieDevice.isConnected)
            return;
        this.publishData();
    }
    async start() {
        return new Promise((resolve) => {
            this.logger.debug('Connecting to MQTT broker for {deviceId}...', {
                deviceId: this.mac,
            });
            this.homieDevice.once('connect', resolve);
            this.homieDevice.setup(true);
            this.homieDevice.mqttClient.on('error', (err) => {
                this.logger.error("Encountered MQTT error.", { error: err });
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            this.logger.debug('Disconnecting from MQTT broker for {deviceId}...', {
                deviceId: this.mac,
            });
            this.homieDevice.once('disconnect', resolve);
            this.homieDevice.end();
        });
    }
}
exports.Device = Device;
//# sourceMappingURL=device.js.map