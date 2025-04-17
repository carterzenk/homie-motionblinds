import {Logger} from '../logger';
import {Settings} from '../config';
import {BlindType, DeviceStatus, DeviceType, LimitsState, MotionGateway, Operation, VoltageMode, WirelessMode} from 'motionblinds';
import {Device} from './device';
import {HomieNode} from 'homie-device';
import * as u from '../u';

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

const operationToMqtt = (operation: Operation): string => {
    switch (operation) {
        case Operation.OpenUp:
            return 'OPEN';
        case Operation.CloseDown:
            return 'CLOSE';
        case Operation.Stop:
            return 'STOP';
        case Operation.StatusQuery:
            return 'STATUS';
        default:
            throw u.impossible(operation);
    }
}

const operationFromMqtt = (operation: string): Operation => {
    switch (operation) {
        case 'OPEN':
            return Operation.OpenUp;
        case 'CLOSE':
            return Operation.CloseDown;
        case 'STOP':
            return Operation.Stop;
        case 'STATUS':
            return Operation.StatusQuery;
        default:
            throw new Error('Unknown operation: ' + operation);
    }
}

// Some values were not defined in motionblinds
enum BlindTypeInternal {
    RollerBlind = 1,
    VenetianBlind = 2,
    RomanBlind = 3,
    HoneycombBlind = 4,
    ShangriLaBlind = 5,
    RollerShutter = 6,
    RollerGate = 7,
    Awning = 8,
    TopDownBottomUp = 9,
    DayNightBlind = 10,
    DimmingBlind = 11,
    Curtain = 12,
    CurtainLeft = 13,
    CurtainRight = 14,
    DoubleRoller = 17,
    NaturalBlind = 40,
    Switch = 43
}

type EnumObject = {[key: string]: number | string};
type EnumValue<E extends EnumObject> = E extends {[key: string]: infer EnumValueType} ? EnumValueType : never;

const enumKeyForValue = <T extends EnumObject>(obj: T, value: EnumValue<T>): string => {
    for (const [key, enumValue] of Object.entries(obj)) {
        if (enumValue === value) {
            return key;
        }
    }
    throw new Error('Unknown value for enum: ' + value);
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
            .setDatatype('string');

        this
            .blindNode
            .advertise(BlindProps.OPERATION)
            .setName("Operation")
            .setRetained(true)
            .setDatatype('string')
            .settable((_range, value) => {
                const operation = operationFromMqtt(value);
                this.motionGateway.writeDevice(this.mac, this.deviceType, {operation});
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
            .setDatatype('string');

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
            .setDatatype('string');

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
            .setDatatype('string');
    }

    publishData() {
        const blindType = enumKeyForValue(BlindTypeInternal, this.status.type as any);
        this.blindNode.setProperty(BlindProps.TYPE).send(blindType);

        const operation = operationToMqtt(this.status.operation)
        this.blindNode.setProperty(BlindProps.OPERATION).send(operation);

        this.blindNode.setProperty(BlindProps.POSITION).send(this.status.currentPosition.toString());
        
        this.blindNode.setProperty(BlindProps.ANGLE).send(this.status.currentAngle.toString());

        const limitsState = enumKeyForValue(LimitsState, this.status.currentState);
        this.blindNode.setProperty(BlindProps.STATE).send(limitsState);

        const batteryLevel = Math.round(this.status.batteryLevel / 10).toString();
        this.batteryNode.setProperty(BatteryProps.LEVEL).send(batteryLevel);

        const voltageMode = enumKeyForValue(VoltageMode, this.status.voltageMode);
        this.batteryNode.setProperty(BatteryProps.VOLTAGE_MODE).send(voltageMode);

        this.radioNode.setProperty(RadioProps.RSSI).send(this.status.RSSI.toString());
        
        const wirelessMode = enumKeyForValue(WirelessMode, this.status.wirelessMode);
        this.radioNode.setProperty(RadioProps.WIRELESS_MODE).send(wirelessMode);
    }
}
