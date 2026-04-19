import Image from "next/image";


export type CommentType = {
  _id: string;
  content: string;
  createdAt: string;
  isEdited: boolean;
  userId: {
    _id: string;
    username: string;
    fullName: string;
    profilePicture: string;
  };
};

export function Comment({ comment }: { comment: CommentType }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Image
        src={comment.userId.profilePicture}
        alt={comment.userId.username}
        width={36}
        height={36}
        className="rounded-full object-cover"
      />

      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-white">
          {comment.userId.fullName || comment.userId.username}
        </p>

        <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-3 py-2">
          <p className="text-sm text-zinc-200 leading-relaxed">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span>
            {new Date(comment.createdAt).toLocaleString()}
          </span>
          {comment.isEdited && (
            <span className="italic text-zinc-400">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
}



export function CommentsList({ comments }: { comments: CommentType[] }) {
  const commentList = comments || [];
  return (
    <div className="space-y-2">
      {commentList.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">No comments yet. Be the first to comment!</p>
       ) : (      
      commentList.map((c) => (
        <Comment key={c._id} comment={c} />
      ))
       )}
    </div>
  );
}