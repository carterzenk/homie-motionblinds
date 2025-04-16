import {Logger} from '../logger';
import {Settings} from '../config';
import {DeviceStatus, DeviceType, MotionGateway} from 'motionblinds';
import {Device} from './device';
import {HomieNode} from 'homie-device';

const BlindProps = {
    TYPE: 'type',
    OPERATION: 'operation',
    POSITION: 'position',
    ANGLE: 'angle',
    STATE: 'state',
};

const BatteryProps = {  
    VOLTAGE_MODE: 'voltage_mode',
    LEVEL: 'level',
}

const RadioProps = {
    WIRELESS_MODE: 'wireless_mode',
    RSSI: 'rssi',
}

export class Blind extends Device {
    private blindNode: HomieNode;
    private batteryNode: HomieNode;
    private radioNode: HomieNode;

    constructor(
        logger: Logger,
        settings: Settings,
        motionGateway: MotionGateway,
        mac: string,
        deviceType: DeviceType,
        status: DeviceStatus,
    ) {
        super(logger, settings, motionGateway, mac, deviceType, status);

        this.blindNode = this.homieDevice.node('blind', 'Blind', 'motion');
        this
            .blindNode
            .advertise(BlindProps.TYPE)
            .setName("Blind Type")
            .setRetained(true)
            .setDatatype('integer');

        this
            .blindNode
            .advertise(BlindProps.OPERATION)
            .setName("Operation")
            .setRetained(true)
            .setDatatype('integer')
            .settable((_range, value) => {
                const intValue = parseInt(value);
                if (isNaN(intValue) || intValue < 0 || intValue > 3) {
                    this.logger.error("Invalid operation value: {value}", {
                        value: intValue,
                    });
                    return;
                }
                this.motionGateway.writeDevice(this.mac, this.deviceType, {operation: intValue});
            });

        this
            .blindNode
            .advertise(BlindProps.POSITION)
            .setName("Position")
            .setRetained(true)
            .setDatatype('integer');

        this
            .blindNode
            .advertise(BlindProps.ANGLE)
            .setName("Angle")
            .setRetained(true)
            .setDatatype('integer');

        this
            .blindNode
            .advertise(BlindProps.STATE)
            .setName("State")
            .setRetained(true)
            .setDatatype('integer');

        this.batteryNode = this.homieDevice.node('battery', 'Battery');
        this
            .batteryNode
            .advertise(BatteryProps.LEVEL)
            .setName("Level")
            .setRetained(true)
            .setDatatype('integer');

        this
            .batteryNode
            .advertise(BatteryProps.VOLTAGE_MODE)
            .setName("Volatage Mode")
            .setRetained(true)
            .setDatatype('integer');

        this.radioNode = this.homieDevice.node('radio', 'Radio');
        this
            .radioNode
            .advertise(RadioProps.RSSI)
            .setName("RSSI")
            .setRetained(true)
            .setDatatype('integer');

        this
            .radioNode
            .advertise(RadioProps.WIRELESS_MODE)
            .setName("Wireless Mode")
            .setRetained(true)
            .setDatatype('integer');
    }

    publishData() {
        this.blindNode.setProperty(BlindProps.TYPE).send(this.status.type.toString());
        this.blindNode.setProperty(BlindProps.OPERATION).send(this.status.operation.toString());
        this.blindNode.setProperty(BlindProps.POSITION).send(this.status.currentPosition.toString());
        this.blindNode.setProperty(BlindProps.ANGLE).send(this.status.currentAngle.toString());
        this.blindNode.setProperty(BlindProps.STATE).send(this.status.currentState.toString());
        this.batteryNode.setProperty(BatteryProps.LEVEL).send(this.status.batteryLevel.toString());
        this.batteryNode.setProperty(BatteryProps.VOLTAGE_MODE).send(this.status.voltageMode.toString());
        this.radioNode.setProperty(RadioProps.RSSI).send(this.status.RSSI.toString());
        this.radioNode.setProperty(RadioProps.WIRELESS_MODE).send(this.status.wirelessMode.toString());
    }
}
