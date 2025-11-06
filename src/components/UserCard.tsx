import { FaGithub, FaUserMinus, FaUserPlus } from "react-icons/fa6";
import type { GitHubUser } from "../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkIfUserIsFollowed, followUser, unFollowUser } from "../api/github";
import { toast } from "sonner";

const UserCard = ({ user }: { user: GitHubUser }) => {
  const queryClient = useQueryClient();
  const queryKey = ["github-follow-check", user.login];

  const { data: isFollowing } = useQuery({
    queryKey,
    queryFn: async () => checkIfUserIsFollowed(user.login),
    enabled: !!user.login,
  });

  const followMutation = useMutation({
    mutationFn: async () => followUser(user.login),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prevValue = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, true);
      return { prevValue };
    },
    onSuccess: () => {
      toast.success(`You are now following ${user.login}`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err, variables, context) => {
      toast.error(err.message);
      if (context?.prevValue !== undefined) {
        queryClient.setQueryData(queryKey, context.prevValue);
      }
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => unFollowUser(user.login),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prevValue = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, false);
      return { prevValue };
    },
    onSuccess: () => {
      toast.success(`You have unfollowed ${user.login}`);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err, variables, context) => {
      toast.error(err.message);
      if (context?.prevValue !== undefined) {
        queryClient.setQueryData(queryKey, context.prevValue);
      }
    },
  });

  const handleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <div className="user-card">
      <img src={user.avatar_url} alt={user.login} className="avatar" />
      <h2>{user.name || user.login}</h2>
      <p className="bio">{user.bio}</p>
      <div className="user-card-buttons">
        <button
          onClick={handleFollow}
          className={`follow-btn ${isFollowing ? "following" : ""}`}
        >
          {isFollowing ? (
            <>
              <FaUserMinus className="follow-icon" /> Following
            </>
          ) : (
            <>
              <FaUserPlus className="follow-icon" /> Follow User
            </>
          )}
        </button>
        <a href={user.html_url} className="profile-btn" target="_blank">
          <FaGithub />
          View Github Profile
        </a>
      </div>
    </div>
  );
};

export default UserCard;
