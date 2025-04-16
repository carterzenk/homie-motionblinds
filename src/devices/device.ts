import HomieDevice from 'homie-device';
import {Logger} from '../logger';
import {Settings} from '../config';
import {DEVICE_TYPES, DeviceStatus, DeviceType, MotionGateway} from 'motionblinds';

export abstract class Device {
    protected homieDevice: HomieDevice;

    constructor(
        protected logger: Logger,
        settings: Settings,
        protected motionGateway: MotionGateway,
        protected mac: string,
        protected deviceType: DeviceType,
        protected status: DeviceStatus,
    ) {
        this.logger = logger;
        this.publishData = this.publishData.bind(this);

        this.homieDevice = new HomieDevice({
            device_id: mac,
            name: DEVICE_TYPES[deviceType],
            mqtt: settings.mqtt,
        });

        this.homieDevice.on('connect', () => {
            this.publishData();
        });
    }

    protected abstract publishData(): void;

    updateData(status: DeviceStatus) {
        this.status = status;
        if (!this.homieDevice.isConnected) return;
        this.publishData();
    }

    async start(): Promise<void> {
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

    async stop(): Promise<void> {
        return new Promise((resolve) => {
            this.logger.debug('Disconnecting from MQTT broker for {deviceId}...', {
                deviceId: this.mac,
            });
        
            this.homieDevice.once('disconnect', resolve);
            this.homieDevice.end();
        });
    }
}