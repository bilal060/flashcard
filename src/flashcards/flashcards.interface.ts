import { Document } from 'mongoose';

export interface IFlashcards extends Document {
  readonly title: string;
  readonly description: string;
  readonly shareLink: string;
}
