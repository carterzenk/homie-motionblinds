"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomieMotionBlinds = void 0;
const motionblinds_1 = require("motionblinds");
const blind_1 = require("./devices/blind");
class HomieMotionBlinds {
    logger;
    settings;
    motionGateway;
    devicesByMac;
    constructor(logger, settings, motionGateway) {
        this.logger = logger;
        this.settings = settings;
        this.motionGateway = motionGateway;
        this.devicesByMac = new Map();
    }
    async start() {
        this.logger.info("Starting homie-motionblinds...");
        try {
            await this.setupDevices();
        }
        catch (err) {
            this.logger.error("Encountered an error while starting: ", err);
        }
    }
    async setupDevices() {
        const readDeviceAcks = await this.motionGateway.readAllDevices();
        for (const readDeviceAck of readDeviceAcks) {
            if (readDeviceAck.deviceType === motionblinds_1.DEVICE_TYPE_BLIND) {
                const blind = new blind_1.Blind(this.logger, this.settings, this.motionGateway, readDeviceAck.mac, readDeviceAck.deviceType, readDeviceAck.data);
                this.devicesByMac.set(readDeviceAck.mac, blind);
            }
        }
        await Promise.all(readDeviceAcks
            .filter(readDeviceAck => readDeviceAck.deviceType === motionblinds_1.DEVICE_TYPE_BLIND)
            .map(async (readDeviceAck) => {
            this.logger.info("Setting up {device}", {
                mac: readDeviceAck.mac,
            });
            const blind = new blind_1.Blind(this.logger, this.settings, this.motionGateway, readDeviceAck.mac, readDeviceAck.deviceType, readDeviceAck.data);
            this.devicesByMac.set(readDeviceAck.mac, blind);
            await blind.start();
        }));
        this.motionGateway.on('report', (report) => {
            const device = this.devicesByMac.get(report.mac);
            if (device === undefined) {
                this.logger.warn("Received report for unknown device {mac}", {
                    mac: report.mac,
                });
                return;
            }
            device.updateData(report.data);
        });
        this.motionGateway.on('error', (error) => {
            this.logger.error("MotionGateway error: ", error);
        });
    }
    async stop() {
        this.logger.info("Stopping MQTT connections...");
        const callbacks = [...this.devicesByMac.values()].map(async (device) => {
            await device.stop();
        });
        await Promise.all(callbacks);
    }
}
exports.HomieMotionBlinds = HomieMotionBlinds;
//# sourceMappingURL=homie-motionblinds.js.map