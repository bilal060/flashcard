export class CreateCardEvent {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly shareLink: string,
    public readonly attribute: string,
  ) {}
}
