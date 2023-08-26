import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { UpdateFlashcardDto } from './dto/update-flashcard.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFlashcards } from './flashcards.interface';
import { v4 as uuidv4 } from 'uuid';
import { ClientProxy } from '@nestjs/microservices';
import { CreateCardEvent } from './create-card.event';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectModel('Flashcard') private flashcardModel: Model<IFlashcards>,
    @Inject('COMMUNICATION') private readonly communicationClient: ClientProxy,
  ) {}

  async create(createFlashcardDto: CreateFlashcardDto): Promise<IFlashcards> {
    let newFlashcard;
    try {
      newFlashcard = await this.flashcardModel.create({
        ...createFlashcardDto,
        shareCode: uuidv4(),
        shareLink: `http://localhost:3001/flashcards/share/${uuidv4()}`,
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error saving flash card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    this.communicationClient.emit(
      'card_created',
      new CreateCardEvent(
        newFlashcard.title,
        newFlashcard.description,
        newFlashcard.shareLink,
        newFlashcard.attribute,
      ),
    );

    return newFlashcard;
  }

  async findAll(): Promise<IFlashcards[]> {
    let existingCards;
    try {
      existingCards = await this.flashcardModel.find({});
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error getting flash cards',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return existingCards;
  }

  async findOne(id: string): Promise<IFlashcards> {
    let existingCard;
    try {
      existingCard = await this.flashcardModel.findById(id);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error getting flash card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!existingCard) {
      throw new HttpException('No flash card found', HttpStatus.NOT_FOUND);
    }

    return existingCard;
  }

  async findUserCards(userId: string): Promise<IFlashcards[]> {
    let userCards;
    try {
      userCards = await this.flashcardModel.find({ userId: userId });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error getting flash cards',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return userCards;
  }

  async attributeCards(): Promise<IFlashcards[]> {
    let existingCards;
    try {
      existingCards = await this.flashcardModel.aggregate([
        { $group: { _id: { attribute: '$attribute' } } },
      ]);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error getting flash card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return existingCards;
  }

  async sharableCard(shareId: string): Promise<IFlashcards> {
    let existingCard;
    try {
      existingCard = await this.flashcardModel.findOne({ shareCode: shareId });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error getting flash card',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!existingCard) {
      throw new HttpException('No flash card found', HttpStatus.NOT_FOUND);
    }

    return existingCard;
  }

  async update(
    id: string,
    updateFlashcardDto: UpdateFlashcardDto,
  ): Promise<IFlashcards> {
    const filter = {};
    for (const [key, value] of Object.entries(updateFlashcardDto)) {
      filter[key] = value;
    }

    let updatedCard;
    try {
      updatedCard = await this.flashcardModel.findByIdAndUpdate(id, filter);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!updatedCard) {
      throw new HttpException('No flash card found', HttpStatus.NOT_FOUND);
    }

    this.communicationClient.emit(
      'card_updated',
      new CreateCardEvent(
        updatedCard.title,
        updatedCard.description,
        updatedCard.shareLink,
        updatedCard.attribute,
      ),
    );

    return updatedCard;
  }

  async remove(id: string) {
    let deletedCard;
    try {
      deletedCard = await this.flashcardModel.findByIdAndDelete(id);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error getting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!deletedCard) {
      throw new HttpException('No card found', HttpStatus.NOT_FOUND);
    }

    this.communicationClient.emit(
      'card_deleted',
      new CreateCardEvent(
        deletedCard.title,
        deletedCard.description,
        deletedCard.shareLink,
        deletedCard.attribute,
      ),
    );

    return deletedCard;
  }
}
