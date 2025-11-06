import { useQueryClient } from "@tanstack/react-query";
import { FaClock, FaUser } from "react-icons/fa6";
import { fetchGithubUser } from "../api/github";

type RecentSearchProps = {
  users: string[];
  onSelect: (username: string) => void;
};

const RecentSearches = ({ users, onSelect }: RecentSearchProps) => {
  const queryClient = useQueryClient();
  return (
    <div className="recent-searches">
      <div className="recent-header">
        <FaClock />
        <h3>Recent Searches</h3>
      </div>
      <ul>
        {users.map((user) => (
          <li key={user}>
            <button
              onClick={() => onSelect(user)}
              onMouseEnter={() => {
                queryClient.prefetchQuery({
                  queryKey: ["users", user],
                  queryFn: () => fetchGithubUser(user),
                  staleTime: 45000,
                });
              }}
            >
              <FaUser className="user-icon" />
              {user}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSearches;
