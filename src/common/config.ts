import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

class Config {
  private config: ConfigService;
  constructor() {
    this.config = new ConfigService();
  }

  public get<T = any>(propertyPath: string, defaultValue?: T) {
    return this.config.get(propertyPath, defaultValue);
  }

  public getDatabaseOptions(): TypeOrmModuleOptions {
    return {
      type: this.get('DB_TYPE'),
      host: this.get('DB_HOST'),
      port: this.get('DB_PORT'),
      username: this.get('DB_USERNAME'),
      password: this.get('DB_PASSWORD'),
      database: this.get('DB_NAME'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    };
  }

  public getTimeExpire() {
    return this.get<number>('EXPIRED');
  }

  public telegramToken(): string {
    return this.get('TELEGRAM_TOKEN');
  }
}

export const config = new Config();
