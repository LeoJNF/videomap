import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function parseBoolean(value: string | boolean | undefined, fallback: boolean) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;

  return fallback;
}

function buildSslConfig(configService: ConfigService) {
  const sslEnabled = parseBoolean(
    configService.get<string>('DB_SSL'),
    Boolean(configService.get<string>('DATABASE_URL')),
  );

  if (!sslEnabled) {
    return false;
  }

  const rejectUnauthorized = parseBoolean(
    configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED'),
    false,
  );

  const caCertPath = configService.get<string>('DB_CA_CERT_PATH');

  if (!caCertPath) {
    return { rejectUnauthorized };
  }

  const resolvedPath = resolve(process.cwd(), caCertPath);

  return {
    rejectUnauthorized,
    ca: readFileSync(resolvedPath, 'utf8'),
  };
}

export function buildDatabaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const entities = [resolve(__dirname, '..', '**', '*.entity{.ts,.js}')];
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const dbType = configService.get<string>(
    'DB_TYPE',
    databaseUrl ? 'postgres' : 'sqljs',
  );
  const synchronize = parseBoolean(
    configService.get<string>('DB_SYNCHRONIZE'),
    dbType === 'sqljs',
  );
  const logging = parseBoolean(
    configService.get<string>('DB_LOGGING'),
    false,
  );

  if (dbType === 'sqljs') {
    return {
      type: 'sqljs',
      location: resolve(
        process.cwd(),
        configService.get<string>('SQLJS_LOCATION', 'videomap-local.sqlite'),
      ),
      autoSave: true,
      entities,
      synchronize,
      logging,
    };
  }

  const sharedConfig = {
    type: 'postgres' as const,
    entities,
    synchronize,
    logging,
    ssl: buildSslConfig(configService),
  };

  if (databaseUrl) {
    return {
      ...sharedConfig,
      url: databaseUrl,
    };
  }

  return {
    ...sharedConfig,
    host: configService.get<string>('DB_HOST'),
    port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
  };
}
