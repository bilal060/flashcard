import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Flashcard {
  @Prop()
  userId: string;
  @Prop()
  title: string;
  @Prop()
  description: string;
  @Prop()
  shareCode: string;
  @Prop()
  shareLink: string;
  @Prop()
  attribute: string;
}
export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);
