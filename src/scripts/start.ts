import {HomieMotionBlinds} from '../homie-motionblinds';
import {createLogger} from '../logger';
import {getSettings} from '../config';
import {MotionGateway} from 'motionblinds';

async function main() {
    const settings = await getSettings();
    
    const logger = createLogger(settings.logger);

    const motionGateway = new MotionGateway({
        key: settings.motionblinds.apiKey,
    });

    const homieMotionblinds = new HomieMotionBlinds(logger, settings, motionGateway);

    const onExit = () => homieMotionblinds.stop().then(process.exit());
    process.on('SIGINT', onExit);
    process.on('SIGTERM', onExit);

    await homieMotionblinds.start();
}

main();
