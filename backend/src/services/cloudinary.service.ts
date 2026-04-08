import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

const DEFAULT_DEMO_VIDEO_URL =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const DEFAULT_DEMO_IMAGE_URL =
  'https://placehold.co/400x400/0F172A/F97316?text=VideoMap';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly cloudName: string | undefined;
  private readonly apiKey: string | undefined;
  private readonly apiSecret: string | undefined;
  private readonly localDemoMode: boolean;
  private readonly cloudinaryConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    this.apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
    this.localDemoMode =
      this.configService.get<string>('LOCAL_DEMO_MODE') === 'true' ||
      this.configService.get<string>('DB_TYPE') === 'sqljs';
    this.cloudinaryConfigured = Boolean(
      this.cloudName && this.apiKey && this.apiSecret,
    );

    if (this.cloudinaryConfigured) {
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
      });
      return;
    }

    this.logger.warn(
      'Cloudinary nao configurado. Uploads usarao URLs demo enquanto o modo local estiver ativo.',
    );
  }

  private get demoVideoUrl() {
    return (
      this.configService.get<string>('LOCAL_DEMO_VIDEO_URL') ||
      DEFAULT_DEMO_VIDEO_URL
    );
  }

  private get demoImageUrl() {
    return (
      this.configService.get<string>('LOCAL_DEMO_IMAGE_URL') ||
      DEFAULT_DEMO_IMAGE_URL
    );
  }

  async uploadVideo(file?: Express.Multer.File): Promise<string> {
    if (!file) {
      if (this.localDemoMode) {
        return this.demoVideoUrl;
      }
      throw new BadRequestException('Envie um video no campo "video"');
    }

    if (!this.cloudinaryConfigured) {
      return this.demoVideoUrl;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: 'videomap',
          eager: [
            { width: 800, height: 600, crop: 'limit', format: 'mp4' },
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteVideo(publicId: string): Promise<void> {
    if (!this.cloudinaryConfigured) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  }

  async uploadImage(file?: Express.Multer.File): Promise<string> {
    if (!file) {
      if (this.localDemoMode) {
        return this.demoImageUrl;
      }
      throw new BadRequestException('Nenhuma imagem foi enviada');
    }

    if (!this.cloudinaryConfigured) {
      return this.demoImageUrl;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'videomap/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        },
      );

      uploadStream.end(file.buffer);
    });
  }
}
