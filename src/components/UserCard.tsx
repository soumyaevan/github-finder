import { FaGithub } from "react-icons/fa6";
import type { GitHubUser } from "../types";

const UserCard = ({ user }: { user: GitHubUser }) => {
  return (
    <div className="user-card">
      <img src={user.avatar_url} alt={user.login} className="avatar" />
      <h2>{user.name}</h2>
      <p className="bio">{user.bio}</p>
      <a href={user.html_url} className="profile-btn" target="_blank">
        <FaGithub />
        View Github Profile
      </a>
    </div>
  );
};

export default UserCard;
