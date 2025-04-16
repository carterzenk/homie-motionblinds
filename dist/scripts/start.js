"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const homie_motionblinds_1 = require("../homie-motionblinds");
const logger_1 = require("../logger");
const config_1 = require("../config");
const motionblinds_1 = require("motionblinds");
async function main() {
    const settings = await (0, config_1.getSettings)();
    const logger = (0, logger_1.createLogger)(settings.logger);
    const motionGateway = new motionblinds_1.MotionGateway({
        key: settings.motionblinds.apiKey,
    });
    const homieMotionblinds = new homie_motionblinds_1.HomieMotionBlinds(logger, settings, motionGateway);
    const onExit = () => homieMotionblinds.stop().then(process.exit());
    process.on('SIGINT', onExit);
    process.on('SIGTERM', onExit);
    await homieMotionblinds.start();
}
main();
//# sourceMappingURL=start.js.map