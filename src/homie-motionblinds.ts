import {Logger} from './logger';
import {Settings} from './config';
import {Device} from './devices/device';
import {DEVICE_TYPE_BLIND, MotionGateway} from 'motionblinds';
import {Blind} from './devices/blind';

export class HomieMotionBlinds {
    private devicesByMac: Map<string, Device>;

    constructor(
        private logger: Logger,
        private settings: Settings,
        private motionGateway: MotionGateway,
    ) {
        this.devicesByMac = new Map<string, Device>();
    }

    async start() {
        this.logger.info("Starting homie-motionblinds...");

        try {
            await this.setupDevices();
        } catch (err) {
            this.logger.error("Encountered an error while starting: ", err);
        }
    }

    async setupDevices() {
        const readDeviceAcks = await this.motionGateway.readAllDevices();
        
        for (const readDeviceAck of readDeviceAcks) {
            if (readDeviceAck.deviceType === DEVICE_TYPE_BLIND) {
                const blind = new Blind(
                    this.logger,
                    this.settings,
                    this.motionGateway,
                    readDeviceAck.mac,
                    readDeviceAck.deviceType,
                    readDeviceAck.data,
                );

                this.devicesByMac.set(readDeviceAck.mac, blind);
            }
        }

        await Promise.all(readDeviceAcks
            .filter(readDeviceAck => readDeviceAck.deviceType === DEVICE_TYPE_BLIND)
            .map(async readDeviceAck => {
                this.logger.info("Setting up {device}", {
                    mac: readDeviceAck.mac,
                });

                const blind = new Blind(
                    this.logger,
                    this.settings,
                    this.motionGateway,
                    readDeviceAck.mac,
                    readDeviceAck.deviceType,
                    readDeviceAck.data,
                );

                this.devicesByMac.set(readDeviceAck.mac, blind);

                await blind.start();
            })
        );

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

        const callbacks = [...this.devicesByMac.values()].map(async device => {
            await device.stop();
        });

        await Promise.all(callbacks);
    }
}
