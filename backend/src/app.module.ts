import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BoardsModule } from './boards/boards.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conexión a MongoDB
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/kanban-board',
    ),

    // Módulos de la aplicación
    BoardsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
