import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { fetchGithubUser, searchGithubUser } from "../api/github";
import UserCard from "./UserCard";
import RecentSearches from "./RecentSearches";
import { useDebounce } from "use-debounce";
import SuggestionDropdown from "./SuggestionsDropdown";
const UserSearch = () => {
  const [username, setUsername] = useState("");
  const [submittedUsername, setSubmittedUsername] = useState("");
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem("recentUsers");
    return stored ? JSON.parse(stored) : [];
  });
  const [debouncedUsername] = useDebounce(username, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

  //query to fetch specific user
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", submittedUsername],
    queryFn: async () => fetchGithubUser(submittedUsername),
    enabled: !!submittedUsername,
  });

  //query to fetch suggestions fro user search
  const { data: suggestions } = useQuery({
    queryKey: ["github-user-suggestions", debouncedUsername],
    queryFn: async () => searchGithubUser(debouncedUsername),
    enabled: debouncedUsername.length > 1,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedValue = username.trim();
    if (!trimmedValue) return;
    setSubmittedUsername(trimmedValue);
    setUsername("");
  };

  useEffect(() => {
    if (data && submittedUsername) {
      setRecentUsers((prev) => {
        const updated = [
          submittedUsername,
          ...prev.filter((u) => u !== submittedUsername),
        ];
        return updated.slice(0, 5);
      });
    }
  }, [data, submittedUsername]);

  useEffect(() => {
    localStorage.setItem("recentUsers", JSON.stringify(recentUsers));
  }, [recentUsers]);

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <div className="dropdown-wrapper">
          <input
            type="text"
            placeholder="Enter GitHub Username..."
            value={username}
            onChange={(e) => {
              const val = e.target.value;
              setUsername(val);
              setShowSuggestions(val.trim().length > 1);
            }}
          />
          {showSuggestions && suggestions?.length > 0 && (
            <SuggestionDropdown
              suggestions={suggestions}
              show={showSuggestions}
              onSelect={(selected) => {
                setShowSuggestions(false);
                if (submittedUsername !== selected) {
                  setSubmittedUsername(selected);
                } else {
                  refetch();
                }
              }}
            />
          )}
        </div>
        <button type="submit">Search</button>
      </form>
      {isLoading && <p className="status">Loading...</p>}
      {isError && <p className="status error">{error.message}</p>}
      {data && <UserCard user={data} />}
      {recentUsers.length > 0 && (
        <RecentSearches
          users={recentUsers}
          onSelect={(selectedUser) => {
            setUsername(selectedUser);
            setSubmittedUsername(selectedUser);
          }}
        />
      )}
    </>
  );
};

export default UserSearch;
