import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import merge from 'lodash.merge';

const filename = 'homie-motionblinds.yaml';

export type Settings = {
    mqtt: {
        host: string;
        port: number;
        base_topic: string;
        auth: boolean;
    },
    motionblinds: {
        apiKey: string
    },
    logger: {
        level: 'debug' | 'info' | 'notice' | 'warn' | 'error',
    },
};

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

const defaults: DeepPartial<Settings> = {
    mqtt: {
        host: 'localhost',
        port: 1883,
        base_topic: 'devices/ring/',
        auth: false
    },
    motionblinds: {},
    logger: {
        level: 'info'
    }
};

let settings: Settings | null = null;

export async function getSettings(): Promise<Settings> {
    if (settings === null) {
        settings = merge({}, defaults, await load());;
    }

    return settings;
}

async function load() {
    const configPath = getConfigPath();
    const configFile = await fs.promises.readFile(configPath, {encoding: 'utf8'});
    return yaml.safeLoad(configFile);
}

function getConfigPath() {
    let configPath: string | null = null;
    
    if (process.env.HOMIE_MOTIONBLINDS_CONFIG) {
        configPath = process.env.HOMIE_MOTIONBLINDS_CONFIG;
    } else {
        configPath = path.join(__dirname, '..', 'config');
        configPath = path.normalize(configPath);
    }

    console.log('using config path:', configPath);

    return path.join(configPath, filename);
}
