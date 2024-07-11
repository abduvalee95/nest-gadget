import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';


async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(new LoggingInterceptor());

	app.enableCors({ origin: true, credentials: true });
	app.use(graphqlUploadExpress({ maxFileSize: 11500000, maxFile: 10 })); //** miqdori va nechta yuklash kkligni yozdik */
	
	app.use('/uploads', express.static('./uploads')); //**Tashqi olamga static folder Sifatida ochib berdik */
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();

