"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Blind = void 0;
const motionblinds_1 = require("motionblinds");
const device_1 = require("./device");
const u = __importStar(require("../u"));
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
};
const RadioProps = {
    WIRELESS_MODE: 'wireless_mode',
    RSSI: 'rssi',
};
const operationToMqtt = (operation) => {
    switch (operation) {
        case motionblinds_1.Operation.OpenUp:
            return 'OPEN';
        case motionblinds_1.Operation.CloseDown:
            return 'CLOSE';
        case motionblinds_1.Operation.Stop:
            return 'STOP';
        case motionblinds_1.Operation.StatusQuery:
            return 'STATUS';
        default:
            throw u.impossible(operation);
    }
};
const operationFromMqtt = (operation) => {
    switch (operation) {
        case 'OPEN':
            return motionblinds_1.Operation.OpenUp;
        case 'CLOSE':
            return motionblinds_1.Operation.CloseDown;
        case 'STOP':
            return motionblinds_1.Operation.Stop;
        case 'STATUS':
            return motionblinds_1.Operation.StatusQuery;
        default:
            throw new Error('Unknown operation: ' + operation);
    }
};
// Some values were not defined in motionblinds
var BlindTypeInternal;
(function (BlindTypeInternal) {
    BlindTypeInternal[BlindTypeInternal["RollerBlind"] = 1] = "RollerBlind";
    BlindTypeInternal[BlindTypeInternal["VenetianBlind"] = 2] = "VenetianBlind";
    BlindTypeInternal[BlindTypeInternal["RomanBlind"] = 3] = "RomanBlind";
    BlindTypeInternal[BlindTypeInternal["HoneycombBlind"] = 4] = "HoneycombBlind";
    BlindTypeInternal[BlindTypeInternal["ShangriLaBlind"] = 5] = "ShangriLaBlind";
    BlindTypeInternal[BlindTypeInternal["RollerShutter"] = 6] = "RollerShutter";
    BlindTypeInternal[BlindTypeInternal["RollerGate"] = 7] = "RollerGate";
    BlindTypeInternal[BlindTypeInternal["Awning"] = 8] = "Awning";
    BlindTypeInternal[BlindTypeInternal["TopDownBottomUp"] = 9] = "TopDownBottomUp";
    BlindTypeInternal[BlindTypeInternal["DayNightBlind"] = 10] = "DayNightBlind";
    BlindTypeInternal[BlindTypeInternal["DimmingBlind"] = 11] = "DimmingBlind";
    BlindTypeInternal[BlindTypeInternal["Curtain"] = 12] = "Curtain";
    BlindTypeInternal[BlindTypeInternal["CurtainLeft"] = 13] = "CurtainLeft";
    BlindTypeInternal[BlindTypeInternal["CurtainRight"] = 14] = "CurtainRight";
    BlindTypeInternal[BlindTypeInternal["DoubleRoller"] = 17] = "DoubleRoller";
    BlindTypeInternal[BlindTypeInternal["NaturalBlind"] = 40] = "NaturalBlind";
    BlindTypeInternal[BlindTypeInternal["Switch"] = 43] = "Switch";
})(BlindTypeInternal || (BlindTypeInternal = {}));
const enumKeyForValue = (obj, value) => {
    for (const [key, enumValue] of Object.entries(obj)) {
        if (enumValue === value) {
            return key;
        }
    }
    throw new Error('Unknown value for enum: ' + value);
};
class Blind extends device_1.Device {
    blindNode;
    batteryNode;
    radioNode;
    constructor(logger, settings, motionGateway, mac, deviceType, status) {
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
            this.motionGateway.writeDevice(this.mac, this.deviceType, { operation });
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
        const blindType = enumKeyForValue(BlindTypeInternal, this.status.type);
        this.blindNode.setProperty(BlindProps.TYPE).send(blindType);
        const operation = operationToMqtt(this.status.operation);
        this.blindNode.setProperty(BlindProps.OPERATION).send(operation);
        this.blindNode.setProperty(BlindProps.POSITION).send(this.status.currentPosition.toString());
        this.blindNode.setProperty(BlindProps.ANGLE).send(this.status.currentAngle.toString());
        const limitsState = enumKeyForValue(motionblinds_1.LimitsState, this.status.currentState);
        this.blindNode.setProperty(BlindProps.STATE).send(limitsState);
        const batteryLevel = Math.round(this.status.batteryLevel / 10).toString();
        this.batteryNode.setProperty(BatteryProps.LEVEL).send(batteryLevel);
        const voltageMode = enumKeyForValue(motionblinds_1.VoltageMode, this.status.voltageMode);
        this.batteryNode.setProperty(BatteryProps.VOLTAGE_MODE).send(voltageMode);
        this.radioNode.setProperty(RadioProps.RSSI).send(this.status.RSSI.toString());
        const wirelessMode = enumKeyForValue(motionblinds_1.WirelessMode, this.status.wirelessMode);
        this.radioNode.setProperty(RadioProps.WIRELESS_MODE).send(wirelessMode);
    }
}
exports.Blind = Blind;
//# sourceMappingURL=blind.js.map