import {
  // type CreatePostDislikeRequestDto,
  // type CreatePostDislikeResponseDto,
  type CreatePostReactionRequestDto,
  type CreatePostReactionResponseDto,
  type CreatePostRequestDto,
  type Post as TPost,
  // type PostDislike,
  type PostFilter,
  type PostReaction,
  type PostReactionRepository,
  type PostRepository,
  type PostService,
  type PostWithCommentImageUserNestedRelationsWithCount,
  type PostWithImageUserNestedRelationsWithCount
} from './libs/types/types.js';

type Constructor = {
  postRepository: PostRepository;
  postReactionRepository: PostReactionRepository;
};

class Post implements PostService {
  #postRepository: PostRepository;

  #postReactionRepository: PostReactionRepository;

  public constructor({ postRepository, postReactionRepository }: Constructor) {
    this.#postRepository = postRepository;
    this.#postReactionRepository = postReactionRepository;
  }

  public getByFilter(
    filter: PostFilter
  ): Promise<PostWithImageUserNestedRelationsWithCount[]> {
    return this.#postRepository.getByFilter(filter);
  }

  public getById(
    id: number
  ): Promise<PostWithCommentImageUserNestedRelationsWithCount | null> {
    return this.#postRepository.getById(id);
  }

  public create(userId: number, post: CreatePostRequestDto): Promise<TPost> {
    return this.#postRepository.create({
      ...post,
      userId
    });
  }

  public async setReaction(
    userId: number,
    { postId, isLike = true }: CreatePostReactionRequestDto
  ): Promise<CreatePostReactionResponseDto> {
    const updateOrDelete = (
      react: PostReaction
    ): Promise<PostReaction | number> => {
      return react.isLike === isLike
        ? this.#postReactionRepository.deleteById(react.id)
        : this.#postReactionRepository.updateById(react.id, { isLike });
    };

    const reaction = await this.#postReactionRepository.getByUserIdPostId(
      userId,
      postId
    );

    const result = reaction
      ? await updateOrDelete(reaction)
      : await this.#postReactionRepository.create({ userId, postId, isLike });

    // the result is an integer when an entity is deleted
    const resultReaction = await this.#postReactionRepository.getByUserIdPostId(
      userId,
      postId
    );

    return Number.isInteger(result)
      ? {}
      : (resultReaction as NonNullable<typeof resultReaction>);
  }

  // public async setDislike(
  //   userId: number,
  //   { postId, isDislike = true }: CreatePostDislikeRequestDto
  // ): Promise<CreatePostDislikeResponseDto> {
  //   const updateOrDelete = (): Promise<PostDislike | number> => {
  //     return dislike.isDislike === isDislike
  //       ? this.#postDislikeRepository.deleteById(dislike.id)
  //       : this.#postDislikeRepository.updateById(dislike.id, { isDislike });
  //   };

  //   const dislk = await this.#postDislikeRepository.getByUserIdPostId(
  //     userId,
  //     postId
  //   );

  //   const result = dislk
  //     ? await updateOrDelete(reaction)
  //     : await this.#postReactionRepository.create({
  //         userId,
  //         postId,
  //         isDislike
  //       });

  //   // the result is an integer when an entity is deleted
  //   const resultDislike = await this.#postDislikeRepository.getByUserIdPostId(
  //     userId,
  //     postId
  //   );

  //   return Number.isInteger(result)
  //     ? {}
  //     : (resultDislike as NonNullable<typeof resultDislike>);
  // }
}

export { Post };
