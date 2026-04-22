import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PdfModule } from './modules/pdf/pdf.module';
import { ChatModule } from './modules/chat/chat.module';
import configuration from './config/configuration';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URL'),

        connectionFactory: (connection) => {
          console.log("🔥 Mongoose connection readyState:", connection.readyState);

          connection.once('open', () => {
            console.log('✅ MongoDB connected (OPEN)');
          });

          connection.on('error', (err) => {
            console.error('❌ MongoDB error:', err);
          });

          return connection;
        },
      }),
    }),
    PdfModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }