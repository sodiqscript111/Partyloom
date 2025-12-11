import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private publisher: RedisClientType;
    private subscriber: RedisClientType;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        this.publisher = createClient({ url: redisUrl });
        this.subscriber = this.publisher.duplicate();

        await this.publisher.connect();
        await this.subscriber.connect();

        console.log('🔴 Redis connected!');
    }

    async onModuleDestroy() {
        await this.publisher.quit();
        await this.subscriber.quit();
    }

    async get(key: string): Promise<string | null> {
        return this.publisher.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.publisher.setEx(key, ttlSeconds, value);
        } else {
            await this.publisher.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.publisher.del(key);
    }

    async publish(channel: string, message: object): Promise<void> {
        await this.publisher.publish(channel, JSON.stringify(message));
    }

    async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
        await this.subscriber.subscribe(channel, (message) => {
            callback(JSON.parse(message));
        });
    }
}
